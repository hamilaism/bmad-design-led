# Changelog

Format inspiré de [Keep a Changelog](https://keepachangelog.com/). Versionné en SemVer.

## [0.1.1] — 2026-06-27

### Ajouté
- **Context7 dans le flux de dev** (`METHOD.md` → « Outillage de dev ») : tout agent qui touche du code (dev, archi, revue) — et toi, et tes subagents — consulte Context7 (MCP) pour la doc à jour des libs/API avant de deviner une signature. Réflexe opt-in ajouté au template d'agent.

## [0.1.0] — 2026-06-27

Première version publique. Extrait et généralisé depuis un projet de référence.

### Ajouté
- **`pattern-experience-gate/`** — le gate Experience Strategy Brief → PRD câblé en natif (overrides de workflow BMAD v6, cœur jamais édité) : prepend d'activation, fait persistant, reviewer adversarial au finalize, + red-thread au readiness.
- **`addon-taste/`** — l'addon « jumeau de goût » : méthode + app Next.js d'entretien (déployable Vercel, l'invité n'a pas besoin de compte). Capture le goût d'une personne sur un métier via entretien verbal + réaction à des images.
- **`templates/`** — squelette générique d'agent design-led + exemple d'enregistrement de roster.
- **`METHOD.md`** — l'approche design-led + le blueprint de roster à 13 rôles (par fonction).

### Notes
- Les personas et les profils de goût sont **par projet** : ce repo ship la *machinerie*, pas le *remplissage*.
