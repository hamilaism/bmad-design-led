# Intervieweur de goût

Un chat autonome qui mène l'**entretien de goût** d'un profil de métier et en produit une **fiche de jumeau** (méthode : `../protocol/README.md`). L'invité ouvre l'URL, entre son prénom + un code, et se fait interviewer — **aucun compte requis**, la clé du modèle vit côté serveur.

Capture en **3 temps** : **entretien** (déclaré) → **classification** (juger des artefacts) → **injection** (apporter les siens). Sortie : une fiche markdown, optionnellement stockée.

> **On n'impose aucun service.** Trois axes — modèle, stockage, hébergement — chacun interchangeable par variables d'env. Notre stack par défaut est listée, mais tu branches ce que tu veux (y compris du **local**).

---

## Démarrage rapide (local, 3 lignes)

```bash
npm install
cp .env.example .env.local      # remplis au moins le modèle (voir ci-dessous)
npm run dev                     # http://localhost:3000
```

Sans variable de stockage, l'app marche : la fiche est juste affichée + téléchargeable.

---

## 1. Modèle — `LLM_PROVIDER`

| Provider | Variables | Pour qui |
|---|---|---|
| `anthropic` *(défaut)* | `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL` (déf. `claude-opus-4-8`) | API Anthropic directe |
| `openai` | `OPENAI_BASE_URL`, `OPENAI_API_KEY`, `OPENAI_MODEL` | **Toute gateway compatible-OpenAI** : OpenAI, OpenRouter, une passerelle d'entreprise, **ou un modèle LOCAL** (Ollama / LM Studio — `OPENAI_BASE_URL=http://localhost:11434/v1`) |

Le moteur d'entretien et les amorces par agent sont dans `lib/agents.ts` ; les artefacts (classification) dans `lib/artefacts.ts`. À adapter à tes rôles.

## 2. Stockage — `STORE` (auto-détecté)

Sert à **collecter les fiches** et à **appliquer le verrou PIN** des profils. Optionnel.

| `STORE` | Variables | Pour qui |
|---|---|---|
| `supabase` | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Supabase hébergé **ou auto-hébergé** (Docker local) |
| `postgres` | `POSTGRES_URL` (+ `POSTGRES_SSL=true` si besoin) | **N'importe quel Postgres** : Neon, Railway, Render, un VPS, **ou local** (`postgres://user:pass@localhost:5432/db`) |
| `none` *(défaut si rien)* | — | Pas de persistance ; fiche affichée/téléchargée, PIN non appliqué |

**Schéma** (si `supabase` ou `postgres`) — joue une fois `supabase/schema.sql` :
- Supabase → SQL Editor, colle le fichier.
- Postgres → `psql "$POSTGRES_URL" -f supabase/schema.sql`.

*(Le `schema.sql` est du Postgres standard. Les lignes `row level security` ne servent qu'au cas Supabase — inoffensives en Postgres direct, où le rôle de connexion les bypasse.)*

## 3. Hébergement — n'importe quel hôte Node

L'app est une app Next.js standard, build **autoportant** (`output: standalone`). Au choix :

- **Local** : `npm run dev` (ou `npm run build && npm start`).
- **Docker** : `docker build -t taste-interviewer . && docker run -p 3000:3000 --env-file .env.local taste-interviewer`.
- **VPS / serveur Node** : `npm ci && npm run build && npm start` (sers derrière nginx/caddy).
- **PaaS** : Render, Railway, Fly.io, Netlify… (build `next build`, start `next start`, ou l'image Docker).
- **Vercel** : `vercel deploy --prod` + variables d'env. *(Une option parmi d'autres — rien n'y est spécifique.)*

> Quel que soit l'hôte, mets les variables d'env (table ci-dessous), et **désactive toute « protection de déploiement »** du provider si tu veux que tes invités y accèdent — l'app est déjà protégée par `ACCESS_CODE`.

---

## Variables d'env (récap)

| Variable | Rôle |
|---|---|
| `LLM_PROVIDER` | `anthropic` (déf.) ou `openai` |
| `ANTHROPIC_API_KEY` / `ANTHROPIC_MODEL` | si provider anthropic |
| `OPENAI_BASE_URL` / `OPENAI_API_KEY` / `OPENAI_MODEL` | si provider openai |
| `STORE` | `supabase` / `postgres` / `none` (sinon auto) |
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | si store supabase |
| `POSTGRES_URL` / `POSTGRES_SSL` | si store postgres |
| `ACCESS_CODE` | code partagé aux invités (sinon URL ouverte) |
| `PIN_SALT` | sel pour hasher les PIN de profil (mets une valeur aléatoire) |
| `LLM_TOKEN_FLOOR` | plancher `max_tokens` sur le chemin openai (déf. `16000` — les modèles à thinking via gateway exigent une marge au-dessus du budget de raisonnement ; baisse-le si ta gateway n'en a pas besoin) |

Voir `.env.example` pour le détail commenté.

---

## Notes

- **Sécurité** : clé du modèle + clés de stockage vivent **côté serveur uniquement**, jamais exposées au client. `ACCESS_CODE` évite qu'un random crame ta clé. Le **PIN de profil** (4 chiffres, hashé) identifie + protège une personnalité — c'est une serrure douce, pas de la crypto ; les essais de PIN sont **rate-limités** (5 échecs / 15 min par prénom+IP, compteur par instance) et une erreur de lecture DB ne fait **jamais** sauter le verrou (503, pas bypass).
- **Lean & jetable** : pas de design system, pas de tests, pas d'auth lourde. C'est un outil d'élicitation.
- **`npm audit`** : il reste des advisories Next de niveau framework qui ne touchent pas la surface de cette app (pas d'image optimizer, middleware, i18n, rewrites). Le seul « fix » serait un saut de version majeure — non justifié ici.
