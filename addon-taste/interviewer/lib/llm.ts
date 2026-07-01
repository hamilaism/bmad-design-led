// Couche modèle AGNOSTIQUE du provider, avec ROUTING PAR JOB.
// Chaque job (interview | fiche | classify) peut viser son propre provider+modèle :
//   MODEL_INTERVIEW=openai:gpt-5.5   MODEL_FICHE=openai:claude-sonnet-4.6   MODEL_CLASSIFY=openai:gpt-5.5
// Repli : LLM_PROVIDER (anthropic|openai) + ANTHROPIC_MODEL / OPENAI_MODEL.
// La posture éditoriale vit dans les PROMPTS (lib/agents.ts), pas ici → modèles interchangeables.

import { anthropic, MODEL } from "@/lib/anthropic";
import { STREAM_ERR } from "@/lib/stream";

const PROVIDER = (process.env.LLM_PROVIDER || "anthropic").toLowerCase();
const OPENAI_BASE_URL = (process.env.OPENAI_BASE_URL || "").replace(/\/+$/, "");
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "";

export type Job = "interview" | "fiche" | "classify";

// Résout provider+modèle pour un job (env MODEL_<JOB>="provider:model"), sinon repli global.
function resolve(job?: Job): { provider: string; model: string } {
  const raw = job ? (process.env["MODEL_" + job.toUpperCase()] || "").trim() : "";
  if (raw.includes(":")) {
    const i = raw.indexOf(":");
    return { provider: raw.slice(0, i).toLowerCase(), model: raw.slice(i + 1).trim() };
  }
  if (raw) return { provider: PROVIDER, model: raw };
  return { provider: PROVIDER, model: PROVIDER === "openai" ? OPENAI_MODEL : MODEL };
}

// Marge haute pour les modèles à raisonnement/thinking via gateway (ex. Claude via Thiga
// exige max_tokens > budget de thinking). C'est un PLAFOND, pas une consommation — mais
// il autorise un modèle bavard à dérouler : ajustable par l'opérateur (LLM_TOKEN_FLOOR).
const TOKEN_FLOOR = Number(process.env.LLM_TOKEN_FLOOR || 16000);
function floorTokens(mt: number): number {
  return Math.max(mt, TOKEN_FLOOR);
}

export type Part =
  | { type: "text"; text: string }
  | { type: "image"; source: { type: "base64"; media_type: string; data: string } };
export type Msg = { role: "user" | "assistant"; content: string | Part[] };

function toOpenAIMessages(system: string, messages: Msg[]): any[] {
  const out: any[] = [{ role: "system", content: system }];
  for (const m of messages) {
    if (typeof m.content === "string") {
      out.push({ role: m.role, content: m.content });
      continue;
    }
    const content = m.content.map((p) =>
      p.type === "text"
        ? { type: "text", text: p.text }
        : { type: "image_url", image_url: { url: `data:${p.source.media_type};base64,${p.source.data}` } }
    );
    out.push({ role: m.role, content });
  }
  return out;
}

// Streaming → flux d'octets texte (pour /api/chat).
// ASYNC : les erreurs de CRÉATION (auth, 4xx/5xx du provider, réseau) THROW avant le
// premier octet → la route peut répondre un vrai statut HTTP. Les erreurs EN COURS de
// stream (trop tard pour le statut) sont marquées par la sentinelle STREAM_ERR, que le
// client retire du transcript et affiche comme erreur.
export async function streamChat({
  system,
  messages,
  maxTokens = 1200,
  job,
}: {
  system: string;
  messages: Msg[];
  maxTokens?: number;
  job?: Job;
}): Promise<ReadableStream<Uint8Array>> {
  const enc = new TextEncoder();
  const { provider, model } = resolve(job);

  if (provider === "openai") {
    const res = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: toOpenAIMessages(system, messages),
        stream: true,
        max_tokens: floorTokens(maxTokens),
      }),
    });
    if (!res.ok || !res.body) {
      throw new Error("Gateway " + res.status + " : " + (await res.text()).slice(0, 200));
    }
    const reader = res.body.getReader();
    return new ReadableStream({
      async start(controller) {
        try {
          const dec = new TextDecoder();
          let buf = "";
          for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            buf += dec.decode(value, { stream: true });
            const lines = buf.split("\n");
            buf = lines.pop() || "";
            for (const line of lines) {
              const t = line.trim();
              if (!t.startsWith("data:")) continue;
              const data = t.slice(5).trim();
              if (!data || data === "[DONE]") continue;
              try {
                const j = JSON.parse(data);
                const d = j.choices?.[0]?.delta?.content;
                if (d) controller.enqueue(enc.encode(d));
              } catch {
                /* ligne SSE partielle ou keep-alive — on ignore */
              }
            }
          }
        } catch (e: any) {
          controller.enqueue(enc.encode(STREAM_ERR + (e?.message || "inconnue")));
        } finally {
          controller.close();
        }
      },
    });
  }

  // Anthropic — messages.create THROW sur 4xx/5xx, avant le premier octet.
  const ant = await anthropic.messages.create({
    model,
    max_tokens: maxTokens,
    system,
    messages: messages as any,
    stream: true,
  });
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const event of ant) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(enc.encode(event.delta.text));
          }
        }
      } catch (e: any) {
        controller.enqueue(enc.encode(STREAM_ERR + (e?.message || "inconnue")));
      } finally {
        controller.close();
      }
    },
  });
}

// Non-streaming → texte complet (pour /api/fiche, /api/classify ; supporte les images).
export async function complete({
  system,
  messages,
  maxTokens,
  job,
}: {
  system: string;
  messages: Msg[];
  maxTokens: number;
  job?: Job;
}): Promise<string> {
  const { provider, model } = resolve(job);

  if (provider === "openai") {
    const res = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, messages: toOpenAIMessages(system, messages), max_tokens: floorTokens(maxTokens) }),
    });
    if (!res.ok) throw new Error("Gateway " + res.status + " : " + (await res.text()).slice(0, 200));
    const j = await res.json();
    return j.choices?.[0]?.message?.content || "";
  }

  const res = await anthropic.messages.create({
    model,
    max_tokens: maxTokens,
    system,
    messages: messages as any,
  });
  return res.content.map((c: any) => (c.type === "text" ? c.text : "")).join("");
}
