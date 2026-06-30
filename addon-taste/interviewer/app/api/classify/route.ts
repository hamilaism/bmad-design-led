// Classification ADAPTATIVE : à chaque tour, le modèle choisit le prochain écran à montrer
// (parmi le pool restant) selon les verdicts déjà donnés — il traque la contradiction, pousse
// l'axe sur lequel la personne penche — et livre une interprétation en direct de son goût.

import { complete } from "@/lib/llm";
import { AGENTS, agentTitle } from "@/lib/agents";
import { poolFor, artefactImageUrl } from "@/lib/pools";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "JSON invalide." }, { status: 400 });
  }
  const { agentId, accessCode, lang, history, shownIds } = body || {};

  if (process.env.ACCESS_CODE && accessCode !== process.env.ACCESS_CODE) {
    return Response.json({ error: "Code d'accès invalide." }, { status: 401 });
  }
  const agent = AGENTS[agentId];
  if (!agent) return Response.json({ error: "Agent inconnu." }, { status: 400 });

  const l = lang === "en" ? "en" : "fr";
  const pool = poolFor(agentId);
  if (!pool) return Response.json({ done: true, noPool: true }); // pas de pool visuel → le front gère le deck texte

  const shown = new Set(Array.isArray(shownIds) ? shownIds.filter((x: any) => typeof x === "string") : []);
  const remaining = pool.filter((a) => !shown.has(a.id));
  if (!remaining.length) return Response.json({ done: true });

  const hist: any[] = Array.isArray(history) ? history : [];
  const remainingDesc = remaining.map((a) => `- ${a.id} | axe: ${a.axis} | essence: ${a.essence[l]}`).join("\n");
  const histDesc = hist.length
    ? hist.map((h) => `- [${String(h.geste || "").toUpperCase()}] ${h.essence || h.id} → ${String(h.reason || "").trim() || "(sans raison)"}`).join("\n")
    : l === "en" ? "(nothing yet)" : "(rien encore)";

  const system =
    `Tu pilotes une classification de goût ADAPTATIVE pour ${agent.name} (${agentTitle(agent, l)}). ` +
    `La personne réagit à de VRAIS écrans de produits par « je garde / je jette / j'en vole un bout », avec une raison. ` +
    `Ton job : choisir le PROCHAIN écran le plus révélateur parmi les restants — traque une contradiction entre deux de ses verdicts, ` +
    `ou pousse l'axe sur lequel elle vient de pencher ; évite de répéter un axe déjà bien couvert. ` +
    (l === "en" ? "Write the interpretation in English." : "Écris l'interprétation en français.");

  const user =
    `Déjà réagi :\n${histDesc}\n\n` +
    `Écrans restants (choisis-en UN) :\n${remainingDesc}\n\n` +
    `Rends un JSON STRICT, rien d'autre : {"nextId":"<un id parmi les restants>","interpretation":"<une ligne, tranchante, sur son goût jusque-là ; vide si trop tôt>"}.`;

  let pick = remaining[0].id;
  let interpretation = "";
  try {
    const raw = await complete({ system, messages: [{ role: "user", content: user }], maxTokens: 300 });
    const m = raw.match(/\{[\s\S]*\}/);
    if (m) {
      const j = JSON.parse(m[0]);
      if (j.nextId && remaining.some((a) => a.id === j.nextId)) pick = j.nextId;
      if (typeof j.interpretation === "string") interpretation = j.interpretation.trim();
    }
  } catch {
    // repli silencieux : on garde le premier restant, sans interprétation
  }

  const a = remaining.find((x) => x.id === pick) || remaining[0];
  return Response.json({
    done: false,
    artefact: {
      id: a.id,
      app: a.app,
      imageUrl: artefactImageUrl(a.file),
      mobbinUrl: a.mobbinUrl,
      framing: a.framing[l],
      essence: a.essence[l],
    },
    interpretation,
    remaining: remaining.length - 1,
  });
}
