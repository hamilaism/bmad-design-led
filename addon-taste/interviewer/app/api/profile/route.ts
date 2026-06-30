// Vérifie un profil au démarrage : le couple (agent, personne) existe-t-il déjà,
// et si oui, le PIN fourni correspond-il ? (Sans Supabase, le PIN n'est pas appliqué.)

import { getStore } from "@/lib/store";
import { hashPin, validPinFormat } from "@/lib/pin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "JSON invalide." }, { status: 400 });
  }
  const { agentId, interviewer, pin, accessCode } = body || {};

  if (process.env.ACCESS_CODE && accessCode !== process.env.ACCESS_CODE) {
    return Response.json({ error: "Code d'accès invalide." }, { status: 401 });
  }
  if (!agentId || typeof interviewer !== "string" || !interviewer.trim()) {
    return Response.json({ error: "Profil incomplet." }, { status: 400 });
  }
  if (!validPinFormat(pin)) {
    return Response.json({ error: "Choisis un code à 4 chiffres." }, { status: 400 });
  }

  const store = getStore();
  if (!store) {
    // Pas de persistance configurée → on ne peut pas appliquer le verrou ; on laisse passer.
    return Response.json({ exists: false, ok: true, persisted: false });
  }

  const hash = await store.getProfilePinHash(agentId, interviewer.trim());
  if (hash === null) return Response.json({ exists: false, ok: true });
  return Response.json({ exists: true, ok: hash === hashPin(pin) });
}
