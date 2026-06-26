#!/usr/bin/env bash
# Installe le PATTERN de gate design-led sur un projet ayant déjà BMAD v6 installé.
# (L'addon taste s'utilise séparément — voir addon-taste/README.md.)
# Usage : ./install.sh /chemin/vers/projet-cible
set -euo pipefail

TARGET="${1:?usage: ./install.sh <projet-cible-root>}"
HERE="$(cd "$(dirname "$0")" && pwd)"

if [ ! -d "$TARGET/_bmad" ]; then
  echo "✗ $TARGET n'a pas de _bmad/ — installe d'abord BMAD v6 (npx bmad-method install)." >&2
  exit 1
fi

mkdir -p "$TARGET/_bmad/custom"
cp "$HERE/pattern-experience-gate/bmad-prd.toml"                          "$TARGET/_bmad/custom/"
cp "$HERE/pattern-experience-gate/bmad-check-implementation-readiness.toml" "$TARGET/_bmad/custom/"

echo "✓ Gate design-led installé dans $TARGET/_bmad/custom/"
echo "  Il s'active dans les workflows bmad-prd et bmad-check-implementation-readiness."
echo "  Pour les agents : pars de templates/ — voir METHOD.md."
