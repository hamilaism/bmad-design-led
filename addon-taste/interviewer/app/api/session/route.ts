// Entrer dans son espace : prénom + code d'accès + PIN → la liste de ses profils + états.
// Crée la personne si elle n'existe pas (le PIN devient son code).

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
  const { name, accessCode, pin } = body || {};

  if (process.env.ACCESS_CODE && accessCode !== process.env.ACCESS_CODE) {
    return Response.json({ error: "Code d'accès invalide." }, { status: 401 });
  }
  if (typeof name !== "string" || !name.trim()) {
    return Response.json({ error: "Mets ton prénom." }, { status: 400 });
  }
  if (!validPinFormat(pin)) {
    return Response.json({ error: "Choisis un code à 4 chiffres." }, { status: 400 });
  }

  const store = getStore();
  if (!store) {
    // Pas de persistance : pas d'espace, on enchaîne directement (fiche affichée/téléchargée).
    return Response.json({ ok: true, persisted: false, profiles: [] });
  }

  const person = name.trim();
  const hash = await store.getPersonPinHash(person);
  if (hash === null) {
    await store.createPerson(person, hashPin(pin));
    return Response.json({ ok: true, created: true, profiles: [] });
  }
  if (hash !== hashPin(pin)) {
    return Response.json({ error: "Ce prénom existe déjà — le code à 4 chiffres ne correspond pas." }, { status: 403 });
  }
  const profiles = await store.listProfiles(person);
  return Response.json({ ok: true, profiles });
}
