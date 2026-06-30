// Couche STOCKAGE agnostique — n'impose aucun service.
//   STORE=supabase → @supabase/supabase-js (SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY)
//   STORE=postgres → node-postgres (POSTGRES_URL) — n'importe quel Postgres : Neon, Railway, VPS, LOCAL
//   STORE=none     → pas de persistance (fiche affichée/téléchargée ; PIN non appliqué)
// Sans STORE explicite : auto-détecté depuis les variables d'env présentes.

import { createClient } from "@supabase/supabase-js";
import { Pool } from "pg";
import type { Verdict } from "@/lib/artefacts";

export type FicheRow = {
  agent: string;
  person: string | null;
  fiche: string;
  transcript: string;
  classification: Verdict[] | null;
  injection: any[] | null;
};

export interface Store {
  getProfilePinHash(agent: string, person: string): Promise<string | null>;
  upsertProfile(agent: string, person: string, pinHash: string): Promise<void>;
  insertFiche(row: FicheRow): Promise<void>;
}

function pick(): "supabase" | "postgres" | "none" {
  const explicit = (process.env.STORE || "").toLowerCase();
  if (explicit === "supabase" || explicit === "postgres" || explicit === "none") return explicit;
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) return "supabase";
  if (process.env.POSTGRES_URL || process.env.DATABASE_URL) return "postgres";
  return "none";
}

export const STORE_KIND = pick();

let cached: Store | null | undefined;
export function getStore(): Store | null {
  if (cached !== undefined) return cached;
  cached = STORE_KIND === "supabase" ? supabaseStore() : STORE_KIND === "postgres" ? postgresStore() : null;
  return cached;
}

// ── Adaptateur Supabase (PostgREST) ──────────────────────────────────
function supabaseStore(): Store {
  const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
  return {
    async getProfilePinHash(agent, person) {
      const { data, error } = await sb
        .from("profiles").select("pin_hash").eq("agent", agent).eq("person", person).maybeSingle();
      if (error) {
        console.error("[store/supabase] lecture profil:", error.message);
        return null;
      }
      return data?.pin_hash ?? null;
    },
    async upsertProfile(agent, person, pinHash) {
      const { error } = await sb
        .from("profiles")
        .upsert({ agent, person, pin_hash: pinHash, updated_at: new Date().toISOString() }, { onConflict: "agent,person" });
      if (error) console.error("[store/supabase] upsert profil:", error.message);
    },
    async insertFiche(r) {
      const { error } = await sb.from("fiches").insert({
        agent: r.agent,
        interviewer: r.person,
        fiche: r.fiche,
        transcript: r.transcript,
        classification: r.classification,
        injection: r.injection,
      });
      if (error) throw new Error(error.message);
    },
  };
}

// ── Adaptateur Postgres direct (n'importe quel Postgres) ─────────────
function postgresStore(): Store {
  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  const needSsl = /sslmode=require/i.test(connectionString || "") || process.env.POSTGRES_SSL === "true";
  const pool = new Pool({ connectionString, ssl: needSsl ? { rejectUnauthorized: false } : undefined });
  return {
    async getProfilePinHash(agent, person) {
      const { rows } = await pool.query("select pin_hash from profiles where agent=$1 and person=$2", [agent, person]);
      return rows[0]?.pin_hash ?? null;
    },
    async upsertProfile(agent, person, pinHash) {
      await pool.query(
        `insert into profiles (agent, person, pin_hash, updated_at) values ($1,$2,$3, now())
         on conflict (agent, person) do update set pin_hash=excluded.pin_hash, updated_at=now()`,
        [agent, person, pinHash]
      );
    },
    async insertFiche(r) {
      await pool.query(
        "insert into fiches (agent, interviewer, fiche, transcript, classification, injection) values ($1,$2,$3,$4,$5,$6)",
        [
          r.agent,
          r.person,
          r.fiche,
          r.transcript,
          r.classification ? JSON.stringify(r.classification) : null,
          r.injection ? JSON.stringify(r.injection) : null,
        ]
      );
    },
  };
}
