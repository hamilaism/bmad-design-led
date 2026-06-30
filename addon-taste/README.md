# Addon — Jumeau de goût (pour BMAD)

Un **addon pour BMAD** : donner à chaque agent un *jumeau de goût* (taste twin) — non pas « plus de contexte », mais des **penchants assumés sur terrain contesté** (ce qui fait qu'un designer tranche autrement qu'un autre, à brief égal).

Le goût est **clé sur une personne, pas sur un projet** : il se capture en interviewant une vraie personne, et se ré-injecte dans les agents projet par projet. Cet addon est la *machinerie de capture*. Les fiches produites (les jumeaux) restent **côté projet**.

## Principe en deux temps (séparés exprès)

1. **Construire** le jumeau — l'entretien. La verbosité de la personne est le but. Outils : provocation, paradoxe assumé, choix forcé concret, digression, relance. Une question naît de la dernière réponse ; jamais de plan affiché. Du global (la posture du métier) vers le spécifique. On fait **RÉAGIR / rejeter / trancher**, on ne demande jamais à la personne de se décrire (réponses aspirationnelles). On tient les paradoxes — une contradiction est le meilleur signal. Pour les métiers visuels : la réaction à des **images** (qu'est-ce qu'on garde / jette / recombine, et pourquoi, au grain) révèle le goût mieux que le discours.
2. **Tester / valider** — par l'usage, sur des cas réels, en cartographiant l'écart entre goût *déclaré* (verbal) et goût *révélé* (réaction aux objets). Le signal est dans l'**écart**.

## `interviewer/` — l'app d'entretien

Une app Next.js autonome qui mène l'entretien (verbal + réaction à des images) et génère une **fiche de jumeau** en markdown. **Déployable sur Vercel** ; l'invité n'a **pas besoin de compte** — la clé Anthropic vit côté serveur. Voir `interviewer/README.md` pour le lancement local, le déploiement et la persistance optionnelle (Supabase).

Le moteur d'entretien et un jeu d'agents-exemples (avec leurs « amorces » de provocation par métier) sont dans `interviewer/lib/agents.ts` — à adapter aux rôles de ton projet.

## Structure

| Dossier | Quoi | Publié ? |
|---|---|---|
| `protocol/` | **Le framework** : le protocole en 3 temps (entretien · classification · injection) + les **artefacts par agent**. Voir `protocol/README.md`. Sources auditées en `*.source.md`. | ✅ (sauf `*.source.md`) |
| `interviewer/` | **L'app** Next.js qui mène les **3 temps** (entretien · classification · injection) et génère la fiche. Déployable Vercel, l'invité n'a pas de compte. | ✅ |
| `twins/` | **Les résultats** : les fiches captées (couche *Goût*, clée sur une personne). `twins/<personne>/<agent>.md`. | ❌ privé (gitignoré) |

> **On publie le framework, pas les résultats.** Le protocole et l'app sont partageables ; les fiches de goût (les tiennes, celles de tes potes) restent privées.
