# Analyse de la voix — le second axe (protocole)

> Une personnalité captée = **le goût** (*ce qu'elle juge* — niveau MÉTIER, ✅ construit) **+ la voix** (*comment elle le dit* — niveau PERSONNE, ❌ ce document). Cf. `ROADMAP.md` § « Le second axe » et `METHOD.md` § « Les trois couches ».
>
> Ce doc est le **framework** (publiable) : comment on analyse, ce qu'on produit, comment on l'injecte. Les fiches de voix captées restent privées (`../twins/`).

## 1. Le principe — deux axes, deux niveaux

|  | **GOÛT** | **VOIX** |
|---|---|---|
| Question | *qu'est-ce que tu gardes / jettes / recombines ?* | *comment tu le dis ?* |
| Niveau | **métier** (ton goût UX ≠ ton goût PM) | **personne** (tous tes twins sonnent comme toi) |
| Matière | déclaré + révélé (verdicts, injections) | le transcript lui-même — la personne dans ses propres mots |
| Signal | **l'ÉCART** déclaré ↔ révélé | **l'INVARIANT** d'un transcript à l'autre |
| Sortie | fiche de goût `{agent} · {personne}` | fiche de voix `Voix · {personne}` |
| Injection | contenu du jugement (canon, heuristiques, lignes rouges) | forme de la sortie (bloc VOIX, miroir du cadre de posture) |

**La définition opérante : la voix est l'invariant.** Quand la même personne passe l'entretien UX puis l'entretien PM, *ce qui change* est le goût ; *ce qui reste* — le lexique, la syntaxe, les images, les tics — est la voix. Deux transcripts d'une même personne suffisent donc à la **trianguler** ; un seul suffit à la **proposer**. C'est le miroir exact du goût : le goût se lit dans l'écart, la voix se lit dans la constante.

**La règle de séparation (fondatrice) : le goût décide du QUOI, la voix décide du COMMENT.** Une fiche de voix ne contient **aucun jugement, aucune référence, aucune ligne rouge** — si un trait de voix implique une opinion (« il dit toujours que Tailwind c'est de la merde »), c'est du goût mal rangé : il part dans la fiche de goût. Réciproquement, une fiche de goût ne prescrit jamais un ton. Sans cette étanchéité, les couches ne sont plus composables ni interchangeables.

## 2. La matière — d'où vient la voix

Tout est déjà capté. Par ordre de valeur :

1. **Les tours de parole de la personne** dans les transcripts d'entretien — le gisement principal. On **écarte les tours de l'intervieweur** : sa posture (incisive, imagée) est un artefact du cadre `POSTURE`, pas de la personne.
2. **Les raisons des verdicts** (classification) et **les pourquoi des injections** — courts, spontanés, écrits *sans interlocuteur qui provoque* : c'est la voix la **moins performée** du corpus. À surpondérer pour le registre de base.
3. **Tous les métiers confondus.** La voix étant au niveau personne, chaque nouvel entretien (autre métier) agrandit le corpus ET permet la triangulation par invariant. La fiche de voix se **régénère depuis tout**, comme la fiche de goût accumule ses passes.

**Le principe fondateur s'applique deux fois** : l'entretien pousse à la **verbosité maximale** — plus la personne déroule, plus il y a de goût *et* de voix à distiller. C'est le carburant des deux axes ; aucun protocole séparé de « capture de voix » n'est nécessaire, la voix est un **sous-produit gratuit** de la capture de goût. (Corollaire : tout ce qui bride la verbosité — questions fermées, choix binaires secs — appauvrit les deux axes à la fois.)

**Biais de corpus, à assumer et à noter** : la matière est de l'oral provoqué, sous tension, face à un intervieweur volontairement vilain. La personne y est plus tranchante que sa moyenne. On ne « corrige » pas ce biais (c'est aussi *elle*), on le **documente** dans la fiche (§ Complétude : « registre capté sous provocation ») et on le tempère par la matière n°2.

## 3. La grille d'analyse — voix · grammaire · lexique

Sept dimensions. Pour chaque trait retenu : le trait + **au moins un verbatim** qui l'atteste + son statut (**attesté** = ≥ 3 occurrences ou présent dans ≥ 2 transcripts · **proposé** = vu mais pas confirmé · sinon `[creux]`).

| # | Dimension | Ce qu'on cherche |
|---|---|---|
| 1 | **Lexique** | Les mots-signature, l'idiolecte : mots rares qui reviennent, anglicismes ou refus d'anglicismes, jurons et leur dosage, mots-outils favoris (« en vrai », « au fond », « du coup »), vocabulaire technique vs vernaculaire. |
| 2 | **Grammaire · syntaxe** | Longueur de phrase (rafales courtes vs périodes longues), ellipses, phrases nominales, ponctuation (tirets, parenthèses, points de suspension), questions rhétoriques, énumérations, l'oral qui déteint sur l'écrit. |
| 3 | **Registre** | Où elle vit sur les axes cru ↔ posé, sec ↔ chaleureux, littéral ↔ imagé, sérieux ↔ ironique. Tutoiement/vouvoiement. Comment elle désaccorde : frontal, oblique, par l'humour. |
| 4 | **Rythme** | Comment une pensée se déploie : thèse d'abord puis preuve, ou récit qui monte vers la chute ? Une idée par phrase ou tout dans une seule ? Où elle respire, où elle accélère. |
| 5 | **Images · métaphores** | Les **domaines sources** où elle puise (la cuisine, le bar, le sport, le chantier, la musique…) — pas les métaphores elles-mêmes (elles seraient du contenu), les *terrains* où elle va les chercher. |
| 6 | **Tics · rituels** | Comment elle ouvre, comment elle conclut, comment elle concède avant d'attaquer (« ok mais »), ses marqueurs d'emphase, ses hedges (ou leur absence totale). |
| 7 | **Le négatif** | **Ce qu'elle ne dit jamais** — le miroir des lignes rouges du goût. Les registres qu'elle ne prend pas (corporate, mielleux, jargonneux), les mots qui ne sortiraient jamais de sa bouche, les figures qu'elle n'emploie pas. Le savoir négatif est de l'or ici aussi : c'est lui qui empêche le modèle de retomber dans sa voix par défaut. |

> **Filtre d'étanchéité (systématique)** : à la fin de l'analyse, repasser chaque trait avec la question « est-ce que ce trait contient une *opinion sur le métier* ? » Si oui → il migre vers la fiche de goût, ou il saute. La fiche de voix doit pouvoir être lue par quelqu'un du métier opposé sans rien apprendre du goût de la personne.

## 4. La fiche de voix — le format

**Rangement** : `twins/<personne>/_voix.md` — le préfixe `_` la distingue des fiches d'agents (une par métier) : **une seule fiche de voix par personne**, partagée par tous ses twins. Tag : `Voix · <personne>`.

```markdown
# Fiche de voix — <Personne> · v1 [corpus : <n> entretiens (<métiers>), verdicts, injections · langue : FR]

## Empreinte (3 lignes)
L'essence de la voix — ce qu'on entendrait les yeux fermés. Avec un verbatim.

## Lexique
Mots-signature (avec verbatims) · dosage des jurons/anglicismes · statut par trait.

## Grammaire & rythme
Phrase type, ponctuation, déploiement de la pensée. Statut par trait.

## Registre
Position sur cru↔posé · sec↔chaleureux · littéral↔imagé · sérieux↔ironique. Comment elle désaccorde.

## Images & métaphores
Les domaines sources. [creux] si le corpus n'en montre pas.

## Tics & rituels
Ouvertures, concessions, emphases, clôtures.

## Jamais (le négatif)
Ce qui ne sort jamais de sa bouche — registres, mots, figures.

## Exemplaires (3 à 6)
Paires « générique → dans sa voix », construites depuis les verbatims (voir ci-dessous).

## Complétude
Traits attestés vs proposés vs [creux] · taille et biais du corpus (« capté sous provocation ») ·
langue de capture · métiers couverts (l'invariant est-il triangulé ?).
```

**Les exemplaires sont la pièce maîtresse.** Le cadre de posture ne *décrit* pas le ton de l'intervieweur, il le **montre** (les paires « Personne : / Toi : » de `lib/agents.ts`) — c'est ce qui le rend tenable par n'importe quel modèle. Même mécanique ici : chaque exemplaire prend une phrase générique-assistant et la **réécrit dans la voix de la personne**, en s'appuyant sur ses verbatims réels. Trois bons exemplaires portent plus de voix que trente adjectifs (« direct », « imagé », « cash » ne discriminent rien : tout le monde se croit direct).

```
Générique : « Cette approche présente des risques de maintenance à long terme. »
Alex :     « Non. Tu vas le regretter. Pas dans un an — au premier réveil à 3h du mat. »
```

*(Exemple fictif — les vraies paires se construisent depuis les verbatims du corpus, jamais inventées de zéro : on part d'une chose que la personne a réellement dite et on ne fait que déplacer le sujet.)*

## 5. La couche VOIX — l'injection (miroir du cadre de posture)

**Le précédent.** Le cadre `POSTURE` (`interviewer/lib/agents.ts`) prouve la mécanique : une posture éditoriale qui vit **dans le prompt, pas dans le modèle**, en trois blocs — INTERDITS · REGISTRE · MÉCANIQUE (exemples incarnés) — et n'importe quel modèle la tient. La couche VOIX est le **même objet, retourné** : la posture rend *l'intervieweur* incisif pendant la capture ; la voix rend *le twin* reconnaissable pendant la restitution.

**La compilation** : fiche de voix (document) → **bloc VOIX** (fragment de prompt), par un gabarit déterministe — pas de LLM dans la boucle de compilation, la distillation a déjà eu lieu. Squelette, calqué sur `POSTURE` :

```
VOIX — tu parles comme <Personne> (jamais comme un assistant), quel que soit le modèle qui te fait tourner :

JAMAIS :
- <le négatif, § Jamais de la fiche : registres, mots, figures interdits>
- Le registre assistant par défaut : listes à puces réflexes, « en résumé », enrobage poli.

REGISTRE : <§ Registre, comprimé en 2 lignes>. <Tutoiement/vouvoiement>. <Langue>.

LEXIQUE & RYTHME : <mots-signature, phrase type, ponctuation — 2-3 lignes>.

TA MÉCANIQUE (imprègne-t'en, ne la récite pas) :
<les exemplaires, format « Générique : / Toi : »>

DOSAGE : les tics colorent, ils ne tapissent pas — au plus un par réponse. Si un trait de voix
entre en friction avec le fond à exprimer, le fond gagne : tu es <Personne> qui parle, pas
quelqu'un qui imite <Personne>.
```

**La composition** — le prompt d'un twin devient trois couches, dans cet ordre :

```
RÔLE   (l'agent BMAD : mission, surfaces, livrables)        — couche framework
GOÛT   (la fiche {agent} · {personne} : canon, heuristiques, — couche métier·personne
        lignes rouges)
VOIX   (le bloc VOIX de {personne})                          — couche personne
```

Règles de composition :

- **Additive** : sans bloc VOIX, le twin fonctionne comme aujourd'hui. Rien ne casse — c'est la même garantie que le cadre de posture (on peut l'enlever, l'entretien reste un entretien).
- **Précédence** : en cas de conflit, le goût gagne sur le **contenu**, la voix gagne sur la **forme**. La voix ne peut ni ajouter ni retirer un jugement ; elle ne fait que le faire sonner.
- **Une voix, N goûts** : les deux twins d'une même personne (son UX, son PM) partagent le même bloc VOIX et divergent par la fiche de goût — c'est correct par construction : c'est le même humain sous deux casquettes. Deux personnes sur le même rôle : même fiche de goût impossible, même bloc VOIX impossible → deux twins pleinement distincts. C'est ce qui rend le party mode discriminant.
- **Intensité par surface** : `pleine` quand le twin *parle* (réaction, crit, avis, party mode) · `trace` quand il *produit un artefact* (PRD, spec — la voix colore les jugements, la clarté du livrable prime) · `muette` désactivable. Un réglage, pas trois blocs.
- **Langue** : la voix est captée dans une langue (le corpus est FR aujourd'hui). Les tics ne se traduisent pas — en sortie EN, le bloc VOIX passe en `trace` (registre et rythme survivent à la traduction, le lexique non) et la fiche note `[creux] en EN`. Une voix EN se capture, elle ne se traduit pas.

## 6. Les pièges (et les garde-fous)

1. **La caricature.** Le mode d'échec n°1 : le modèle amplifie les tics jusqu'à la parodie — chaque réponse ouvre par le même juron, chaque phrase est une punchline. Garde-fous : la clause DOSAGE dans le bloc ; des exemplaires plutôt que des adjectifs (un adjectif s'exagère, un exemple se calibre) ; le test de stabilité (§ 7).
2. **La voix qui déborde sur le goût.** Une métaphore fétiche devient un argument, un juron devient un verdict. Garde-fous : le filtre d'étanchéité (§ 3) à la distillation ; la règle de précédence (§ 5) à l'injection.
3. **La contamination par l'intervieweur.** La personne répond à un provocateur : elle sur-joue le tranchant, emprunte parfois les images de la question. Garde-fous : écarter les tours de l'intervieweur du corpus ; ne jamais attester un trait qui n'apparaît *que* dans des réponses-miroir (reprise des mots de la question) ; surpondérer verdicts et injections (voix hors tension).
4. **Le sur-ajustement au corpus mince.** Un seul entretien = une voix *proposée*, pas attestée. Garde-fous : les seuils du § 3 (≥ 3 occurrences ou ≥ 2 transcripts) ; la triangulation par l'invariant dès le deuxième métier ; `[creux]` assumé plutôt que trait inventé.
5. **L'ancrage.** Montrer sa fiche de voix à la personne avant validation → elle se met à la *performer* (ou à la contester par coquetterie), et tout corpus ultérieur est pollué. Même règle que le goût : **la personne ne voit pas sa fiche avant le test en aveugle** — et idéalement pas avant que tous ses entretiens prévus soient passés.
6. **Le demi-twin inversé.** On a nommé le risque « décide comme toi, parle générique » ; le symétrique existe — *parle comme toi, décide générique* — et il est plus vicieux : la voix **masque** l'absence de goût (ça sonne juste, donc ça a l'air de penser juste). Garde-fou : les deux harness de validation restent séparés — le contrefactuel goût (la décision change-t-elle ?) ne se laisse jamais remplacer par le test de voix (on le reconnaît ?). Sonner juste ne prouve pas juger juste.

## 7. La validation — « on reconnaît l'auteur les yeux fermés »

Miroir du harness de vérif du goût (contrefactuel : même tâche avec/sans). Trois étages, du mécanique au social :

1. **Contrefactuel de forme.** Même tâche, même fiche de goût, avec/sans bloc VOIX → deux sorties. Si un proche de la personne ne peut pas dire laquelle est « elle », la couche est inerte : on la retravaille (exemplaires plus incarnés) ou on l'admet `[creux]`.
2. **Test en aveugle.** N sorties mélangées — twins voisés de A, de B, et sans voix — devant des gens qui connaissent A et B : attribution à l'aveugle. Seuil proposé : nettement au-dessus du hasard sur ≥ 10 attributions ; sous le seuil, la voix n'est pas captée, elle est décorée.
3. **Stabilité (l'anti-bruit de la voix).** Le doublon du canal révélé, transposé : la même tâche soumise deux fois au même twin voisé, à distance. Si la voix change de couleur d'une passe à l'autre, le bloc décrit un déguisement, pas une voix — c'est une donnée, pas un échec à cacher.

**Party mode 🎉 = les trois d'un coup, en social et en 30 secondes.** Plusieurs twins dans la même pièce sur une décision : si le Backend est sec, la DA lyrique, le PM tueur et le DevOps grognon — et qu'on sait *qui parle sans lire les étiquettes* — la couche voix ET la couche goût tiennent ensemble. Si tout le monde sonne comme la même IA sous onze chapeaux, on le SAIT aussi vite. C'est la démo et la validation ultimes, et c'est pour ça qu'il vient *après* les étages 1-3 : on n'invite pas des gens à une party pour découvrir que la sono est morte.

## 8. Le branchement dans l'app — la CAPTURE est en ligne (2026-07-01)

La moitié **capture** de l'axe voix est câblée dans l'app (décision : les entretiens du gate de validation sont précisément le corpus qu'on veut voisé — autant capter la voix pendant qu'ils tournent) :

- **`voicePrompt(person, version)`** dans `lib/agents.ts`, miroir de `fichePrompt()` : la grille des § 2-3-4 (corpus = tours PERSONNE seuls, tours INTERVIEWEUR = contexte anti-emprunt-miroir ; surpondération des raisons de verdicts / pourquoi d'injections ; seuils attesté/proposé ; filtre d'étanchéité ; exemplaires ancrés aux verbatims ; biais « oral provoqué » noté en Complétude).
- **Route `/api/voice`** : agrège **tous** les profils de la personne (transcripts + raisons + pourquoi), régénère la fiche de voix **depuis tout le corpus** à chaque passe (jamais d'« enrichissement » incrémental — la voix est l'invariant, on la re-triangule). Stockée sous l'agent sentinelle **`_voix`** dans la table `profiles` (aucune migration) → embarquée d'office dans l'export opérateur.
- **UI** : carte « 🎙️ Ta voix » dans l'espace (distiller / voir / redistiller · version affichée) + **verbosité outillée** dans l'entretien : hint permanent (« déroule, parle au micro ») et **dictée au micro** (Web Speech API, langue du parcours) — le principe fondateur, rendu physique.
- **Rangement final** : les fiches captées descendent dans `twins/<personne>/_voix.md` via l'export.

**Reste gaté sur le go du Temps ②** : le **compilateur** (le gabarit fiche → bloc VOIX du § 5, assemblé RÔLE + GOÛT + VOIX vers les surfaces BMAD, avec l'intensité par surface) et le **harness de validation** (§ 7). La capture tourne ; l'injection attend le compilateur de twin — même livraison : un twin qui **décide** comme la personne *et* **parle** comme elle, vérifié par contrefactuel des deux côtés.

---

*Docs liées : [`ROADMAP.md`](../../ROADMAP.md) (§ Le second axe — la voix · § Party mode) · [`README.md`](README.md) (le protocole goût, les 3 temps) · [`../interviewer/lib/agents.ts`](../interviewer/lib/agents.ts) (le cadre `POSTURE`, précédent de la couche VOIX) · [`../../METHOD.md`](../../METHOD.md) (les trois couches).*
