# Protocole de capture du goût — entretien · classification · injection

> Le **framework** de l'addon « jumeau de goût » (publiable). On publie le *comment-on-capte*, **pas les fiches captées** (la couche *Goût* reste privée → `../twins/`).
>
> **Source complète et auditée** (couplée au projet d'origine Shwifty, gardée en local, non publiée) : `method.source.md` (la méthode, rev 2, avec ses gates et sa revue sceptique) + `moteurs-par-agent.source.md` (la machinerie par agent, in extenso). Ce README en est la version **généralisée et portable**.

## Les 3 temps

Un twin se capte en **trois temps**, du verbal vers le concret :

1. **Entretien — le _déclaré_.** Ce que la personne *sait dire* de son goût. Provocation, paradoxe, choix forcé concret ; une question naît de la précédente ; global → spécifique ; on la fait **réagir**, jamais « décris-toi ». → déjà implémenté dans l'app (`../interviewer/`).
2. **Classification — le _révélé (passif)_.** On **expose des artefacts** liés au métier (hors-sujet : jamais le produit du projet ni un concurrent adjacent). La personne tranche chacun : **garde / jette / recombine + pourquoi**, au grain. Ce qu'elle *fait* face au concret, pas ce qu'elle théorise.
3. **Injection — le _révélé (actif)_.** La personne **apporte ses propres artefacts** : ses références fétiches **et** ses bêtes noires, et dit *pourquoi*. Le goût se lit autant dans ce qu'on choisit d'amener que dans ce qu'on rejette.

> **Le signal est dans l'ÉCART** entre le déclaré (1) et le révélé (2-3). Une contradiction tenue est la meilleure donnée — on ne la « résout » pas en fausse cohérence.

## Principes communs du canal révélé

- **Verdict orienté** comme unité : `(objet, geste ∈ {garde · jette · recombine}, raison, décision-cible)`.
- **Hors-cible** : jamais le produit du projet, ni un concurrent direct/adjacent. Univers **dispersés et non-cohérents** (casse la confirmation).
- **Doublons anti-bruit** : glisser 3-4 objets en double, à distance et en ordre brouillé → si le geste diverge sur le *même* objet, le canal révélé est du bruit *sur ce terrain* (une donnée, pas un échec à cacher).
- **Anti-ancrage** : on ne montre jamais à la personne sa propre fiche ; le révélé tourne avant toute relecture.

## Artefacts par agent

Pour chaque rôle : ce qu'on lui **fait juger** (classification), ce qu'on l'invite à **injecter**, l'**écart** déclaré↔révélé à guetter, et l'**opérabilité** du canal révélé (prouvé vs proposé-à-falsifier).

| Agent | Artefact à juger (classification) | Ce qu'on invite à injecter | Écart à guetter | Opérabilité |
|---|---|---|---|---|
| **Sally** (UX) | Des **flows vivants** qu'on lance et **navigue** (pas des captures) — onboarding, checkout, tuto de jeu, prise de RDV. On capte où la main hésite, ce qu'elle back-button, le flow abandonné. | Les apps/flows dont elle **vole la matière** + ceux qui la font **fermer l'app** sur le champ. | Friction théorisée (*Hooked*) vs subie (elle saute les étapes) ; rupture prêchée vs Jakob cherché dans le pouce. | **forte** |
| **Tessa** (DS) | Des **décisions de structure** de DS réels (token files open-source : Radix, Primer, Carbon) — `green-700` vs `action.primary`, sémantique à 5 rôles vs 40, dark par aliasing vs duplication. | Ses **design systems préférés** (et ceux qu'elle déteste) — la couche d'input dont tu parlais. | « Léger/jetable » déclaré vs « garde » devant une taxo riche ; la frontière valeur/structure qui glisse (l'espacement). | proposée |
| **Margaux** (DA) | L'**image** comme compo / hiérarchie / traitement — objets visuels dispersés (print, packaging, affiches, pochettes, écrans) **+ le pool partagé** (campagnes, identités) lu comme **craft graphique**. | Ses refs visuelles/DA fétiches + ses dégoûts (glassmorphism, grain, etc.). | Avarice déclarée vs appétit révélé (chaud/saturé gardé) ; geste *défendu* vs geste *élu*. | **forte** |
| **Camille** (Brand) | Des **plateformes/postures de marque** (le Why, l'ennemi, l'archétype) **+ le pool partagé** (pubs, campagnes, vidéos, mood) lu comme **signal de tendance** (conso, culture, socio) et **intention stratégique**. | Les marques / manifestes / mouvements culturels qu'elle admire — et ceux qui « **sonnent faux** ». | Falsifiable déclaré vs évocateur révélé ; chaleur-insider vs tranchant-antagoniste. | moyenne |
| **John** (PM) · *nouveau* | Des **décisions produit réelles** : roadmaps publiques, changelogs (ce qui a été **tué / shippé**), pages de **pricing / packaging**, arbres de prio. Trancher : « tu shippes ? tu tues ? killer feature vs bloat ? » | Les **produits dont il admire la stratégie / la prio** — et les « **obèses qui font tout à moitié** ». | Data-informé déclaré vs flair qui tranche ; règle de *kill* énoncée vs ce qu'il **garde par attachement**. | proposée |
| **Winston** (Archi) | Des **schémas de données / ER-diagrams** réels (GitHub, dbdiagram) de domaines variés. garde / jette / **recombine** (« je fusionne ces deux tables »). | Les archis / repos qu'il trouve **modèles**. | Pragmatisme « boring » déclaré vs élégance prématurée gardée ; RLS canon vs ligne qui plie sous la deadline. | proposée |
| **Dara** (Data) | Un **mur de preuves** : graphiques + affirmations chiffrées du réel (Spotify Wrapped, courbe COVID, sondage à marge cachée, graphe boursier tronqué). « je décide / je me méfie / il me manque X ». | Les dashboards / métriques qu'il **respecte** vs les *vanity* qu'il méprise. | Rigueur déclarée vs crédulité révélée (gobe la courbe qui l'arrange). | proposée |

> *Opérabilité* : **forte** = canal révélé prêt (Sally, Margaux ; brand moyen). **proposée** = objet natif décrit mais pas encore éprouvé — passe d'abord le contrôle anti-bruit avant d'y croire (cf. `method.source.md` §2.0/§2.3b). Un 8ᵉ profil **Quinn (QA)** existe dans la source (artefact = cartes d'incidents/défauts shippés) — goût faible, optionnel.

## La couture Camille ↔ Margaux (2 lentilles, 1 vivier)

Ces deux rôles sont **très proches** (« plus un que deux ») mais **gardés séparés**. Ils **partagent un vivier d'artefacts** — pubs, campagnes, vidéos, identités, mood, *une marque extrapolée sur ses supports de com* — lu à travers **deux lentilles** :

- **Camille (Planner Strat)** — vision **globale, quasi-sociologique** : lit l'artefact comme un **signal de tendance** (conso, culture, société) et une **intention stratégique**. À mi-chemin entre l'UX et la DA.
- **Margaux (DA)** — vision **orientée** : lit le *même* artefact comme **culture graphique/vidéo de la marque** et **craft d'exécution**. Pas de sociologie ; elle *développe une culture de marque*.

Le même objet jugé deux fois (une lentille chacun) révèle **où, pour cette personne, la stratégie devient exécution** — la couture est le signal.

## Sortie : la fiche-twin enrichie

Entretien (1) + verdicts de classification (2) + injections (3) → une **fiche v1** structurée (POV · Posture · Canon `vole|interdit` · Heuristiques · Lignes rouges · Verbatims · Complétude), **taggée `{agent} · {personne}`** et rangée dans `../twins/<personne>/<agent>.md`.

Plusieurs personnes à fonction proche → plusieurs fiches par rôle → **interchangeables** : on branche le bon twin sur le bon agent, projet par projet.
