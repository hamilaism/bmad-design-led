// Entrer dans son espace : prénom + code d'accès + PIN → la liste de ses profils + états.
// Crée la personne si elle n'existe pas (le PIN devient son code).

import { getStore } from "@/lib/store";
import { readJson, accessDenied, clientIp, resolvePerson } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await readJson(req);
  if (!body) return Response.json({ error: "JSON invalide." }, { status: 400 });
  if (accessDenied(body)) return Response.json({ error: "Code d'accès invalide." }, { status: 401 });

  const store = getStore();
  if (!store) {
    // Pas de persistance : pas d'espace, on enchaîne directement (fiche affichée/téléchargée).
    return Response.json({ ok: true, persisted: false, profiles: [] });
  }

  const auth = await resolvePerson(store, body.name, body.pin, clientIp(req), { create: true });
  if (!auth.ok) return Response.json({ error: auth.error }, { status: auth.status });
  if (auth.created) return Response.json({ ok: true, created: true, profiles: [] });

  const profiles = await store.listProfiles(auth.person);
  return Response.json({ ok: true, profiles });
}
