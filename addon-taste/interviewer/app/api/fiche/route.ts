import { anthropic, MODEL } from "@/lib/anthropic";
import { AGENTS, fichePrompt } from "@/lib/agents";
import { getSupabase } from "@/lib/supabase";

export const runtime = "nodejs";
export const maxDuration = 60; // plafond Vercel hobby ; passe à 300 si plan Pro

function renderTranscript(messages: any[]): string {
  return messages
    .map((m) => {
      const who = m.role === "user" ? "PERSONNE" : "INTERVIEWEUR";
      let text = "";
      if (typeof m.content === "string") text = m.content;
      else if (Array.isArray(m.content))
        text = m.content.map((c: any) => (c.type === "text" ? c.text : "[image jointe]")).join(" ");
      return who + " : " + text;
    })
    .join("\n\n");
}

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "JSON invalide." }, { status: 400 });
  }
  const { agentId, accessCode, messages, interviewer } = body || {};

  if (process.env.ACCESS_CODE && accessCode !== process.env.ACCESS_CODE) {
    return Response.json({ error: "Code d'accès invalide." }, { status: 401 });
  }
  const agent = AGENTS[agentId];
  if (!agent) return Response.json({ error: "Agent inconnu." }, { status: 400 });
  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: "Entretien vide." }, { status: 400 });
  }

  const transcript = renderTranscript(messages);
  let fiche = "";
  try {
    const res = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4000,
      system: fichePrompt(agent),
      messages: [
        {
          role: "user",
          content: "TRANSCRIPT DE L'ENTRETIEN :\n\n" + transcript + "\n\nProduis maintenant la fiche.",
        },
      ],
    });
    fiche = res.content.map((c: any) => (c.type === "text" ? c.text : "")).join("");
  } catch (e: any) {
    return Response.json({ error: "Génération échouée : " + (e?.message || "") }, { status: 500 });
  }

  const supabase = getSupabase();
  let stored = false;
  if (supabase) {
    const { error } = await supabase
      .from("fiches")
      .insert({ agent: agentId, interviewer: interviewer || null, fiche, transcript });
    stored = !error;
  }

  return Response.json({ fiche, stored });
}
