import { AGENTS, buildSystem } from "@/lib/agents";
import { streamChat } from "@/lib/llm";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return new Response("JSON invalide.", { status: 400 });
  }
  const { agentId, accessCode, messages, lang } = body || {};

  if (process.env.ACCESS_CODE && accessCode !== process.env.ACCESS_CODE) {
    return new Response("Code d'accès invalide.", { status: 401 });
  }
  const agent = AGENTS[agentId];
  if (!agent) return new Response("Agent inconnu.", { status: 400 });
  if (!Array.isArray(messages)) return new Response("Messages manquants.", { status: 400 });

  const l = lang === "en" ? "en" : "fr";
  // Borne l'historique côté serveur (payload/tokens) — un entretien réel n'approche
  // jamais 60 tours ; au-delà c'est un client anormal.
  const msgs = messages.slice(-60);

  // streamChat parle au provider actif (Anthropic ou gateway compatible-OpenAI).
  // Erreur de création (provider injoignable, 4xx/5xx) → vrai statut HTTP, rien
  // n'entre dans le transcript.
  let stream: ReadableStream<Uint8Array>;
  try {
    stream = await streamChat({ system: buildSystem(agent, l), messages: msgs, maxTokens: 1200, job: "interview" });
  } catch (e: any) {
    console.error("[chat] provider injoignable:", e?.message);
    return new Response("Le modèle est injoignable — réessaie dans un instant.", { status: 502 });
  }

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}
