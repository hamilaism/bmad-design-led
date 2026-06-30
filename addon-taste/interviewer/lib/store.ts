// Couche STOCKAGE agnostique — modèle « espace perso » (1 personne → N profils).
//   STORE=supabase → @supabase/supabase-js (SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY)
//   STORE=postgres → node-postgres (POSTGRES_URL) — n'importe quel Postgres (hébergé ou LOCAL)
//   STORE=none     → pas de persistance (espace désactivé ; fiche affichée/téléchargée)

import { createClient } from "@supabase/supabase-js";
import { Pool } from "pg";
import type { Verdict } from "@/lib/artefacts";

export type ProfileStatus = "empty" | "partial" | "done";
export type ProfileSummary = { agent: string; status: ProfileStatus; ficheVersion: number; updatedAt: string };
export type ProfileState = {
  transcript: string;
  verdicts: Verdict[];
  injections: any[];
  fiche: string | null;
  ficheVersion: number;
};
export type FicheExport = { person: string; agent: string; fiche: string | null; ficheVersion: number; updatedAt: string };

export interface Store {
  getPersonPinHash(name: string): Promise<string | null>; // null si la personne n'existe pas
  createPerson(name: string, pinHash: string): Promise<void>;
  listProfiles(name: string): Promise<ProfileSummary[]>;
  getProfile(name: string, agent: string): Promise<ProfileState | null>;
  upsertProfile(name: string, agent: string, s: ProfileState): Promise<void>;
  deleteProfile(name: string, agent: string): Promise<void>;
  exportAll(): Promise<FicheExport[]>; // opérateur : toutes les fiches de cette instance
}

function statusOf(r: { fiche_version?: number; transcript?: string; verdicts?: any[]; injections?: any[] }): ProfileStatus {
  if ((r.fiche_version ?? 0) > 0) return "done";
  if ((r.transcript && r.transcript.length > 0) || r.verdicts?.length || r.injections?.length) return "partial";
  return "empty";
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

// ── Adaptateur Supabase ──────────────────────────────────────────────
function supabaseStore(): Store {
  const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
  return {
    async getPersonPinHash(name) {
      const { data, error } = await sb.from("persons").select("pin_hash").eq("name", name).maybeSingle();
      if (error) {
        console.error("[store/supabase] lecture personne:", error.message);
        return null;
      }
      return data?.pin_hash ?? null;
    },
    async createPerson(name, pinHash) {
      const { error } = await sb.from("persons").insert({ name, pin_hash: pinHash });
      if (error) throw new Error(error.message);
    },
    async listProfiles(name) {
      const { data, error } = await sb
        .from("profiles")
        .select("agent, fiche_version, transcript, verdicts, injections, updated_at")
        .eq("person", name);
      if (error) {
        console.error("[store/supabase] liste profils:", error.message);
        return [];
      }
      return (data || []).map((r: any) => ({
        agent: r.agent,
        status: statusOf(r),
        ficheVersion: r.fiche_version,
        updatedAt: r.updated_at,
      }));
    },
    async getProfile(name, agent) {
      const { data, error } = await sb
        .from("profiles")
        .select("transcript, verdicts, injections, fiche, fiche_version")
        .eq("person", name)
        .eq("agent", agent)
        .maybeSingle();
      if (error || !data) return null;
      return {
        transcript: data.transcript || "",
        verdicts: data.verdicts || [],
        injections: data.injections || [],
        fiche: data.fiche ?? null,
        ficheVersion: data.fiche_version || 0,
      };
    },
    async upsertProfile(name, agent, s) {
      const { error } = await sb.from("profiles").upsert(
        {
          person: name,
          agent,
          transcript: s.transcript,
          verdicts: s.verdicts,
          injections: s.injections,
          fiche: s.fiche,
          fiche_version: s.ficheVersion,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "person,agent" }
      );
      if (error) throw new Error(error.message);
    },
    async deleteProfile(name, agent) {
      const { error } = await sb.from("profiles").delete().eq("person", name).eq("agent", agent);
      if (error) throw new Error(error.message);
    },
    async exportAll() {
      const { data, error } = await sb
        .from("profiles")
        .select("person, agent, fiche, fiche_version, updated_at")
        .order("person")
        .order("agent");
      if (error) {
        console.error("[store/supabase] export:", error.message);
        return [];
      }
      return (data || []).map((r: any) => ({
        person: r.person,
        agent: r.agent,
        fiche: r.fiche ?? null,
        ficheVersion: r.fiche_version,
        updatedAt: r.updated_at,
      }));
    },
  };
}

// ── Adaptateur Postgres direct (n'importe quel Postgres) ─────────────
function postgresStore(): Store {
  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  const needSsl = /sslmode=require/i.test(connectionString || "") || process.env.POSTGRES_SSL === "true";
  const pool = new Pool({ connectionString, ssl: needSsl ? { rejectUnauthorized: false } : undefined });
  return {
    async getPersonPinHash(name) {
      const { rows } = await pool.query("select pin_hash from persons where name=$1", [name]);
      return rows[0]?.pin_hash ?? null;
    },
    async createPerson(name, pinHash) {
      await pool.query("insert into persons (name, pin_hash) values ($1,$2)", [name, pinHash]);
    },
    async listProfiles(name) {
      const { rows } = await pool.query(
        "select agent, fiche_version, transcript, verdicts, injections, updated_at from profiles where person=$1",
        [name]
      );
      return rows.map((r: any) => ({
        agent: r.agent,
        status: statusOf({
          fiche_version: r.fiche_version,
          transcript: r.transcript,
          verdicts: r.verdicts,
          injections: r.injections,
        }),
        ficheVersion: r.fiche_version,
        updatedAt: r.updated_at,
      }));
    },
    async getProfile(name, agent) {
      const { rows } = await pool.query(
        "select transcript, verdicts, injections, fiche, fiche_version from profiles where person=$1 and agent=$2",
        [name, agent]
      );
      const r = rows[0];
      if (!r) return null;
      return {
        transcript: r.transcript || "",
        verdicts: r.verdicts || [],
        injections: r.injections || [],
        fiche: r.fiche ?? null,
        ficheVersion: r.fiche_version || 0,
      };
    },
    async upsertProfile(name, agent, s) {
      await pool.query(
        `insert into profiles (person, agent, transcript, verdicts, injections, fiche, fiche_version, updated_at)
         values ($1,$2,$3,$4,$5,$6,$7, now())
         on conflict (person, agent) do update set
           transcript=excluded.transcript, verdicts=excluded.verdicts, injections=excluded.injections,
           fiche=excluded.fiche, fiche_version=excluded.fiche_version, updated_at=now()`,
        [name, agent, s.transcript, JSON.stringify(s.verdicts), JSON.stringify(s.injections), s.fiche, s.ficheVersion]
      );
    },
    async deleteProfile(name, agent) {
      await pool.query("delete from profiles where person=$1 and agent=$2", [name, agent]);
    },
    async exportAll() {
      const { rows } = await pool.query(
        "select person, agent, fiche, fiche_version, updated_at from profiles order by person, agent"
      );
      return rows.map((r: any) => ({
        person: r.person,
        agent: r.agent,
        fiche: r.fiche ?? null,
        ficheVersion: r.fiche_version,
        updatedAt: r.updated_at,
      }));
    },
  };
}
