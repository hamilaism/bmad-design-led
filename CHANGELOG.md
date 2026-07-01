# Changelog

Format inspiré de [Keep a Changelog](https://keepachangelog.com/). Versionné en SemVer.

## [0.2.0] — 2026-06-30

### Ajouté
- **Addon goût — protocole en 3 temps** : entretien *(déclaré)* · classification *(juger des artefacts)* · injection *(apporter les siens)*. Machinerie + artefacts par agent généralisés dans `addon-taste/protocol/README.md`.
- **App d'entretien rendue agnostique** (`addon-taste/interviewer/`), zéro lock-in sur 3 axes :
  - **Modèle** (`LLM_PROVIDER`) — Anthropic (Opus 4.8) **ou** toute gateway compatible-OpenAI (OpenAI, OpenRouter, passerelle d'entreprise, **ou un modèle local** type Ollama/LM Studio). `lib/llm.ts`.
  - **Stockage** (`STORE`) — Supabase **ou** n'importe quel Postgres (hébergé **ou local**) **ou** aucun. `lib/store.ts`.
  - **Hébergement** — build `output: standalone` + `Dockerfile` → Docker, VPS, Render, Railway, Netlify, Vercel… au choix.
- **Verrou de profil par PIN** — prénom + code à 4 chiffres (hashé côté serveur) : identifie + protège une personnalité, rouvrir/enrichir exige le bon code.
- README clé-en-main de l'app (les 3 axes, variables d'env, schéma, déploiement).
- **Espace perso multi-profils** : une personne (prénom + code à 4 chiffres) gère N profils depuis un tableau de bord (statut ○ à faire / ◐ en cours / ✅ fait), les enrichit (fiche régénérée v2/v3, inputs accumulés), et les supprime. Schéma `persons` + `profiles`.
- **Collecte opérateur** : `/api/export?key=…` (toutes les fiches de l'instance, JSON ou markdown). Chaque instance ne collecte que sa propre DB.
- **Transparence** : bandeau clair (« collectée par {OPERATOR_NAME} » / générique / « non collectée »), + téléchargement de sa fiche par le participant.
- **Bilingue FR/EN** : bascule de langue qui couvre l'UI **et** ce que la personne lit (cartes de classification, prompts d'injection) **et** le modèle — l'entretien se mène et la fiche se génère dans la langue choisie (les amorces d'agents restent en FR comme notes de cadrage, adaptées à la volée). Auto-détection navigateur, mémorisée. `lib/i18n.ts`. La bascule de langue se **verrouille dès qu'on entre dans un parcours** (entretien / classification / injection / fiche) — libre seulement au setup et dans l'espace, pour ne jamais mélanger deux langues sur un même profil.
- **Thème clair / sombre** : bascule mémorisée, suit la préférence système par défaut, sans flash au chargement (script inline dans le layout).
- **L'enrichissement repart de la fiche existante** (passe précédente ou twin importé) au lieu de la réécrire de zéro.
- **Routing modèle PAR JOB + cadre de posture partagé** : chaque job (`interview`/`fiche`/`classify`) vise son `provider:model` (`MODEL_*` env) — permet de router chaque boulot vers son meilleur ratio coût/vitesse, indépendamment. La **posture éditoriale** (interdits, registre, mécanique paradoxe/contradiction, few-shot) est factorisée dans le prompt (`lib/agents.ts` → `POSTURE`) : **les modèles deviennent interchangeables**, la personnalité vient du frame, pas du modèle. Un bench multi-modèles (Opus 4.8 / Sonnet 5 / GPT-5.5 / Gemini / Claude via Thiga…) a montré que le peloton de tête est **à égalité dans le bruit de mesure** → on route sur le coût, pas sur une hiérarchie de qualité illusoire.
- **Nouveau rôle — Nora (CR · UX Writer · Content Designer)** : le profil « mots / voix / récit » qui manquait au roster (concepteur-rédacteur, UX writing, content design, journalisme). Margaux reste **DA**. Agent + amorces + deck de classification + injection, bilingue.
- **Classification visuelle adaptative** *(vertical slice : Sally / UX)* : au lieu de propositions texte (« interview appauvrie »), la personne réagit à de **vrais écrans** — curatés par axe de tension via Mobbin, hébergés sur **Supabase Storage** (hors repo). Un **moteur IA** (`/api/classify`) choisit le prochain écran selon ses verdicts (traque les contradictions) et **interprète son goût en direct**. Gestes clarifiés (« je garde · je jette · **j'en vole un bout** » + indices), placeholder réécrit, **sans borne** (plancher + continue), et **récap des signaux** avant génération. `lib/pools.ts` + `lib/i18n.ts`.

### Notes
- Les fiches captées (couche *Goût*, `addon-taste/twins/`) et les sources couplées au projet d'origine (`*.source.md`) restent **hors-git** : ce repo ship la *machinerie*, pas le *remplissage*.

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
