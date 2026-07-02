# Étude — Addon de capture de GOÛT (taste twins injectables)

## 0. Verdict en une page

Le projet ne souffre pas d'un manque de matière : il souffre d'un risque de **décor**. Un twin riche, beau, qui fait hocher la tête (« c'est bien moi ») mais ne change **aucune décision** est l'échec par défaut de ce genre de système. Toute la valeur se joue sur une seule bascule : transformer le goût d'**avis averageable** en **contrainte qui change la sortie**.

Trois décisions structurantes, dans cet ordre de priorité :

1. **Construire l'infrastructure d'impact AVANT de sourcer quoi que ce soit.** Le compilateur de twin (routage par surface×force), l'index décision-cible, l'extraction de vetos détectables, et le harness de vérification contrefactuelle. Sans eux, chaque heure de sourcing produit du décor.
2. **Router le goût par section vers des surfaces natives différentes, à des forces croissantes** — du cadrage persona (faible) au reviewer adversarial en subagent (fort). La revue adversariale séparée est le seul mécanisme qui empêche réellement l'agent de rationaliser le goût hors de la décision.
3. **Trancher rôle par rôle sur le canal de capture** : certains rôles ont un objet natif déjà textuel/code (Winston, Tessa, Camille) où le deck texte est natif et cheap ; d'autres sont image-first (Sally, Margaux) où le deck texte est un repli dégradé ; d'autres encore sont hybrides (Nora, Dara, John).

---

## 1. Définition opérationnelle du goût

Le goût **n'est pas une liste de préférences**. C'est une **fonction de discrimination reproductible** : ce qui, devant deux options également viables, en tranche une de façon **stable**, sur un **axe nommable**, qui **prédit le verdict sur des cas jamais vus**, et qui **coûte** quelque chose.

### Les trois tris à l'entrée du protocole

| | Définition | Transfert |
|---|---|---|
| **Préférence** | « j'aime X » — un point sur la carte | zéro |
| **Avis** | un verdict sur UN objet, souvent emprunté | nul ou faible |
| **Goût** | un axe stable qui **transpose, tranche, généralise et coûte** | élevé |

Un item capturé qui échoue aux quatre tests (transpose / tranche / généralise / coûte) est rangé comme **flavor text**, pas comme goût.

### Trois invariants de capture

- **Déclaré ≠ Révélé, jamais fusionnés.** Le déclaré (ce qu'on DIT valoriser) est abstrait, aspirationnel, facile à truquer → **poids faible**. Le révélé (ce qu'on a shippé, tué, reverté, là où on a flinché) est coûteux donc dur à falsifier → **gagne en cas de conflit pour prédire une décision**.
- **L'écart déclaré↔révélé est le signal le plus riche, pas du bruit.** Trois lectures actionnables : *vecteur* (direction visée), *angle mort* (goût tacite à baptiser), *costume* (valeur jamais enactée, à dévaluer). On le stocke comme **tension raisonnable**, jamais écrasé en cohérence.
- **Le savoir négatif et les paradoxes assumés sont l'empreinte.** Les rejets (+ leur POURQUOI) discriminent plus que les likes (encombrés). Les paradoxes (« minimal mais chaud », « X sauf si Y ») se stockent comme **règles conditionnelles avec condition-frontière** — les lisser détruit le goût.

### Le critère d'acceptation unique : le FLIP TEST

> Pour chaque item capturé : l'agent déciderait-il **différemment** AVEC vs SANS cet item ?

Si aucune décision plausible ne bascule, l'item est rejeté du moteur. C'est la garde anti-décor à l'échelle de la ligne.

---

## 2. Modèle d'impact — comment le goût change RÉELLEMENT les décisions

L'unité actionnable n'est **pas le trait** (« architecte pas plombier ») mais le **verdict orienté** que la machinerie capte déjà :

```
(objet, geste ∈ {garde · jette · recombine}, raison, décision-cible)
```

La **décision-cible est la clé d'index**. Au point de choix, l'agent ne peut consulter que ce qui est clé sur ce choix. Toute prose clée sur la **personne** (POV, posture, verbatims) est **inatteignable au runtime** : elle s'effondre en « fais-le bien / humain / cohérent » — un no-op qui reproduit la moyenne générique.

### Les formats d'impact, du plus faible au plus fort

1. **CANON `vole | interdit`** → pondère les options pendant la génération. Embarque le discriminateur par construction : « vole l'exigence | interdit l'inaccessibilité de Liquid Glass » est une règle runtime ; « sois comme Apple » est inerte (Apple s'est contredit).
2. **Heuristiques SI-ALORS** → tirent **seulement si le déclencheur est détectable** par l'agent. « QUAND j'ai rendu un écran ALORS exige les 4 états » tire ; « tire le fil de la marque » ne tire pas (aucune précondition détectable). Exiger un **Y nommé** (l'alternative écartée), pas un adjectif.
3. **Lignes rouges / vetos** → le format le moins cher : une porte binaire vérifiée mécaniquement, **zéro raisonnement-goût** au runtime. Mais seulement si formulés en **artefact détectable** (« pas de "ce soir" vide », « pas de lorem/carré gris ») et non en valeur invérifiable.
4. **Exemplars annotés** → la plus haute fidélité : la récupération-par-similarité du LLM transfère le verdict **au grain**, et porte le paradoxe sans le résoudre (deux exemplars peuvent tirer en sens opposé — c'est ça, le vrai goût).

### Ce qu'on JETTE de l'impact

- Les **pondérations numériques** (le twin lui-même les moque : « RICE, approximations déguisées en chiffres »). On ne sauve que **l'ordre lexicographique** comme tie-breaker (accessibilité > delight > nouveauté).
- On encode des **forks, pas des positions**. `recombine` est le geste le plus riche (« l'architecte se révèle dans ce qu'il REBÂTIT ») : l'agent doit pouvoir **transformer** un candidat, pas seulement l'accepter/rejeter.
- On **sépare physiquement les couches** : seule la couche actionnable (clée par décision) entre dans le prompt runtime ; POV/verbatims restent hors-runtime comme provenance de validation humaine, sinon ils diluent l'agent vers le « bon design » générique.

---

## 3. Decision loop — où/comment injecter pour que ce soit vraiment considéré

Le goût injecté en bloc dans le system-prompt est **décoratif par construction** : le modèle hoche la tête puis sort la moyenne. Le repo applique déjà le bon patron au gate d'expérience (prepend / persistent_facts / finalize_reviewers à force croissante) ; **le goût subit exactement ce traitement.**

### Échelle de force (un « compilateur de twin » : `.md` → fragment `customize.toml` appendé sur l'agent, arrays append / scalaires override)

| Section du twin | Surface native | Moment | Force |
|---|---|---|---|
| POSTURE / POV | `agent.identity/role` | cadrage ambiant | **faible** (assumé) |
| CANON `vole\|interdit` | `persistent_facts` | pondération pendant la génération | moyen |
| HEURISTIQUES / penchants | `activation_steps_prepend` + prompts de menu | **au point de choix** (tie-breaker) | moyen-fort |
| LIGNES ROUGES / bêtes noires | `persistent_facts` + `finalize_reviewers` | **veto dur** | **fort** |

Injecter tout au même niveau = tout au niveau du plus faible.

### Les deux mécanismes anti-décor

- **Forcer le VERDICT, pas le vibe.** L'output contract IMPOSE à l'agent d'**émettre le tuple** `(objet, garde/jette/recombine, raison, décision-cible)` contre chaque option contestée. On ignore un blob qu'on lit ; on n'ignore pas un twin contre lequel on doit déposer un verdict écrit.
- **Revue adversariale séparée** (le cœur du « really considered »). L'agent qui GÉNÈRE rationalise toujours sa sortie. Un `finalize_reviewer` en **subagent séparé, contexte frais**, ne portant QUE la lentille de goût + les lignes de divergence déclaré↔révélé, rend un verdict adverse OUI/NON + violations. Le twin entre **deux fois** : faiblement comme cadrage, fortement comme reviewer qui bloque.

### Deux invariants non négociables

- **Gater par la bande contestée.** Ne JAMAIS fire le twin sur du canon (une seule bonne réponse connue) — c'est du bruit qui entraîne l'agent à ignorer le twin. Quinn ne déclenche que sur ship/no-ship ; Margaux/Camille/Winston sur presque chaque call load-bearing.
- **Dormant jusqu'à validation, et propose sans trancher.** Décideur-unique : sur un fork load-bearing, le twin remonte le fork + son penchant + le rationnel ; il ne résout pas en silence (garde-fou contre le goût figé).

Et il porte **l'écart, pas le déclaré** : « avarice DÉCLARÉE mais appétit RÉVÉLÉ pour le saturé ; en conflit, fais confiance au révélé » donne au twin son pouvoir de contredire la sortie attendue.

---

## 4. Vérification — méthode légère pour prouver l'impact

Un twin n'a de valeur que **falsifiable** : pouvoir exhiber une décision qui n'aurait PAS été prise sans lui. Pas un sentiment (« ça sonne plus Ismaïl »), trois artefacts reproductibles.

1. **Contrefactuel (test souverain).** Toute tâche jouée DEUX fois — `--no-twin` vs agent+twin, même prompt, même seed. On diffe les **décisions discrètes** (composant, ordre d'états, mot de copy, étape retirée), pas la prose. Métrique : **decision-divergence**. Divergence = 0 sur une tâche où le twin aurait dû peser → twin cosmétique. On teste donc sur des **tâches-tension** construites pour que le goût DOIVE trancher contre le réflexe générique.
2. **Ledger de rejets cités.** Chaque sortie porte « écarté : X — parce que [ligne SPÉCIFIQUE du twin, ID stable] ». Un twin qui ne tue jamais rien d'attribuable à SES interdits est du papier peint.
3. **Test aveugle (barre d'acceptation).** Sorties strippées de labels, « laquelle est Sally ? ». **Sur sorties normalisées en style** (mêmes mots imposés) pour isoler l'empreinte de **décision** de l'empreinte de **surface** — si l'attribution s'effondre une fois le style neutralisé, le twin n'agit que sur la peau.

**Instrumentation :** 3 fichiers par tâche — `baseline.md`, `grounded.md`, `verdict.json` (decision-divergence, rejets-cités, attribution). Une tâche n'est « vérifiée » que si les trois sont verts.

**Garde-fou préalable par terrain** (avant tout croisement déclaré↔révélé) : 3-4 objets en **doublon** à ~20 min d'écart, ordre brouillé. Geste incohérent = canal révélé = **bruit sur ce terrain** → repli text deck/injection (donnée, pas échec). Risque réel pour **Tessa, Winston, Dara**.

À terme : **auditer quelles lois s'allument**. Les lignes qui ne tirent jamais = lest à élaguer ou réinterviewer.

---

## 5. Source matrix — meilleur objet × meilleure source × faisabilité × signal

| Rôle | Meilleur objet | Meilleure source | Faisab. | Signal / réserve honnête |
|---|---|---|---|---|
| **Sally** | Écrans/flows réels en mouvement, curés par axe de tension | Mobbin (MCP) → réhéberge Supabase ; objet éthique mixé deceptive.design | **high** | Élevé (pool prouvé). PLAFOND : flow navigable + micro-interaction non reproductibles en stills → sessions facilitées. IA-nue + recombine → Penpot/texte |
| **Tessa** | Gating v0-vs-Carbon (obj.8) + frontière espacement valeur/structure (obj.7) | GitHub MCP (Radix, tokens.json DTCG, Carbon/Primer) | **high** | Élevé MAIS conditionnel — révélé à FALSIFIER. Contrôle non-bruit obligatoire. Phygital + Figma-vs-prod → texte/Penpot |
| **John** | L'annonce de KILL/sunset (obj.2, l'objet neuf) | killedbygoogle (dataset) + GitHub issues + Wayback ; Mobbin pour la moitié pricing/bloat | **high** | Élevé mais PRÉ-NARRÉ → stripper le verdict. Framework prio + A/B → deck texte. Injection exceptionnelle |
| **Camille** | L'intention stratégique nue (Why/ennemi/insight/archétype) | Pages About/Manifeste (scrape) + films de campagne + foresight gratuit | **high** | Élevé — deck texte NATIF, pas un repli. Aucun MCP socle. Pool partagé Margaux annoté |
| **Margaux** | Matière PRIMAIRE DA (logo-système, typo, couleur, monde de marque) | Curation manuelle → bucket Supabase : Brand New/BP&O + Fonts In Use + Are.na (seul bootstrap API) + The Dieline | **medium** | Élevé — métier image-first, aucun MCP ne sert la matière primaire. Injection centrale. GitHub/Context7 hors-jeu |
| **Nora** | Hybride : microcopy en contexte (UX-writer) + tagline/kill-darlings (CR) | Mobbin + GitHub/web style guides (obj.5) + Goodmicrocopy/Marketing Examples ; injection swipe file | **high** | Élevé côté Mobbin/GitHub ; CR pur → manuel/texte. Objets 4/5/7 sans écran |
| **Winston** | Schéma relationnel nu (obj.1, recombinaison) + migrations (obj.2) + ADR (obj.3) | GitHub MCP search_code + dataset Spider/BIRD | **high** | Élevé — objet natif = texte-code, canal révélé CHEAP et haute-fidélité. Contrôle non-bruit. Mobbin/Penpot/Context7 nuls |
| **Dara** | La preuve sous ambiguïté (obj.1, le plus discriminant) | Our World in Data (API) + Reddit r/dataisugly + Spotify Wrapped | **high** | Élevé (débat pré-fourni). Split par famille. Forks petit-n → texte. Datasets bruts = mauvais objet |

---

## 6. Build order — priorisé par ratio impact/faisabilité

> Règle : maximiser le nombre de décisions qui basculent par heure investie.

0. **TRANSVERSE D'ABORD — l'infrastructure d'impact** : compilateur de twin (routage surface×force), index décision-cible sur chaque record, extraction de vetos détectables, découpage couche-humaine/couche-agent, harness `verify-twin` (`--no-twin` + 3 fichiers + IDs stables). **Ratio le plus haut** : débloque tous les rôles ; sans elle, tout sourcing est décor.
1. **INJECTION, tous rôles** — coût de sourcing nul, signal le plus haut par unité d'effort. Load-bearing surtout pour John (pari/milieu), Margaux (fétiches DA), Nora (swipe file), Dara (la stat qui a fait abandonner).
2. **Winston × GitHub MCP** (schéma + migrations + ADR) — ratio le plus haut des canaux sourcés : texte-code, MCP connecté, zéro rendu. Précédé du contrôle non-bruit.
3. **Tessa × GitHub MCP** (gating + espacement) — structure=code, vérifié live. **Strictement gaté** par le contrôle non-bruit.
4. **Sally × Mobbin** — pipeline déjà PROUVÉE. Étendre par axe de tension.
5. **John** — deux couches : Mobbin (live) + killedbygoogle/GitHub pour le KILL.
6. **Dara** — chart trompeur en priorité (OWID + r/dataisugly), split par famille.
7. **Nora** — hybride : Mobbin (ROI immédiat) + style guides ; CR manuel en dernier.
8. **Camille** — deck texte de cartes-postures (canal NATIF), sourcé manuellement.
9. **Margaux** — board image curé → Supabase, amorcé Are.na. Le plus coûteux mais plafond DA le plus haut — **après** les canaux high-feasibility.

### Ce qu'on NE devrait PAS brancher

- **Context7 comme source de stimulus** — canon qui DÉCRIT la bonne pratique, ne fournit aucun objet natif à trancher. Au mieux helper de framing. Tous rôles.
- **Penpot comme corpus/source** — c'est un canvas vide. Uniquement comme surface bespoke pour le recombine et l'IA-nue de Sally / objet 6 de Tessa.
- **Figma Community / Dribbble / Behance comme flows honnêtes** — aspirationnel, viole garde-1. Uniquement comme **anti-pôle « matière sans fonction »** assumé.
- **GitHub pour Margaux** — logos utilitaires plats, signal pauvre.
- **Mobbin pour Tessa** (rendu ≠ structure) et **Winston** (aucun schéma).
- **Templates RICE/Kano** (John obj.4) et galeries de templates — aseptisés/factices → deck texte.
- **Datasets bruts Kaggle/data.world** (Dara) — preuve présentée, pas brute.
- **Ne PAS revenir au deck texte pour Sally et Margaux** (image-first) — mais le deck texte EST natif pour Camille, Winston, et pour les forks non-visualisables de Tessa/John/Dara/Nora.
- **Côté injection** : ne pas injecter en blob de persona, ne pas fire sur du canon, ne pas résoudre un fork en silence.

---

## 7. Questions ouvertes

1. **Taux d'échec du contrôle non-bruit** : combien de rôles passeront le test des doublons ? Tessa/Winston/Dara sont à risque de « déclaré camouflé en révélé ». Quel seuil avant de basculer en injection lourde ?
2. **Matière non-capturable** : flow navigable + micro-interaction (Sally) et board image (Margaux) ont le plafond le plus haut mais ne sont pas wireables en self-serve. Sessions facilitées, ou twin plafonné ?
3. **Interchangeabilité des twins** : que se passe-t-il quand deux twins du même rôle ont des vetos contradictoires ? Le décideur-unique humain reste-t-il en boucle au déploiement public ?
4. **Seuil de « prêt pour les potes »** : ≥1 tâche-tension verte suffit-il pour du public, ou un quota par axe load-bearing ?
5. **Audit des lois** : si 3 lignes seulement s'allument sur 20 tâches, élague-t-on auto ou réinterviewe-t-on ?
6. **Contamination par le verdict** : teardowns, r/dataisugly, killedbygoogle arrivent pré-narrés. Le stripping est-il fiable à l'échelle ?
7. **Panel du test aveugle** : Ismaïl seul risque la complaisance d'auteur. Agent-juge frais systématique ? Sur quel corpus de distracteurs ?
8. **Pool partagé Camille/Margaux** : les deux lentilles (intention vs craft) se pollueront-elles au runtime quand le même artefact porte deux clés de décision ?