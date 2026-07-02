// Auth partagée des routes : parsing JSON + code d'accès + résolution personne/PIN.
// Une seule implémentation (au lieu de 3 variantes divergentes) qui :
//   - DISTINGUE « personne inconnue » (null) d'une erreur de lecture DB (throw) — pas de
//     bypass du PIN sur erreur transitoire ;
//   - encaisse la course à la création (contrainte unique) en relisant puis comparant ;
//   - RATE-LIMITE les tentatives de PIN (5 échecs / 15 min par prénom+IP). En serverless
//     le compteur est par instance — imperfection assumée : ça transforme un brute-force
//     de quelques minutes en opération coûteuse, pour une serrure à 10 000 combinaisons.

import type { Store } from "@/lib/store";
import { hashPin, validPinFormat } from "@/lib/pin";

export const NAME_MAX = 40;

export async function readJson(req: Request): Promise<any | null> {
  try {
    return await req.json();
  } catch {
    return null;
  }
}

export function accessDenied(body: any): boolean {
  return !!process.env.ACCESS_CODE && body?.accessCode !== process.env.ACCESS_CODE;
}

export function clientIp(req: Request): string {
  return (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "local";
}

// ── Rate-limit des PIN ────────────────────────────────────────────────
const MAX_FAILS = 5;
const LOCK_MS = 15 * 60 * 1000;
const failures = new Map<string, { count: number; first: number }>();

function rlKey(person: string, ip: string): string {
  return person.toLowerCase() + "|" + ip;
}
function rlLocked(key: string): boolean {
  const f = failures.get(key);
  if (!f) return false;
  if (Date.now() - f.first > LOCK_MS) {
    failures.delete(key);
    return false;
  }
  return f.count >= MAX_FAILS;
}
function rlFail(key: string) {
  const f = failures.get(key);
  if (!f || Date.now() - f.first > LOCK_MS) failures.set(key, { count: 1, first: Date.now() });
  else f.count++;
}

// ── Résolution personne + PIN ─────────────────────────────────────────
export type PersonAuth =
  | { ok: true; person: string; created: boolean }
  | { ok: false; status: number; error: string };

export async function resolvePerson(
  store: Store,
  rawName: unknown,
  pin: unknown,
  ip: string,
  opts: { create: boolean }
): Promise<PersonAuth> {
  const person = typeof rawName === "string" ? rawName.trim() : "";
  if (!person) return { ok: false, status: 400, error: "Prénom requis." };
  if (person.length > NAME_MAX) return { ok: false, status: 400, error: `Prénom trop long (max ${NAME_MAX}).` };
  if (!validPinFormat(pin)) return { ok: false, status: 400, error: "Code à 4 chiffres requis." };

  const key = rlKey(person, ip);
  if (rlLocked(key)) return { ok: false, status: 429, error: "Trop d'essais de code — réessaie dans 15 minutes." };

  let hash: string | null;
  try {
    hash = await store.getPersonPinHash(person);
  } catch (e: any) {
    console.error("[auth] lecture personne échouée:", e?.message);
    return { ok: false, status: 503, error: "Stockage indisponible — réessaie." };
  }

  if (hash === null) {
    if (!opts.create) return { ok: false, status: 404, error: "Espace inconnu." };
    try {
      await store.createPerson(person, hashPin(pin));
      return { ok: true, person, created: true };
    } catch {
      // Course à la création (contrainte unique) ou erreur : on relit et on compare.
      try {
        hash = await store.getPersonPinHash(person);
      } catch (e: any) {
        console.error("[auth] relecture après création échouée:", e?.message);
        return { ok: false, status: 503, error: "Stockage indisponible — réessaie." };
      }
      if (hash === null) return { ok: false, status: 503, error: "Stockage indisponible — réessaie." };
    }
  }

  if (hash !== hashPin(pin as string)) {
    rlFail(key);
    return { ok: false, status: 403, error: "Code de profil invalide." };
  }
  failures.delete(key);
  return { ok: true, person, created: false };
}
