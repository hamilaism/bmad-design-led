// Supprimer un profil de son espace (essai non pertinent, en cours ou fini).

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
  const { name, accessCode, pin, agentId } = body || {};

  if (process.env.ACCESS_CODE && accessCode !== process.env.ACCESS_CODE) {
    return Response.json({ error: "Code d'accès invalide." }, { status: 401 });
  }
  const person = typeof name === "string" ? name.trim() : "";
  if (!person || !agentId) return Response.json({ error: "Paramètres manquants." }, { status: 400 });
  if (!validPinFormat(pin)) return Response.json({ error: "Code à 4 chiffres requis." }, { status: 400 });

  const store = getStore();
  if (!store) return Response.json({ ok: true, persisted: false });

  const hash = await store.getPersonPinHash(person);
  if (hash !== null && hash !== hashPin(pin)) {
    return Response.json({ error: "Code de profil invalide." }, { status: 403 });
  }
  try {
    await store.deleteProfile(person, agentId);
    return Response.json({ ok: true });
  } catch (e: any) {
    return Response.json({ error: "Suppression échouée : " + (e?.message || "") }, { status: 500 });
  }
}
