import { anthropic, MODEL } from "@/lib/anthropic";
import { AGENTS, buildSystem } from "@/lib/agents";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return new Response("JSON invalide.", { status: 400 });
  }
  const { agentId, accessCode, messages } = body || {};

  if (process.env.ACCESS_CODE && accessCode !== process.env.ACCESS_CODE) {
    return new Response("Code d'accès invalide.", { status: 401 });
  }
  const agent = AGENTS[agentId];
  if (!agent) return new Response("Agent inconnu.", { status: 400 });
  if (!Array.isArray(messages)) return new Response("Messages manquants.", { status: 400 });

  const system = buildSystem(agent);
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const ant = await anthropic.messages.create({
          model: MODEL,
          max_tokens: 1200,
          system,
          messages,
          stream: true,
        });
        for await (const event of ant) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
      } catch (e: any) {
        controller.enqueue(encoder.encode("\n\n[erreur serveur : " + (e?.message || "inconnue") + "]"));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}
