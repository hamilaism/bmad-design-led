import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Service role = SERVEUR uniquement. Renvoie null si non configuré
// (l'app marche sans Supabase : la fiche est juste affichée, pas stockée).
export function getSupabase(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}
