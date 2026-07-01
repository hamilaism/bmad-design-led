# La méthode design-led

BMAD est *product-led* : analyse → PRD → architecture → epics → stories. C'est solide, mais l'expérience et la marque y arrivent en bout de chaîne, en habillage. Ce remix inverse la dépendance : **l'expérience est la source, le PRD en descend.** Trois pièces le rendent vrai.

## 1. Le keystone — le gate Experience Strategy Brief → PRD

La règle design-led : **un PRD descend d'un Experience Strategy Brief, pas d'une liste de features.** Aucune exigence sans un principe d'expérience parent qu'elle trace.

Le piège classique : cette règle vit seulement dans le persona du PM (« pense expérience d'abord »). Elle n'est alors gardée par aucune porte — rien n'empêche un PRD d'empiler des exigences orphelines, et le fork redevient *product-led avec une couche brand*.

La solution : câbler la règle en **vérification machine native** (voir `pattern-experience-gate/`), sur trois surfaces d'override BMAD — à l'entrée du PRD, en fait persistant tout du long, et en reviewer adversarial au finalize — plus un contrôle de red-thread au readiness (essence → exigence → epic → story). Le cœur bmm n'est jamais touché.

## 2. Le roster — 13 rôles, dont 2 que BMAD n'a pas

Le roster design-led garde les rôles produit de BMAD et ajoute les lentilles qui manquent en amont (la stratégie de marque) et au milieu (la fondation de design). Par **fonction** :

**Les deux ajouts design-led**
- **Brand Strategist** — la lentille stratégique et culturelle au-dessus du PRD : insight, plateforme de marque, promesse, Experience Principles, Moments of Truth. Produit l'**Experience Strategy Brief** qui arme le gate.
- **Design Foundation Lead** — le pont marque ↔ expérience : traduit la stratégie et l'expression en un **système de tokens** (primitives → sémantique → composant), portable de l'écran au physique, repris comme un contrat par une équipe dev. Son verbe est *traduire*.

**Les rôles d'expérience & marque** (souvent présents mais sous-spécifiés)
- **Creative Director / Art Director** — l'expression : identité visuelle, motion, voix ; propose des directions fortes et divergentes, le décideur tranche le goût.
- **UX Designer** — flux, états, architecture d'information, service design.
- **UX Writer / Content Designer** — le mot comme unité de travail : microcopy, lexique, la voix incarnée dans chaque état.
- **Product Marketing** — positionnement, récit, go-to-market (la distribution avant le vernis).

**Les rôles produit & build** (les fondations BMAD, reframées dans le red-thread)
- **Product Manager** · **Analyst** (recherche/discovery) · **Data Analyst** (hypothèses falsifiables, verdicts) · **Architecte logiciel** (le juge des trade-offs, au-dessus des couches) · **Frontend** · **Backend** · **DevOps / Platform** · **QA / Release Reviewer** (revue adverse, plancher qualité, verdict ship/no-ship) · **Tech Writer** (handoff, gardien du red-thread).

> Le détail des rôles n'est pas figé : adapte le roster à ton domaine. Le squelette d'un agent est dans `templates/`. L'invariant à tenir : **N agents = N dirs `.claude/skills/bmad-agent-*` + N entrées dans `config.toml`.**

## 3. La collaboration — décideur unique + review-by-default

Pas de RACI à 50 cases. Deux règles :
- **Décideur unique.** Chaque arbitrage a un *lead* qui propose le volume + le rationnel ; une seule personne tranche le goût et signe. Les agents proposent, ne tranchent pas à sa place.
- **Review-by-default.** Chaque agent relit le travail de ses voisins *selon sa propre lentille* (le Brand Strategist : « ce cadrage est-il traduisible en principes ? » ; le Design Foundation Lead : « cette spec d'états est-elle couverte par un token de rôle ? »). Il signale les écarts, il ne réécrit pas chez l'autre.

**Deux tables, pas une.** Le design-led se joue sur deux scènes successives :
- **Table MARQUE** (en amont) : **Brand Strategist** + **Art Director** + **UX Writer / CR** posent l'intention, l'identité et la voix.
- **Table INTERFACE** (en aval) : **UX Designer** + **Product Manager** + **Art Director** + **UX Writer / CR** exécutent l'expérience.

L'**Art Director** et l'**UX Writer / CR** siègent aux **deux** tables — ils portent l'identité et la voix jusque dans l'écran. Le **Brand Strategist**, lui, est **en amont** : son brief gouverne la voix du produit, mais il n'a **pas de siège à la crit interface** — sinon on re-litige la marque à chaque écran. Le **Design Foundation Lead** est le **pont** entre les deux tables : il traduit l'intention en tokens repris comme un contrat.

## Les trois couches (où vit quoi)

Une confusion fréquente : « la personnalité d'un agent, c'est BMAD ou c'est le projet ? » — ni l'un ni l'autre. Il y a **trois** couches :

| Couche | Quoi | Vit où |
|---|---|---|
| **Méthode** | rôles, gate, carte de collab, machinerie de l'addon | la méthode (ce repo) — portable, partageable |
| **Goût** | les *penchants sur terrain contesté* — ce qui fait qu'une personne tranche autrement | **clé sur une personne**, pas sur un projet ; capturé via l'addon, ré-injecté projet par projet |
| **Ancrage** | les docs, le domaine, les faits *de ce projet* | dans chaque projet |

Le **goût est l'actif le plus précieux et le plus mal rangé** : ce n'est pas générique (un autre utilisateur ne doit pas hériter du tien) et ce n'est pas projet (tu veux le *garder* en changeant de projet). C'est une couche *opérateur*, à part. → c'est tout l'objet de `addon-taste/`.

## L'addon goût — en deux temps séparés

1. **Construire** le jumeau par entretien : la verbosité est le but ; provocation, paradoxe assumé, choix forcé, digression ; une question naît de la précédente ; du global au spécifique ; on fait *réagir/rejeter/trancher* (jamais « décris-toi ») ; on tient les paradoxes (une contradiction est le meilleur signal). Pour les métiers visuels, la réaction à des **images** révèle le goût mieux que le discours.
2. **Valider** par l'usage, en cartographiant l'écart entre goût *déclaré* (verbal) et goût *révélé* (réaction aux objets). Le signal est dans l'écart.

## Contrat avec BMAD

- Base : **BMAD v6**. Le cœur (`_bmad/core`, `_bmad/bmm`, moteur de merge, skills de workflow) est **installé séparément** et **jamais édité**.
- Tout le remix passe par les couches d'override natives : `_bmad/custom/*.toml` (team) et `.claude/skills/*/customize.toml` (par skill). Scalaires override, arrays append.
- Avant tout upgrade BMAD : dry-run sur copie + diff du roster (les overrides sont sûrs, mais un skill renommé en amont casse un override qui le cible).

## Outillage de dev — doc à jour via Context7

Règle transverse à **tout agent qui touche du code** (dev, architecte, revue technique) — et à toi, et à tes subagents : **avant d'utiliser une lib ou une API, consulter [Context7](https://github.com/upstash/context7)** (MCP) pour la doc à jour — `resolve-library-id` puis `get-library-docs` — plutôt que de deviner une signature.

- Installation : `claude mcp add --transport http context7 https://mcp.context7.com/mcp -s user` (scope `user` = tous tes projets ; ou `-s project` pour le partager via le `.mcp.json` du repo).
- S'applique à **tout dev** : toi, tes subagents, les agents BMAD. Un agent technique parti du template (`templates/`) porte le réflexe (voir le `persistent_fact` commenté).
- Une session déjà ouverte ne voit pas un serveur MCP ajouté après son démarrage : relancer la session pour que les outils `context7` apparaissent.
