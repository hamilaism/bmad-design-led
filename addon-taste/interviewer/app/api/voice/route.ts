// L'AXE VOIX — distille la fiche de voix d'une PERSONNE depuis TOUS ses entretiens
// (tous métiers confondus) + raisons de verdicts + pourquoi d'injections.
// Contrairement à la fiche de goût (enrichie passe à passe), la voix se RÉGÉNÈRE
// toujours depuis le corpus complet : c'est l'invariant qu'on cherche.
// Rangée sous l'agent sentinelle VOICE_ID (même table profiles, aucun schéma à migrer).
// Méthode : ../../protocol/analyse-voix.md

import { complete } from "@/lib/llm";
import { AGENTS, VOICE_ID, voicePrompt } from "@/lib/agents";
import { getStore } from "@/lib/store";
import { readJson, accessDenied, clientIp, resolvePerson } from "@/lib/auth";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const body = await readJson(req);
  if (!body) return Response.json({ error: "JSON invalide." }, { status: 400 });
  const { lang, regen } = body;
  const l = lang === "en" ? "en" : "fr";

  if (accessDenied(body)) return Response.json({ error: "Code d'accès invalide." }, { status: 401 });
  const store = getStore();
  if (!store) {
    return Response.json(
      { error: "La fiche de voix agrège tes entretiens stockés — indisponible sans persistance (STORE=none)." },
      { status: 400 }
    );
  }
  const auth = await resolvePerson(store, body.name, body.pin, clientIp(req), { create: false });
  if (!auth.ok) return Response.json({ error: auth.error }, { status: auth.status });
  const person = auth.person;

  // Sans regen : renvoie la fiche existante si elle est là (consultation).
  const existing = await store.getProfile(person, VOICE_ID);
  if (!regen && existing?.fiche?.trim()) {
    return Response.json({ fiche: existing.fiche, version: existing.ficheVersion, stored: true });
  }

  // Corpus : tous les profils réels de la personne (la voix est l'invariant entre eux).
  const summaries = await store.listProfiles(person);
  const parts: string[] = [];
  let interviews = 0;
  const crafts: string[] = [];
  for (const s of summaries) {
    const agent = AGENTS[s.agent];
    if (!agent) continue; // ignore la sentinelle _voix et les ids inconnus
    const p = await store.getProfile(person, s.agent);
    if (!p) continue;
    const craft = l === "en" ? agent.titleEn : agent.title;
    if (p.transcript?.trim()) {
      interviews++;
      crafts.push(craft);
      parts.push(`=== ENTRETIEN — ${craft} ===\n\n${p.transcript}`);
    }
    const reasons = (p.verdicts || []).map((v: any) => v.reason?.trim()).filter(Boolean);
    if (reasons.length) parts.push(`=== RAISONS DE VERDICTS (hors tension) — ${craft} ===\n\n` + reasons.map((r: string) => `- ${r}`).join("\n"));
    const whys = (p.injections || []).map((i: any) => i.why?.trim()).filter(Boolean);
    if (whys.length) parts.push(`=== POURQUOI D'INJECTIONS (hors tension) — ${craft} ===\n\n` + whys.map((w: string) => `- ${w}`).join("\n"));
  }
  if (!parts.length) {
    return Response.json(
      { error: l === "en" ? "Nothing to distil — do at least one interview first." : "Rien à distiller — fais d'abord au moins un entretien." },
      { status: 400 }
    );
  }

  const version = (existing?.ficheVersion || 0) + 1;
  const closing =
    l === "en"
      ? `\n\nCorpus: ${interviews} interview(s) (${crafts.join(", ") || "—"}). Now produce the voice profile.`
      : `\n\nCorpus : ${interviews} entretien(s) (${crafts.join(", ") || "—"}). Produis maintenant la fiche de voix.`;

  let fiche = "";
  try {
    fiche = await complete({
      system: voicePrompt(person, version, l),
      messages: [{ role: "user", content: parts.join("\n\n") + closing }],
      maxTokens: 4000,
      job: "fiche",
    });
  } catch (e: any) {
    return Response.json({ error: "Génération échouée : " + (e?.message || "") }, { status: 500 });
  }
  if (!fiche.trim()) return Response.json({ error: "La fiche est revenue vide — réessaie." }, { status: 500 });

  let stored = false;
  try {
    await store.upsertProfile(person, VOICE_ID, {
      transcript: "",
      verdicts: [],
      injections: [],
      fiche,
      ficheVersion: version,
    });
    stored = true;
  } catch (e: any) {
    console.error("[voice] persistance échouée:", e?.message);
  }

  return Response.json({ fiche, version, stored });
}
