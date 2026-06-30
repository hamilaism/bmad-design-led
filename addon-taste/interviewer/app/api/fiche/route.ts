import { complete } from "@/lib/llm";
import { AGENTS, fichePrompt } from "@/lib/agents";
import type { Verdict, Injection } from "@/lib/artefacts";
import { getStore } from "@/lib/store";
import { hashPin, validPinFormat } from "@/lib/pin";

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

function renderClassification(verdicts: Verdict[]): string {
  if (!Array.isArray(verdicts) || verdicts.length === 0) return "";
  const lines = verdicts
    .map((v) => `- [${(v.geste || "").toUpperCase()}] ${v.label}\n  → ${v.reason?.trim() || "(sans raison donnée)"}`)
    .join("\n");
  return "CLASSIFICATION — verdicts sur des artefacts proposés :\n" + lines;
}

function renderInjection(items: Injection[]): string {
  if (!Array.isArray(items) || items.length === 0) return "";
  const lines = items
    .map((i) => `- (${i.stance}) ${i.label} — ${i.why?.trim() || "(sans raison donnée)"}${i.image ? " [image jointe ci-dessous]" : ""}`)
    .join("\n");
  return "INJECTION — artefacts apportés par la personne :\n" + lines;
}

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "JSON invalide." }, { status: 400 });
  }
  const { agentId, accessCode, pin, messages, interviewer, classification, injection } = body || {};

  if (process.env.ACCESS_CODE && accessCode !== process.env.ACCESS_CODE) {
    return Response.json({ error: "Code d'accès invalide." }, { status: 401 });
  }
  const agent = AGENTS[agentId];
  if (!agent) return Response.json({ error: "Agent inconnu." }, { status: 400 });

  const msgs = Array.isArray(messages) ? messages : [];
  const verdicts: Verdict[] = Array.isArray(classification) ? classification : [];
  const injects: Injection[] = Array.isArray(injection) ? injection : [];

  if (msgs.length === 0 && verdicts.length === 0 && injects.length === 0) {
    return Response.json({ error: "Rien à distiller (ni entretien, ni classification, ni injection)." }, { status: 400 });
  }

  const person = typeof interviewer === "string" ? interviewer.trim() : "";
  const store = getStore();

  // Verrou de profil (PIN) AVANT de dépenser un appel modèle.
  if (store) {
    if (!validPinFormat(pin)) return Response.json({ error: "Code à 4 chiffres requis." }, { status: 400 });
    if (person) {
      const hash = await store.getProfilePinHash(agentId, person);
      if (hash !== null && hash !== hashPin(pin)) {
        return Response.json({ error: "Ce profil est protégé par un autre code." }, { status: 403 });
      }
    }
  }

  // Assemble le matériau, partie par partie.
  const parts: string[] = [];
  if (msgs.length > 0) parts.push("=== ENTRETIEN (déclaré) ===\n\n" + renderTranscript(msgs));
  const cls = renderClassification(verdicts);
  if (cls) parts.push("=== CLASSIFICATION (révélé) ===\n\n" + cls);
  const inj = renderInjection(injects);
  if (inj) parts.push("=== INJECTION (révélé actif) ===\n\n" + inj);

  // Contenu multimodal : texte + images injectées (pour que le distillateur les « voie »).
  const content: any[] = [{ type: "text", text: parts.join("\n\n") + "\n\nProduis maintenant la fiche." }];
  for (const i of injects) {
    if (i.image?.data && i.image?.media_type) {
      content.push({ type: "text", text: `Image injectée — « ${i.label} » (${i.stance}) :` });
      content.push({ type: "image", source: { type: "base64", media_type: i.image.media_type, data: i.image.data } });
    }
  }

  let fiche = "";
  try {
    fiche = await complete({
      system: fichePrompt(agent, interviewer?.trim() || undefined),
      messages: [{ role: "user", content }],
      maxTokens: 4000,
    });
  } catch (e: any) {
    return Response.json({ error: "Génération échouée : " + (e?.message || "") }, { status: 500 });
  }

  // Persistance optionnelle. On ne stocke PAS les base64 d'images (lourd) — juste les métadonnées.
  const injectionMeta = injects.map(({ image, ...rest }) => ({ ...rest, hasImage: !!image?.data }));
  let stored = false;
  let storeError = false;
  if (store) {
    try {
      // Pose/rafraîchit le verrou de profil (PIN déjà vérifié plus haut).
      if (person) await store.upsertProfile(agentId, person, hashPin(pin));
      await store.insertFiche({
        agent: agentId,
        person: person || null,
        fiche,
        transcript: parts.join("\n\n"),
        classification: verdicts.length ? verdicts : null,
        injection: injectionMeta.length ? injectionMeta : null,
      });
      stored = true;
    } catch (e: any) {
      // Stockage configuré mais l'écriture a échoué (souvent : schéma non joué).
      console.error("[fiche] persistance échouée:", e?.message);
      storeError = true;
    }
  }

  return Response.json({ fiche, stored, storeError });
}
