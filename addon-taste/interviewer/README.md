# Intervieweur de goût

Un chat autonome qui mène l'**entretien de goût** (méthode : voir `../README.md`) pour capturer le goût d'un profil dans une **fiche de jumeau**, et te la renvoie.

**L'invité n'a besoin de rien** : il ouvre l'URL, choisit un profil, se fait interviewer, génère la fiche. L'app appelle l'API **Anthropic côté serveur, sur TA clé** — l'invité n'a pas de compte Claude.

## Comment ça marche

1. L'invité ouvre l'URL → entre son prénom + un **code d'accès** → choisit le profil (les agents-exemples : UX, Design System, PM, Brand, Archi, Data en verbal ; **DA = réactions à des images**).
2. Claude l'interviewe en live (moteur adaptatif : provocation, paradoxe, une question à la fois — jamais un QCM). Pour le profil visuel, l'invité **uploade des images** et réagit dessus.
3. Bouton **« Terminer & générer la fiche »** → la fiche markdown est produite, **stockée dans Supabase** (table `fiches`) si configuré, et copiable/téléchargeable.

> Le jumeau porte le goût de **l'interviewé** → mets la bonne personne sur le bon profil (un pote calé DA → le profil DA, etc.). Les profils sont définis dans `lib/agents.ts` — adapte-les à tes rôles.

## Setup (3 lignes)

```bash
npm install
cp .env.example .env.local   # remplis les valeurs (voir ci-dessous)
npm run dev                  # http://localhost:3000
```

### Variables d'env (`.env.local`)

| Variable | Quoi |
|---|---|
| `ANTHROPIC_API_KEY` | ta clé Anthropic (serveur uniquement, jamais exposée) |
| `ANTHROPIC_MODEL` | optionnel — défaut `claude-sonnet-4-6` (mets opus pour plus tranchant) |
| `ACCESS_CODE` | le code partagé aux invités (sinon l'URL est ouverte) |
| `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` | optionnel — pour recevoir les fiches. Sans ça, l'app marche, la fiche est juste affichée |

### Supabase (optionnel mais recommandé)

Dans le SQL editor de ton projet Supabase, exécute `supabase/schema.sql` (crée la table `fiches`, RLS ON sans policy → seul le serveur écrit via service role).

## Déploiement Vercel

1. `vercel` (ou connecte le dossier à un projet Vercel).
2. Dans Vercel → Settings → Environment Variables : colle les 4-5 variables ci-dessus.
3. Deploy. Partage l'URL + le code d'accès.

## Notes

- **Sécurité** : la clé Anthropic et la service role Supabase ne quittent jamais le serveur. Le `ACCESS_CODE` évite qu'un random crame ta clé — change-le si tu le partages large.
- **Lean & jetable** : pas de design system, pas de tests, pas d'auth. C'est un outil d'élicitation, pas un produit.
- Le contenu des entretiens (moteur + amorces) est embarqué dans `lib/agents.ts` — adapte-le aux rôles de ton projet.
- **`npm audit`** : sur Next `14.2.35` (dernier 14.x patché, la vuln critique est résolue), il reste des advisories Next de **niveau framework** (Image Optimizer, middleware, i18n, CSP nonces, RSC cache, SSRF WebSocket…). **Aucune ne touche la surface de cette app** (pas d'image optimizer, pas de middleware, pas d'i18n, pas de rewrites). Le seul « fix » = Next 16 (breaking, React 19) — non justifié ici.
