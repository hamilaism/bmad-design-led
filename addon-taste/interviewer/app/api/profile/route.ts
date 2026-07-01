// LIRE un profil stocké (fiche comprise) sans rien régénérer — la personne revoit
// sa fiche sans re-payer une génération. Auth : espace existant + bon PIN.

import { AGENTS, VOICE_ID } from "@/lib/agents";
import { getStore } from "@/lib/store";
import { readJson, accessDenied, clientIp, resolvePerson } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await readJson(req);
  if (!body) return Response.json({ error: "JSON invalide." }, { status: 400 });
  if (accessDenied(body)) return Response.json({ error: "Code d'accès invalide." }, { status: 401 });

  const agentId = body.agentId;
  if (typeof agentId !== "string" || (!AGENTS[agentId] && agentId !== VOICE_ID)) {
    return Response.json({ error: "Agent inconnu." }, { status: 400 });
  }
  const store = getStore();
  if (!store) return Response.json({ error: "Pas de persistance sur cette instance." }, { status: 400 });

  const auth = await resolvePerson(store, body.name, body.pin, clientIp(req), { create: false });
  if (!auth.ok) return Response.json({ error: auth.error }, { status: auth.status });

  const p = await store.getProfile(auth.person, agentId);
  if (!p?.fiche?.trim()) return Response.json({ error: "Pas de fiche pour ce profil." }, { status: 404 });
  return Response.json({ fiche: p.fiche, version: p.ficheVersion });
}
