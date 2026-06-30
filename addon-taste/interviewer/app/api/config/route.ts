// Config publique (non sensible) pour le bandeau de transparence côté client.
import { getStore } from "@/lib/store";

export const runtime = "nodejs";

export async function GET() {
  return Response.json({
    operatorName: process.env.OPERATOR_NAME || "",
    collected: getStore() !== null,
  });
}
