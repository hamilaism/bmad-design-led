# Pattern — Gate « Experience Strategy Brief → PRD »

Le cœur de l'approche design-led : un **PRD ne descend pas d'une liste de features, il descend d'un Experience Strategy Brief**. Ce pattern câble cette règle en **vérification machine native** dans BMAD v6 — pas en simple phrase de persona.

## Le problème qu'il résout

Quand la règle « design-led » ne vit que dans le persona du PM (« pense expérience d'abord »), elle n'est gardée par aucune porte : rien n'empêche un PRD d'empiler des exigences orphelines. Le fork redevient *product-led avec une couche brand*. Ce pattern transforme la règle en **gate**.

## Comment ça marche (3 points d'ancrage natifs)

Les deux fichiers `.toml` sont des **overrides de workflow** BMAD (`_bmad/custom/`). Ils n'éditent jamais le cœur bmm — ils *append* sur les surfaces natives :

| Fichier | Surface native | Effet |
|---|---|---|
| `bmad-prd.toml` | `activation_steps_prepend` | À l'entrée du PRD : vérifie que le Brief existe, le cite, ou marque l'écart. |
| `bmad-prd.toml` | `persistent_facts` | Règle tenue tout du long : aucune exigence sans principe d'expérience parent. |
| `bmad-prd.toml` | `finalize_reviewers` | Au Finalize : un reviewer adversarial liste les exigences orphelines + rend un verdict. |
| `bmad-check-implementation-readiness.toml` | `activation_steps_prepend` | Au readiness : vérifie le red-thread essence → exigence → epic → story. |

## Installation

```bash
cp bmad-prd.toml                          <projet>/_bmad/custom/
cp bmad-check-implementation-readiness.toml <projet>/_bmad/custom/
```

Vérifier que l'override est bien résolu :

```bash
python3 <projet>/_bmad/scripts/resolve_customization.py \
  --skill <projet>/.claude/skills/bmad-prd --key workflow
```

## Régler le degré

Au stade exploratoire / solo, le gate **signale** (ne bloque pas en dur) — c'est volontaire. Pour un hard-block, transforme le point de readiness en critère bloquant de ton workflow de readiness. Le degré est un choix de projet.
