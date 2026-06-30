// Collecte OPÉRATEUR : toutes les fiches de CETTE instance.
// Protégé par OPERATOR_KEY (env). Un forkeur a sa propre clé sur sa propre DB → il ne collecte que la sienne.
//   JSON : /api/export?key=...           ·  Markdown groupé : /api/export?key=...&format=md

import { getStore } from "@/lib/store";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const key = url.searchParams.get("key") || "";
  const fmt = url.searchParams.get("format") || "json";

  if (!process.env.OPERATOR_KEY) {
    return new Response("Export non configuré (variable OPERATOR_KEY absente).", { status: 404 });
  }
  if (key !== process.env.OPERATOR_KEY) {
    return new Response("Clé opérateur invalide.", { status: 401 });
  }

  const store = getStore();
  if (!store) return Response.json({ count: 0, fiches: [] });

  const all = await store.exportAll();

  if (fmt === "md") {
    const md = all
      .filter((f) => f.fiche)
      .map((f) => `<!-- ${f.person} · ${f.agent} · v${f.ficheVersion} · ${f.updatedAt} -->\n\n${f.fiche}`)
      .join("\n\n---\n\n");
    return new Response(md || "(aucune fiche)", {
      headers: { "Content-Type": "text/markdown; charset=utf-8", "Content-Disposition": 'attachment; filename="fiches.md"' },
    });
  }
  return Response.json({ count: all.length, fiches: all });
}
