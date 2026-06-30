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
  // streamChat parle au provider actif (Anthropic ou gateway compatible-OpenAI).
  const stream = streamChat({ system: buildSystem(agent, l), messages, maxTokens: 1200 });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}
