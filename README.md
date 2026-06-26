# bmad-design-led

Un **remix design-led de [BMAD](https://github.com/bmad-code-org/BMAD-METHOD) v6** — deux briques réutilisables à poser sur n'importe quel projet BMAD, plus la méthode qui les relie.

> BMAD est *product-led* par défaut : un PRD, des epics, des stories. Ce remix le rend **design-led** : l'expérience et la marque ne sont pas une couche de vernis en fin de course, elles sont la *source* dont descend le PRD. Le cœur de BMAD n'est jamais édité — tout passe par ses mécanismes d'override natifs.

## Ce qu'il y a dedans

| | Quoi |
|---|---|
| **`pattern-experience-gate/`** | Câble un gate *Experience Strategy Brief → PRD* en **vérif machine native** : aucune exigence sans principe d'expérience parent. Prepend d'activation + fait persistant + reviewer adversarial au finalize + red-thread au readiness. |
| **`addon-taste/`** | Donne à chaque agent un *jumeau de goût* : une app web + une méthode pour interviewer une vraie personne et capturer ses **penchants sur terrain contesté** (pas « plus de contexte » — du vrai goût), pour qu'un agent tranche comme cette personne le ferait. |
| **`templates/`** | Squelette générique d'un agent design-led + exemple d'enregistrement de roster. |
| **`METHOD.md`** | L'approche complète + un blueprint de roster à 13 rôles (par fonction). |

## La thèse en une page → `METHOD.md`

Trois idées : (1) un **gate** qui force le PRD à descendre d'un Experience Strategy Brief ; (2) un **roster à 13 rôles** qui ajoute deux lentilles que BMAD n'a pas — *Brand Strategist* (le brief) et *Design Foundation Lead* (le système de tokens) ; (3) un **modèle de collaboration** à décideur unique + review-by-default.

## Démarrage

**Le gate** (sur un projet ayant déjà BMAD v6) :

```bash
./install.sh /chemin/vers/projet-cible
# copie le pattern dans <projet>/_bmad/custom/ ; voir pattern-experience-gate/README.md
```

**L'addon taste** :

```bash
cd addon-taste/interviewer
cp .env.example .env.local   # ANTHROPIC_API_KEY (+ Supabase optionnel)
npm install && npm run dev
# voir addon-taste/README.md pour le déploiement Vercel
```

**Un agent** : pars de `templates/bmad-agent-example/customize.toml` + `templates/config.example.toml`.

## Important : machinerie vs remplissage

Ce repo ship la **machinerie** (le gate, l'addon, les templates, la méthode). Il ne ship **pas** de personas remplis ni de profils de goût : ceux-ci sont **par projet** (les personas s'ancrent aux docs du projet ; le goût se capture par personne via l'addon et se ré-injecte projet par projet). Voir `METHOD.md` → « Les trois couches ».

## Base & contrat

- Construit sur **BMAD v6**. Le cœur (`_bmad/core`, `_bmad/bmm`) **n'est jamais édité** — uniquement les couches d'override natives (`_bmad/custom/`, `.claude/skills/*/customize.toml`).
- Extrait et généralisé depuis un projet de référence réel.

## Licence

MIT — voir [`LICENSE`](./LICENSE).
