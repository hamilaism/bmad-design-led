import { createHash } from "crypto";

// Le PIM identifie + protège un profil (prénom + code à 4 chiffres). Serrure douce
// (10 000 combinaisons) : on hash quand même côté serveur, jamais en clair.
// PIN_SALT (env) doit être posé en prod.

export function validPinFormat(pin: unknown): pin is string {
  return typeof pin === "string" && /^\d{4}$/.test(pin);
}

export function hashPin(pin: string): string {
  const salt = process.env.PIN_SALT || "taste-twin-default-salt";
  return createHash("sha256").update(salt + ":" + pin).digest("hex");
}
