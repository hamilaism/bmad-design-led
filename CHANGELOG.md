# Changelog

Format inspiré de [Keep a Changelog](https://keepachangelog.com/). Versionné en SemVer.

## [Non publié]

### Corrigé (durcissement post-audit de l'app d'entretien)
- **Rate-limit des PIN** (5 échecs / 15 min par prénom+IP) — la serrure à 10 000 combinaisons n'est plus brute-forçable en quelques minutes par un invité sur l'espace d'un autre.
- **Auth factorisée** (`lib/auth.ts`, une implémentation au lieu de 3 variantes divergentes) : une erreur de lecture DB ne fait plus **sauter le check PIN** sur `profile-delete` (503, pas bypass) ; la course à la création de personne (contrainte unique) est encaissée ; prénom borné à 40 caractères.
- **Les erreurs LLM ne polluent plus les transcripts** : erreur de création → vrai statut HTTP (502) ; erreur en cours de stream → sentinelle hors-bande que le client affiche comme erreur au lieu de la laisser entrer dans le transcript (où elle finissait **distillée dans la fiche**).
- **Relire sa fiche sans la régénérer** : route `/api/profile` (lecture seule, PIN requis) + bouton « Voir la fiche » sur les profils faits — fini le « ✓ Enregistrée » invérifiable et les régénérations payantes pour consulter.
- **Payload borné** : les images des tours anciens deviennent un marqueur texte côté client (l'historique base64 ne regonfle plus jusqu'à la limite Vercel de 4,5 Mo) ; historique plafonné à 60 tours côté serveur ; les images ne partent plus dans le payload de génération de fiche (le distillateur ne les lit pas).
- **Verdicts re-jugés annotés** au lieu de dupliqués en silence (« 2ᵉ passage sur le même artefact ») — la divergence redevient le signal anti-bruit voulu par la méthode, pas un parasite.
- **`LLM_TOKEN_FLOOR`** : le plancher `max_tokens` du chemin openai (16 000 par défaut, exigé par les modèles à thinking via gateway) devient réglable par l'opérateur ; `classify` passe à `maxDuration` 60 s.
- Nettoyage : `LANGS`, `defaultInjectionPrompt`, prop `name` de `PhaseHead` (code mort).

### Ajouté
- **L'axe VOIX — capture en ligne** (`addon-taste/protocol/analyse-voix.md` = la conception ; l'app = la capture) :
  - **Fiche de voix par PERSONNE** (pas par métier) : `/api/voice` distille comment la personne parle — lexique, grammaire & rythme, registre, domaines d'images, tics, « jamais », exemplaires — depuis **tous** ses entretiens + raisons de verdicts + pourquoi d'injections (la voix la moins performée, surpondérée). Toujours régénérée depuis le corpus complet (la voix est l'**invariant** inter-transcripts). Rangée sous l'agent sentinelle `_voix` (même table `profiles`, **aucune migration**) → embarquée d'office dans l'export opérateur. Carte « 🎙️ Ta voix » dans l'espace (distiller / voir / redistiller), règle d'étanchéité voix≠goût et statuts attesté/proposé/[creux] dans le prompt (`voicePrompt`, `lib/agents.ts`).
  - **Verbosité maximale, outillée** : hint permanent sous le composer d'entretien (« déroule, parle au micro ») + **dictée au micro** (Web Speech API, FR/EN suivant la langue du parcours, bouton 🎙️ pulsant) — le carburant des deux axes.

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
