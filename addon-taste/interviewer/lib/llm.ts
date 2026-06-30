// Couche modèle AGNOSTIQUE du provider.
// - LLM_PROVIDER=anthropic (défaut) → API Anthropic Messages (Opus 4.8 par défaut).
// - LLM_PROVIDER=openai            → n'importe quelle gateway compatible-OpenAI (ex. Thiga).
// Les routes ne parlent qu'à ce module. Basculer = changer des variables d'env, pas du code.

import { anthropic, MODEL } from "@/lib/anthropic";

const PROVIDER = (process.env.LLM_PROVIDER || "anthropic").toLowerCase();
const OPENAI_BASE_URL = (process.env.OPENAI_BASE_URL || "").replace(/\/+$/, "");
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "";

// Format des messages côté app = forme Anthropic (texte + image base64).
export type Part =
  | { type: "text"; text: string }
  | { type: "image"; source: { type: "base64"; media_type: string; data: string } };
export type Msg = { role: "user" | "assistant"; content: string | Part[] };

// Conversion vers le format chat OpenAI (system = message, image = image_url data-URL).
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
export function streamChat({
  system,
  messages,
  maxTokens = 1200,
}: {
  system: string;
  messages: Msg[];
  maxTokens?: number;
}): ReadableStream<Uint8Array> {
  const enc = new TextEncoder();

  if (PROVIDER === "openai") {
    return new ReadableStream({
      async start(controller) {
        try {
          const res = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
            method: "POST",
            headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              model: OPENAI_MODEL,
              messages: toOpenAIMessages(system, messages),
              stream: true,
              max_tokens: maxTokens,
            }),
          });
          if (!res.ok || !res.body) {
            controller.enqueue(enc.encode("\n\n[erreur serveur : " + res.status + " " + (await res.text()).slice(0, 160) + "]"));
            return;
          }
          const reader = res.body.getReader();
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
          controller.enqueue(enc.encode("\n\n[erreur serveur : " + (e?.message || "inconnue") + "]"));
        } finally {
          controller.close();
        }
      },
    });
  }

  // Anthropic
  return new ReadableStream({
    async start(controller) {
      try {
        const ant = await anthropic.messages.create({
          model: MODEL,
          max_tokens: maxTokens,
          system,
          messages: messages as any,
          stream: true,
        });
        for await (const event of ant) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(enc.encode(event.delta.text));
          }
        }
      } catch (e: any) {
        controller.enqueue(enc.encode("\n\n[erreur serveur : " + (e?.message || "inconnue") + "]"));
      } finally {
        controller.close();
      }
    },
  });
}

// Non-streaming → texte complet (pour /api/fiche ; supporte les images dans messages).
export async function complete({
  system,
  messages,
  maxTokens,
}: {
  system: string;
  messages: Msg[];
  maxTokens: number;
}): Promise<string> {
  if (PROVIDER === "openai") {
    const res = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: OPENAI_MODEL, messages: toOpenAIMessages(system, messages), max_tokens: maxTokens }),
    });
    if (!res.ok) throw new Error("Gateway " + res.status + " : " + (await res.text()).slice(0, 200));
    const j = await res.json();
    return j.choices?.[0]?.message?.content || "";
  }

  const res = await anthropic.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system,
    messages: messages as any,
  });
  return res.content.map((c: any) => (c.type === "text" ? c.text : "")).join("");
}

export const ACTIVE_MODEL =
  PROVIDER === "openai" ? `${OPENAI_MODEL} @ ${OPENAI_BASE_URL}` : MODEL;
