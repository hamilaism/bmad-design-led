// Génère (ou régénère) la fiche d'un profil. Accumule les inputs des passes successives :
// les nouveaux verdicts/injections s'ajoutent aux anciens, et la fiche est régénérée depuis TOUT.

import { complete } from "@/lib/llm";
import { AGENTS, fichePrompt } from "@/lib/agents";
import type { Verdict, Injection } from "@/lib/artefacts";
import { getStore } from "@/lib/store";
import { hashPin, validPinFormat } from "@/lib/pin";

export const runtime = "nodejs";
export const maxDuration = 60;

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

function renderClassification(verdicts: any[]): string {
  if (!verdicts.length) return "";
  return (
    "CLASSIFICATION — verdicts sur des artefacts proposés :\n" +
    verdicts.map((v) => `- [${(v.geste || "").toUpperCase()}] ${v.label}\n  → ${v.reason?.trim() || "(sans raison)"}`).join("\n")
  );
}

function renderInjection(items: any[]): string {
  if (!items.length) return "";
  return (
    "INJECTION — artefacts apportés par la personne :\n" +
    items.map((i) => `- (${i.stance}) ${i.label} — ${i.why?.trim() || "(sans raison)"}${i.hasImage || i.image ? " [image]" : ""}`).join("\n")
  );
}

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "JSON invalide." }, { status: 400 });
  }
  const { agentId, accessCode, name, pin, messages, classification, injection, lang } = body || {};
  const l = lang === "en" ? "en" : "fr";

  if (process.env.ACCESS_CODE && accessCode !== process.env.ACCESS_CODE) {
    return Response.json({ error: "Code d'accès invalide." }, { status: 401 });
  }
  const agent = AGENTS[agentId];
  if (!agent) return Response.json({ error: "Agent inconnu." }, { status: 400 });

  const person = typeof name === "string" ? name.trim() : "";
  const store = getStore();

  // Identité / verrou.
  if (store) {
    if (!person) return Response.json({ error: "Prénom requis." }, { status: 400 });
    if (!validPinFormat(pin)) return Response.json({ error: "Code à 4 chiffres requis." }, { status: 400 });
    const hash = await store.getPersonPinHash(person);
    if (hash === null) await store.createPerson(person, hashPin(pin));
    else if (hash !== hashPin(pin)) return Response.json({ error: "Code de profil invalide." }, { status: 403 });
  }

  // Inputs de CETTE passe.
  const newMsgs = Array.isArray(messages) ? messages : [];
  const newVerdicts: Verdict[] = Array.isArray(classification) ? classification : [];
  const newInjects: Injection[] = Array.isArray(injection) ? injection : [];
  const newInjectsMeta = newInjects.map(({ image, ...rest }) => ({ ...rest, hasImage: !!image?.data }));

  // Fusion avec l'existant (accumulation).
  const prior = store && person ? await store.getProfile(person, agentId) : null;
  const newTranscript = newMsgs.length ? renderTranscript(newMsgs) : "";
  const mergedTranscript = [prior?.transcript || "", newTranscript].filter(Boolean).join("\n\n— (nouvelle passe) —\n\n");
  const mergedVerdicts = [...(prior?.verdicts || []), ...newVerdicts];
  const mergedInjections = [...(prior?.injections || []), ...newInjectsMeta];

  if (!mergedTranscript && mergedVerdicts.length === 0 && mergedInjections.length === 0) {
    return Response.json({ error: "Rien à distiller (ni entretien, ni classification, ni injection)." }, { status: 400 });
  }

  // Matériau pour le distillateur (inputs cumulés) + images de la passe en cours.
  const parts: string[] = [];
  if (mergedTranscript) parts.push("=== ENTRETIEN (déclaré) ===\n\n" + mergedTranscript);
  const cls = renderClassification(mergedVerdicts);
  if (cls) parts.push("=== CLASSIFICATION (révélé) ===\n\n" + cls);
  const inj = renderInjection(mergedInjections);
  if (inj) parts.push("=== INJECTION (révélé actif) ===\n\n" + inj);

  // Enrichissement : si une fiche existe déjà (passe précédente OU twin importé),
  // on la donne comme base à affiner — on ne repart jamais de zéro (sinon « enrichir »
  // un twin importé l'écraserait, puisque ses inputs bruts ne sont pas en base).
  const enriching = !!prior?.fiche?.trim();
  if (enriching) {
    parts.unshift(
      "=== FICHE ACTUELLE (base à enrichir — garde l'acquis, intègre les nouveaux signaux, ne repars pas de zéro) ===\n\n" +
        prior!.fiche
    );
  }

  const closing = enriching
    ? "\n\nProduis maintenant la fiche ENRICHIE : repars de la fiche actuelle, garde ce qui tient, intègre les nouveaux signaux ci-dessus, et n'invente rien que le matériau ne soutienne."
    : "\n\nProduis maintenant la fiche.";
  const content: any[] = [{ type: "text", text: parts.join("\n\n") + closing }];
  for (const i of newInjects) {
    if (i.image?.data && i.image?.media_type) {
      content.push({ type: "text", text: `Image injectée — « ${i.label} » (${i.stance}) :` });
      content.push({ type: "image", source: { type: "base64", media_type: i.image.media_type, data: i.image.data } });
    }
  }

  let fiche = "";
  try {
    fiche = await complete({
      system: fichePrompt(agent, person || undefined, l),
      messages: [{ role: "user", content }],
      maxTokens: 4000,
      job: "fiche",
    });
  } catch (e: any) {
    return Response.json({ error: "Génération échouée : " + (e?.message || "") }, { status: 500 });
  }
  if (!fiche.trim()) return Response.json({ error: "La fiche est revenue vide — réessaie." }, { status: 500 });

  // Sauvegarde (état accumulé + fiche, version incrémentée).
  let stored = false;
  let storeError = false;
  let version = prior?.ficheVersion || 0;
  if (store && person) {
    const next = version + 1;
    try {
      await store.upsertProfile(person, agentId, {
        transcript: mergedTranscript,
        verdicts: mergedVerdicts,
        injections: mergedInjections,
        fiche,
        ficheVersion: next,
      });
      stored = true;
      version = next;
    } catch (e: any) {
      console.error("[fiche] persistance échouée:", e?.message);
      storeError = true;
    }
  }

  return Response.json({ fiche, stored, storeError, version });
}
