# Roadmap — addon « jumeau de goût »

Où on en est, la suite des événements, et jusqu'où ça mène.

## Où on est : le palier « capture » est bouclé

L'app de capture (`addon-taste/interviewer/`) est complète et **en ligne** :

- **11 métiers** — UX Designer · Product Manager · Design System · Direction Artistique · Content Design / CR · Brand Strategist · Architecte logiciel · Frontend · Backend · DevOps/Platform · Data Analyst.
- **Parcours complet** par métier : entretien → classification → injection → fiche, avec enrichissement.
- **Classification** : écrans réels adaptatifs (UX, PM) · références réelles + liens (Design System) · scénarios situés (Architecte, Front, Back, DevOps) · postures musclées (Brand Strategist) · propositions texte (DA, Content, Data — pools images à venir).
- **Agnostique** (modèle / stockage / hébergement), **routé sur Thiga** (crédits gratuits), **posture éditoriale dans le prompt** → modèles interchangeables.
- **UI fonction-d'abord**, i18n FR/EN, thème clair/sombre, transparence + export opérateur.

On est **au gate de validation** — volontairement, on s'arrête de construire ici.

## La suite, en 4 temps

### ① Valider (maintenant)
Les invités testent (chacun sur son métier), on récupère les retours via l'export opérateur. **Rien à coder** — tester + collecter. Ce palier **décide de tout le reste** : le concept tient-il, les fiches sonnent-elles juste ?

### ② Approfondir (si go) — deux chantiers en parallèle
- **Richesse de la capture** : pools d'images (DA, Data, Content), vidéos (mouvement UX, screencasts Front), moteur texte adaptatif, contrôle anti-bruit → des twins plus vrais.
- **L'IMPACT (le vrai but)** : le **compilateur de twin** (la fiche → un fragment de config injecté aux bonnes surfaces d'un agent BMAD) + le **harness de vérif** (contrefactuel : même tâche *avec* / *sans* le twin → la décision change-t-elle ?). C'est ce qui transforme une fiche « jolie mais inerte » en **goût qui pèse réellement sur les décisions**.

### ③ Interchangeabilité + boucle opérateur
Récupérer les twins des invités, les rendre **injectables et interchangeables** (swapper le goût d'un expert dans un agent), tableau de bord opérateur, comparer N twins d'un même métier. → l'objectif « twins interchangeables » se concrétise.

### ④ Public
Merge sur `main`, durcissement, distribution large. Le **framework devient public** (la machinerie) ; les **twins restent privés** (les résultats, le nom).

## Jusqu'où ça mène — la vision

Un système BMAD design-led où **chaque agent est animé par un vrai goût capté** — le tien, ou celui de l'expert qui l'a rempli. L'agent ne sort plus du « bon design » générique : il sort **un parti-pris**, il **rejette** ce qui serait rejeté, il **vole** ce qui serait volé. Les twins sont **interchangeables** (un autre expert par métier) et **portables d'un projet à l'autre** (le goût est une couche *opérateur*, pas *projet*).

Résultat : des **agents IA avec un point de vue — pas la moyenne d'internet.**

## Le second axe — la VOIX (pas seulement le goût)

Une personnalité = **le goût** (*ce qu'elle juge*) **+ la voix** (*comment elle le dit* : lexique, registre — cru / posé / imagé —, rythme, tics, métaphores, et **ce qu'elle ne dit jamais**). On a bâti le goût ; **la voix est le second axe**, à capturer puis injecter.

- **Découpage propre** : la **VOIX est au niveau de la PERSONNE** (tous ses twins sonnent comme elle) ; le **GOÛT est au niveau du MÉTIER**.
- **La matière est déjà là** : le transcript de l'entretien EST la personne dans ses propres mots. → distiller une **« fiche de voix »** à côté de la fiche de goût, l'injecter comme une **couche VOIX** (miroir du cadre de posture qui rend l'intervieweur incisif). Couche additive, ça ne casse rien.
- **Pourquoi ça compte** : un twin qui *décide* comme toi mais *parle* générique n'est qu'un demi-twin. Le test « on reconnaît l'auteur les yeux fermés » ne passe que si la voix est là.
- **Principe fondateur (à ne jamais perdre)** : l'entretien pousse à la **VERBOSITÉ MAXIMALE** — plus la personne parle, plus la capture est riche, pour le goût **et** pour la voix. C'est le carburant des deux axes.
- **Conception figée** : [`addon-taste/protocol/analyse-voix.md`](addon-taste/protocol/analyse-voix.md) — la grille (voix · grammaire · lexique), la fiche de voix, le bloc VOIX (miroir du cadre de posture), les pièges, la validation.
- **La CAPTURE est en ligne** (2026-07-01) : fiche de voix par personne (`/api/voice`, distillée depuis tous les entretiens, carte « 🎙️ Ta voix ») + verbosité outillée (hint + **dictée au micro**) dans l'entretien. Le **compilateur** (bloc VOIX injecté) reste gaté sur le Temps ②.

### Party mode 🎉 — la démo + la validation ultimes
Mettre plusieurs twins dans la même pièce sur une décision, chacun réagissant **dans sa vraie voix** : le Backend sec (« non. tu vas le regretter. »), la DA lyrique sur trois lignes, le PM qui tue la moitié des idées, le DevOps qui grommelle « et qui maintient ça à 3h du mat ». En 30 secondes on **SAIT** s'ils sonnent comme de vrais gens distincts ou comme la même IA sous onze chapeaux. Le « on reconnaît l'auteur » devient **social, instantané, marrant** — et prouve d'un coup que la couche voix + la couche goût tiennent. C'est la feature qui rend le monde BMAD *vivant*.

## Le point de bascule

**Le go/no-go après les tests.** S'il est positif → on attaque le **②-impact** : le moment où le projet passe de « outil de capture » à « des agents qui décident avec ton goût ». Le reste (pools, vidéos, public) est de l'intendance ; l'impact, c'est le cœur.

---

*Docs liées : [`METHOD.md`](METHOD.md) (l'approche + le roster) · [`addon-taste/protocol/tableau-artefacts-par-metier.md`](addon-taste/protocol/tableau-artefacts-par-metier.md) (l'artefact par métier) · [`addon-taste/protocol/etude-artefacts-gout.md`](addon-taste/protocol/etude-artefacts-gout.md) (théorie du goût + impact) · [`CHANGELOG.md`](CHANGELOG.md).*
