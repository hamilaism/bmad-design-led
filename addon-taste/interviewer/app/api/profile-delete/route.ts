// Supprimer un profil de son espace (essai non pertinent, en cours ou fini).

import { getStore } from "@/lib/store";
import { readJson, accessDenied, clientIp, resolvePerson } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await readJson(req);
  if (!body) return Response.json({ error: "JSON invalide." }, { status: 400 });
  if (accessDenied(body)) return Response.json({ error: "Code d'accès invalide." }, { status: 401 });

  const agentId = body.agentId;
  if (!agentId || typeof agentId !== "string") return Response.json({ error: "Paramètres manquants." }, { status: 400 });

  const store = getStore();
  if (!store) return Response.json({ ok: true, persisted: false });

  // Pas de création ici : supprimer exige un espace existant ET le bon PIN.
  const auth = await resolvePerson(store, body.name, body.pin, clientIp(req), { create: false });
  if (!auth.ok) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await store.deleteProfile(auth.person, agentId);
    return Response.json({ ok: true });
  } catch (e: any) {
    return Response.json({ error: "Suppression échouée : " + (e?.message || "") }, { status: 500 });
  }
}
