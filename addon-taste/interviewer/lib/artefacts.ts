// Le canal RÉVÉLÉ : classification (juger des artefacts) + injection (apporter les siens).
// Méthode : voir ../../protocol/README.md. Decks dérivés des « objets natifs » par agent.
// Bilingue (FR/EN) : ce que la personne LIT est traduit ; les ids restent stables.

import type { Lang } from "./i18n";

export type Geste = "garde" | "jette" | "recombine";

export type Card = {
  id: string;
  label: string; // l'artefact / le parti-pris à juger
  hint?: string; // sous-texte optionnel
  src?: string;  // image optionnelle (URL) pour les métiers visuels
  link?: string; // lien optionnel (doc/Figma) pour les « fiches de références nommées »
};

export type Deck = {
  intro: string;
  cards: Card[];
};

// Un verdict de classification (sortie de la phase 2).
export type Verdict = { id: string; label: string; geste: Geste; reason: string };

// Un artefact injecté par la personne (sortie de la phase 3).
export type Injection = {
  label: string;
  stance: "fétiche" | "bête-noire";
  why: string;
  image?: { media_type: string; data: string }; // upload optionnel (base64)
};

const c = (id: string, label: string, hint?: string, link?: string): Card => ({ id, label, hint, link });

const DECKS_FR: Record<string, Deck> = {
  sally: {
    intro:
      "Je te montre des partis-pris d'interface croisés ailleurs (affordance, parcours, prévisibilité). Pour chacun : garde / jette / recombine — et surtout POURQUOI, au grain.",
    cards: [
      c("sally-1", "Un onboarding en 5 écrans qui t'explique tout AVANT de te laisser entrer dans l'app."),
      c("sally-2", "Une app qui réinvente le retour : pas de flèche back, un swipe maison à apprendre."),
      c("sally-3", "Un écran vide qui affiche « rien ce soir » plutôt que de replier sur « cette semaine »."),
      c("sally-4", "Un compteur social affiché à 0 (0 like, 0 participant) sous chaque élément."),
      c("sally-5", "Une micro-interaction qui ajoute 200 ms de matière (rebond, grain) à un geste répété 50×/jour."),
      c("sally-6", "Un formulaire qui demande tout d'un bloc vs un qui te fait avancer champ par champ."),
    ],
  },
  tessa: {
    intro:
      "De VRAIS design systems, connus. Pour chacun : garde (tu leur voles) / jette / recombine — et pourquoi. Clique la doc si tu ne connais pas.",
    cards: [
      c("tessa-1", "Radix — headless, non-stylé, accessibilité d'abord : il te donne le comportement, à toi la peau.", "Liberté sacrée, ou refus de trancher qui refile le boulot dur au consommateur ?", "https://www.radix-ui.com"),
      c("tessa-2", "shadcn/ui — pas une dépendance : tu copies-colles le code chez toi et tu le possèdes.", "Génie anti-lock-in, ou fin du « système » (chacun sa copie qui diverge) ?", "https://ui.shadcn.com"),
      c("tessa-3", "Material 3 (Google) — l'opinion de Google imposée partout : tokens, motion, formes.", "Cohérence mondiale rassurante, ou tout se ressemble et ta marque meurt ?", "https://m3.material.io"),
      c("tessa-4", "Carbon (IBM) — enterprise, ultra-complet, lourd, très normé.", "Rigueur qui scale à 1000 devs, ou cathédrale qui écrase une équipe de 5 ?", "https://carbondesignsystem.com"),
      c("tessa-5", "Ant Design — dense, tout est fourni (tables, transferts, tout).", "Productivité brute, ou esthétique « admin panel » dont on ne sort jamais ?", "https://ant.design"),
      c("tessa-6", "Polaris (Shopify) — autant de guidelines de CONTENU / voix que de composants.", "Le DS comme contrat de marque, ou sur-cadrage qui infantilise le designer ?", "https://polaris.shopify.com"),
    ],
  },
  john: {
    intro:
      "Des décisions PRODUIT réelles (la dimension business). Garde / jette / recombine : tu shippes ? tu tues ? c'est la killer feature ou du bloat ?",
    cards: [
      c("john-1", "Une roadmap publique avec 30 features « planned », jamais datées."),
      c("john-2", "Un produit qui TUE sa feature la plus utilisée parce qu'elle dilue la vision."),
      c("john-3", "Une priorisation RICE où chaque score est une approximation déguisée en chiffre."),
      c("john-4", "Un pricing à 3 tiers (Free / Pro / Team) vs un usage-based."),
      c("john-5", "Une feature shippée parce que l'A/B test gagne 2 %, sans conviction derrière."),
      c("john-6", "Un MVP qui ajoute un écran de friction EXPRÈS pour augmenter la rétention."),
    ],
  },
  camille: {
    intro:
      "Des postures de marque NUES — l'intention, l'ennemi, l'archétype, jamais le visuel. Pour chacune : je garde · je jette · j'en vole un bout — et surtout POURQUOI. Ce qui m'intéresse, c'est le pari de sens : ce qu'il tranche, ce qu'il interdit, et ce qu'il trahit d'une tendance de conso, de culture, de société.",
    cards: [
      c("camille-1", "Une marque d'eau en bouteille se dote d'un Why qui vise haut — « reconnecter l'humanité à la nature » — longtemps après le lancement, sur un produit inchangé. Le sens arrive par le récit, pas par le produit.", "Un Why peut se construire par le récit et tirer tout le reste vers le haut, ou un sens sans aucune preuve dans le produit s'effondre au premier regard ?"),
      c("camille-2", "Une marque qui désigne un ennemi nommé et lui crache dessus à chaque prise de parole — quitte à insulter la moitié du marché qui, elle, aime bien l'ennemi en question.", "Un ennemi qui soude une tribu et te rend inévitable, ou de la pub gratuite au leader et un client sur deux qui te ferme la porte ?"),
      c("camille-3", "Une marque qui appuie pile sur une honte intime — « ton haleine, ta calvitie, le fait que tu n'es pas assez » — parce que la peur convertit trois fois mieux que le rêve.", "Nommer une vraie douleur, c'est le levier le plus honnête et le plus puissant qu'on ait, ou une marque qui grandit en creusant le complexe empoisonne le lien même qu'elle vend ?"),
      c("camille-4", "Deux briefs sur la table. L'un promet un chiffre qu'on pourrait te reprocher au tribunal (« livré en 30 min ou c'est offert »). L'autre murmure « vivez l'instant » : joli, intouchable, engageant à rien.", "Une promesse qu'on peut te faire manger si tu ne la tiens pas, ou une évocation qui sonne bien et ne parie rien ?"),
      c("camille-5", "Une marque met sa propre faiblesse en avant au lieu de la cacher — « on est plus chers », « c'est moche mais ça dure », « numéro deux, alors on se démène ». L'anti-marketing comme posture.", "L'aveu qui désarme et rend crédible quand tout le monde survend, ou une modestie qui grave ton défaut dans le marbre et t'interdit à jamais de faire rêver ?"),
      c("camille-6", "Une banque sort un manifeste militant sur la justice sociale au pic exact où toutes les marques le font — le message est peut-être sincère, mais il arrive en plein troupeau.", "Une posture qui capte un vrai basculement de société au bon moment, ou un opportunisme qui SONNE FAUX parce que tout le monde dit déjà la même chose ?"),
    ],
  },
  margaux: {
    intro:
      "Des partis-pris de DIRECTION ARTISTIQUE de marque (identité, typo, campagne, territoire). Garde / jette / recombine selon ce qui POSE une marque vs ce qui décore — et pourquoi, à l'œil. (Tu pourras uploader tes propres références à l'injection juste après.)",
    cards: [
      c("margaux-1", "Un logo réduit à un seul monogramme, sans nom écrit : confiance, ou arrogance prématurée ?"),
      c("margaux-2", "Une identité portée à 80 % par UNE typographie forte — logo discret, presque pas de couleur."),
      c("margaux-3", "L'avarice chromatique : un seul accent sourd, austère, « pas instagrammable »."),
      c("margaux-4", "Une marque-monde déclinée partout (affiche, packaging, film) à partir d'un seul motif."),
      c("margaux-5", "Une identité qui CASSE sa propre grille pour un coup de DA, au prix de la cohérence."),
      c("margaux-6", "La DA de marque diluée en « clean SaaS » dès qu'elle descend dans l'interface."),
    ],
  },
  winston: {
    intro:
      "Des décisions d'ARCHI livrées avec leur contexte : taille d'équipe, trafic, budget, ce que ça coûte vraiment. Pour chacune : garde / jette / recombine — et surtout POURQUOI. Pas de bonne réponse planquée ici : je veux voir où ta lame tranche, et ce que t'acceptes de PERDRE en tranchant.",
    cards: [
      c("winston-1", "En réunion on te demande, net : monolithe ou micro-services pour le nouveau produit ? Tu réponds « ça dépend », tu sors une matrice de critères, et tu renvoies la décision à un atelier la semaine prochaine.", "Nuance d'expert qui refuse de trancher à l'arrache, ou planque élégante pour ne jamais porter le chapeau quand ça foire ?"),
      c("winston-2", "Équipe de 5, 3 000 utilisateurs, une file de jobs à traiter. L'un veut Postgres + un cron qui tourne toutes les minutes ; l'autre monte Kafka + un worker Flink « pour être prêts à scaler ».", "Le cron chiant qui shippe ce soir et tiendra dix ans, ou le vrai outil qui t'épargne la réécriture le jour où ça décolle — décollage qui n'arrivera peut-être jamais ?"),
      c("winston-3", "Startup, 6 devs, deadline dans deux mois. Il faut de l'auth (SSO, MFA, reset) et du paiement. Un dev veut tout coder maison « pour maîtriser et pas cracher 800 €/mois » ; l'autre branche Clerk + Stripe et passe à autre chose.", "Le SaaS qui te coûte un loyer mais t'achète trois mois, ou le build maison que tu possèdes — jusqu'au jour où tu déterres une faille dans TON propre code de MFA ?"),
      c("winston-4", "Équipe de 4, 200 utilisateurs. Pour « bien séparer les responsabilités », on découpe le produit en 8 services qui se parlent en HTTP, chacun sa base, son déploiement, ses logs. La feature qui faisait la moitié de la valeur est maintenant à cheval sur trois d'entre eux.", "Frontières propres qui laisseront grandir chaque bout, ou complexité qui a juste déménagé du code vers le réseau — où le moindre ajout touche désormais trois repos ?"),
      c("winston-5", "Un script de 200 lignes sans tests, un Google Sheet et un cron qui recollent deux systèmes chaque nuit. C'est moche, personne n'ose y toucher, et ça tient la prod sans broncher depuis 18 mois. Le nouveau veut tout réécrire « proprement » en service versionné et testé.", "Bricolage honteux à remplacer avant qu'il t'explose à la gueule, ou preuve qu'un truc jetable qui MARCHE vaut mieux qu'un truc « robuste » pas encore écrit ?"),
      c("winston-6", "Deux options encaissent la charge pareil. La première : une base serverless propriétaire, magique en démo mais impossible à quitter sans tout réécrire. La seconde : Postgres banal, plus de plomberie à faire soi-même mais on en sort en un week-end. Le fondateur veut la magique pour le pitch investisseurs.", "On juge sur ce que ça fait aujourd'hui, ou sur ce que ça coûte d'en SORTIR demain — quitte à choisir la moins brillante juste parce qu'elle est réversible ?"),
    ],
  },
  kai: {
    intro:
      "Des décisions de BUILD réelles, croisées ailleurs — celles où deux façons rendent le MÊME écran et où seul ton goût tranche l'invisible (le rendu, la cascade CSS, le poids envoyé, l'accessibilité). Chacune arrive avec son contexte et ce qu'elle coûte. Pour chacune : je garde / je jette / j'en vole un bout — et surtout POURQUOI, au grain.",
    cards: [
      c("kai-1", "Une équipe de 3 monte un site vitrine et un blog. Choix par défaut sans discuter : create-next-app, React, 200 kB de JS pour trois pages qui ne bougent jamais.", "Réutiliser le défaut que toute l'équipe maîtrise déjà — sagesse qui livre vite, ou 200 kB qu'aucune de ces trois pages ne justifiera jamais ?"),
      c("kai-2", "Une équipe de 6 se déchire sur le CSS : les uns collent des classes Tailwind directement dans le JSX, d'autres jurent par le CSS-in-JS scopé au composant, un dernier tient à des feuilles globales qui jouent la cascade et les layers modernes. Le même bouton finit en trois versions.", "Scoper chaque style en local, quitte à ne jamais apprendre la cascade — ou l'épouser, quitte à ce qu'un jour tout le monde se marche dessus ?"),
      c("kai-3", "Une app interne : trois formulaires et un dashboard. L'équipe passe tout en React Server Components + streaming SSR — bundle client fondu, données chargées au plus près. En échange, le rendu se joue moitié serveur moitié client, et plus un seul bug ne se reproduit pareil en local.", "Le rendu serveur t'a rendu un web plus léger et plus rapide — ou on a réinventé PHP 2005 avec dix couches d'abstraction en plus ?"),
      c("kai-4", "Un écran qui coupe le souffle : animations partout, transitions léchées, le client valide la maquette en dix secondes. À l'usage : 4 s avant le premier contenu utile, la mise en page qui saute au chargement, rien d'atteignable au clavier. Il veut shipper demain.", "Livrer l'effet « waouh » qui fait vendre — ou tenir la perf et le clavier, quitte à raboter la maquette que tout le monde a déjà adorée ?"),
      c("kai-5", "Pour un simple sélecteur de dates, un dev tire une librairie de 300 kB qui gère 40 langues et 12 calendriers : deux jours gagnés côté dev, une lib blindée et maintenue. L'utilisateur en 3G télécharge les 300 kB pour cocher un jour dans le mois.", "Deux jours gagnés et une lib éprouvée pour toi, trois cents kilos sur le dos de chaque visiteur : où mets-tu le curseur, ta vélocité ou son temps de chargement ?"),
      c("kai-6", "Un lead choisit Svelte pour un produit à fort trafic. Recrutement plus dur, moins de librairies, moins de réponses toutes prêtes — mais cinq fois moins de JS envoyé au navigateur. Toute la boîte d'à côté tourne sous React + Next, « comme tout le monde ».", "Prendre le truc que personne ne prend : courage technique, ou caprice qui coûtera cher au prochain qui hérite du code ?"),
    ],
  },
  sam: {
    intro:
      "Des décisions BACKEND réelles, chacune avec son contexte et son enjeu (taille d'équipe, trafic, budget, ce que ça coûte). Pour chacune : je garde / je jette / j'en vole un bout — et surtout POURQUOI, au grain. Pas de bonne réponse cachée, juste la tienne.",
    cards: [
      c("sam-1", "Une équipe de 3 voit le même bloc de code apparaître pour la 3e fois. Un dev bloque la PR : « on factorise maintenant, sinon on le paiera. » L'autre veut copier-coller une dernière fois et voir si les trois cas divergent vraiment.", "Tu factorises tant que les trois cas sont sous les yeux et frais, ou tu laisses diverger — quitte à te tromper d'abstraction si tu tranches trop tôt ?"),
      c("sam-2", "Une équipe de 4, 200 utilisateurs, découpe déjà le produit en 8 microservices avec sa propre gateway et son bus d'événements. La moindre petite feature touche 3 repos et exige un déploiement coordonné.", "Tu gardes des frontières nettes et des déploiements indépendants, payés d'avance, ou tu replies tout dans un monolithe — un repo, un déploiement, et la coordination qui disparaît ?"),
      c("sam-3", "Startup, un seul dev d'astreinte. Il fait tout avec Postgres : file d'attente, cache, recherche plein-texte, même du pseudo-JSON. Un collègue veut sortir Redis + Elasticsearch + Kafka « parce que c'est fait pour ça ».", "Un seul système ennuyeux à opérer et sauvegarder — même en poussant Postgres au-delà de ce pour quoi il est fait, ou l'outil taillé pour chaque besoin — un de plus à exploiter à chaque fois ?"),
      c("sam-4", "Ton API est consommée par 3 apps en prod, dont deux d'autres équipes. Tu veux renommer un champ moche et virer un endpoint legacy. Le faire proprement = versionner, déprécier 6 mois, prévenir tout le monde.", "Tu livres le renommage propre maintenant et les consommateurs s'adaptent, ou tu honores le contrat — le champ moche et l'endpoint mort portés un an de plus ?"),
      c("sam-5", "Pour ne plus jamais écrire de migration, l'équipe balance tout dans une colonne JSONB « data ». Le schéma vit dans le code, pas dans la base. Six mois plus tard, personne ne sait plus quels champs existent vraiment.", "Zéro migration et flexibilité totale, quitte à ne plus savoir ce qu'une ligne contient, ou le schéma dans la base — structuré, requêtable, mais chaque changement passe par une migration ?"),
      c("sam-6", "Deux équipes partagent un modèle « User » via une lib commune. Chaque changement de l'une casse le build de l'autre. Un archi propose de DUPLIQUER le modèle des deux côtés : chacune évolue seule, quitte à ce que les deux versions divergent.", "Une copie que chaque équipe fait évoluer seule, quitte à ce que les deux divergent, ou une seule source de vérité — partagée, mais chaque changement doit être négocié ?"),
    ],
  },
  nadia: {
    intro:
      "Des décisions d'infra RÉELLES, avec leur contexte et ce qu'elles coûtent (taille d'équipe, trafic, budget, l'astreinte à 3h du mat). Pour chacune, tranche : je garde / je jette / j'en vole un bout — et surtout POURQUOI, sans langue de bois.",
    cards: [
      c("nadia-1", "Une équipe de 4 devs lance un SaaS B2B pour 200 utilisateurs. Ils partent direct sur Kubernetes + Istio, trois environnements, un mois de setup avant la première feature livrée.", "Fondations posées pour le jour où ça scale, ou marteau-pilon dont un seul mec tient le YAML — et un Render/Fly.io aurait shippé en une aprem ?"),
      c("nadia-2", "3h du mat, la prod est down, le PDG t'écrit. Tu répares en 30 secondes en cliquant dans la console AWS — ou en 20 minutes via la PR Terraform que la CI doit valider.", "Sauver la prod tout de suite, quitte à ce que le correctif n'existe nulle part demain — ou tenir la ligne « tout passe par Git » même quand chaque minute perdue coûte des clients ?"),
      c("nadia-3", "Chaque microservice arrive avec ses 3 dashboards Grafana et ses 40 alertes. Résultat : 22 écrans, 15 alertes par nuit, et l'astreinte a coupé le son de Slack il y a deux semaines.", "Chaque équipe qui possède et règle ses propres alertes, c'est de la vraie ownership — ou un mur de bruit qui dresse l'astreinte à ignorer la seule alerte qui compte vraiment ?"),
      c("nadia-4", "Le pipeline CI met 40 minutes : lint, tests, e2e, scan de sécu, build multi-arch. Personne n'ose y toucher. Sur 12 devs, ça fait des heures perdues chaque jour à attendre le petit rond vert.", "Rempart de qualité qu'on ne bradera pas, ou péage que tout le monde subit sans jamais oser virer les 30 min de tests qui ne cassent jamais ?"),
      c("nadia-5", "L'équipe plateforme impose un « golden path » unique : un seul langage béni, un seul type de base, un template de service obligatoire. Déployer hors des rails, c'est un ticket et trois jours d'attente.", "Chemin doré qui fait gagner un temps fou aux 50 devs produit, ou cage dorée qui interdit le bon outil et transforme la moindre initiative hors-piste en ticket à quémander ?"),
      c("nadia-6", "Un serveur tourne en prod depuis 437 jours sans reboot, patché à la main, avec des configs que personne n'a documentées. Il marche parfaitement. On l'a même surnommé « Gandalf ».", "Uptime de légende qu'on ne touche surtout pas — ou bombe à retardement que personne ne saura reconstruire le jour où le disque lâche, et qu'il faudrait re-provisionner en code tant qu'il tourne encore ?"),
    ],
  },
  dara: {
    intro:
      "Un mur de PREUVES : des affirmations chiffrées du réel. Pour chacune : « je décide dessus / je m'en méfie / il me manque X » + pourquoi.",
    cards: [
      c("dara-1", "« +300 % de croissance » — sans la base de départ."),
      c("dara-2", "Une courbe boursière tronquée à l'axe Y pour dramatiser la chute."),
      c("dara-3", "n=30 en saison morte : tu tranches sur du directionnel ou tu attends ?"),
      c("dara-4", "« 40 % des bêtas reviennent en S2 » vs UN barman qui dit « je peux plus m'en passer »."),
      c("dara-5", "Un dashboard à 20 métriques avec « nombre d'events créés » affiché en gros."),
      c("dara-6", "Un sondage à marge d'erreur cachée, donné comme un fait."),
    ],
  },
  nora: {
    intro:
      "Des partis-pris d'ÉCRITURE et de voix (pub, produit, éditorial). Garde / jette / recombine selon ce qui sonne juste vs ce qui sonne creux — et pourquoi, au mot près.",
    cards: [
      c("nora-1", "Un bouton « Soumettre » remplacé par « C'est parti ! » avec un emoji."),
      c("nora-2", "Une tagline brillante en double sens — mais qu'on doit relire deux fois pour comprendre."),
      c("nora-3", "Une page 404 qui fait de l'humour (« Oups, cette page a fugué ») au lieu d'aider."),
      c("nora-4", "Un texte produit en « langue claire » : phrases courtes, zéro adjectif, zéro voix — juste l'info."),
      c("nora-5", "Un email marketing bourré de « delve », « seamless », « elevate » et d'em-dashes."),
      c("nora-6", "Un onboarding qui te tutoie et te raconte une histoire avant d'expliquer la fonctionnalité."),
    ],
  },
};

const DECKS_EN: Record<string, Deck> = {
  sally: {
    intro:
      "I'll show you interface choices seen elsewhere (affordance, flow, predictability). For each: keep / toss / remix — and above all WHY, at the grain.",
    cards: [
      c("sally-1", "A 5-screen onboarding that explains everything BEFORE letting you into the app."),
      c("sally-2", "An app that reinvents 'back': no back arrow, a custom swipe you have to learn."),
      c("sally-3", "An empty state that says “nothing tonight” instead of falling back to “this week”."),
      c("sally-4", "A social counter shown at 0 (0 likes, 0 attendees) under every item."),
      c("sally-5", "A micro-interaction adding 200 ms of texture (bounce, grain) to a gesture done 50×/day."),
      c("sally-6", "A form that asks for everything at once vs one that walks you field by field."),
    ],
  },
  tessa: {
    intro:
      "REAL, well-known design systems. For each: keep (you steal from it) / toss / remix — and why. Open the docs if you don't know it.",
    cards: [
      c("tessa-1", "Radix — headless, unstyled, accessibility-first: it gives you the behaviour, the skin is yours.", "Sacred freedom, or a refusal to decide that dumps the hard work on the consumer?", "https://www.radix-ui.com"),
      c("tessa-2", "shadcn/ui — not a dependency: you copy-paste the code into your repo and own it.", "Anti-lock-in genius, or the end of the “system” (everyone's copy drifts)?", "https://ui.shadcn.com"),
      c("tessa-3", "Material 3 (Google) — Google's opinion imposed everywhere: tokens, motion, shapes.", "Reassuring global consistency, or everything looks the same and your brand dies?", "https://m3.material.io"),
      c("tessa-4", "Carbon (IBM) — enterprise, exhaustive, heavy, highly regulated.", "Rigour that scales to 1000 devs, or a cathedral that crushes a team of 5?", "https://carbondesignsystem.com"),
      c("tessa-5", "Ant Design — dense, everything provided (tables, transfers, the lot).", "Raw productivity, or an “admin panel” aesthetic you never escape?", "https://ant.design"),
      c("tessa-6", "Polaris (Shopify) — as many CONTENT / voice guidelines as components.", "The DS as a brand contract, or over-framing that infantilises the designer?", "https://polaris.shopify.com"),
    ],
  },
  john: {
    intro:
      "Real PRODUCT decisions (the business dimension). Keep / toss / remix: ship it? kill it? killer feature or bloat?",
    cards: [
      c("john-1", "A public roadmap with 30 “planned” features, never dated."),
      c("john-2", "A product that KILLS its most-used feature because it dilutes the vision."),
      c("john-3", "A RICE prioritisation where every score is a guess dressed up as a number."),
      c("john-4", "Three-tier pricing (Free / Pro / Team) vs usage-based."),
      c("john-5", "A feature shipped because the A/B test wins 2%, with no conviction behind it."),
      c("john-6", "An MVP that adds a friction screen ON PURPOSE to boost retention."),
    ],
  },
  camille: {
    intro:
      "BARE brand postures — the intent, the enemy, the archetype, never the visual. For each: keep · toss · steal a bit — and above all WHY. What I'm after is the bet on meaning: what it decides, what it forbids, and what it betrays about a consumer, cultural, or societal trend.",
    cards: [
      c("camille-1", "A bottled-water brand gives itself a Why that aims high — “reconnecting humanity with nature” — long after launch, on an unchanged product. The meaning arrives through the story, not the product.", "A Why can be built through narrative and pull everything else up to meet it, or meaning with zero proof in the product collapses the moment anyone looks?"),
      c("camille-2", "A brand that names an enemy and spits on it in every statement — even if it insults the half of the market that happens to like that enemy.", "An enemy that welds a tribe and makes you unavoidable, or free advertising for the leader and one buyer in two slamming the door?"),
      c("camille-3", "A brand that presses right on a private shame — “your breath, your baldness, the fact that you're not enough” — because fear converts three times better than the dream.", "Naming a real pain is the most honest and most powerful lever there is, or a brand that grows by deepening the insecurity poisons the very bond it sells?"),
      c("camille-4", "Two briefs on the table. One promises a number they could take you to court over (“delivered in 30 min or it's free”). The other whispers “live the moment”: pretty, untouchable, committing to nothing.", "A promise they can shove back in your face if you miss it, or an evocation that sounds great and bets nothing?"),
      c("camille-5", "A brand puts its own weakness up front instead of hiding it — “we're pricier,” “it's ugly but it lasts,” “we're number two, so we try harder.” Anti-marketing as a posture.", "The disarming admission that earns trust when everyone else oversells, or a modesty that carves your flaw in stone and forbids you from ever selling a dream?"),
      c("camille-6", "A bank drops a militant manifesto on social justice at the exact peak when every brand is doing it — the message may be sincere, but it lands in the middle of the herd.", "A posture catching a real societal shift at the right moment, or opportunism that RINGS FALSE because everyone's already saying the same thing?"),
    ],
  },
  margaux: {
    intro:
      "Choices about brand ART DIRECTION (identity, type, campaign, territory). Keep / toss / remix by what SETS a brand vs what merely decorates — and why, by eye. (You'll be able to upload your own references at injection right after.)",
    cards: [
      c("margaux-1", "A logo reduced to a single monogram, no name spelled out: confidence, or premature arrogance?"),
      c("margaux-2", "An identity carried 80% by ONE strong typeface — discreet logo, almost no colour."),
      c("margaux-3", "Chromatic thrift: a single muted accent, austere, “not instagrammable”."),
      c("margaux-4", "A brand-world extended everywhere (poster, packaging, film) from a single motif."),
      c("margaux-5", "An identity that BREAKS its own grid for a stroke of art direction, at the cost of consistency."),
      c("margaux-6", "Brand art direction diluted into “clean SaaS” the moment it enters the interface."),
    ],
  },
  winston: {
    intro:
      "ARCHITECTURE decisions delivered with their context: team size, traffic, budget, what it actually costs. For each: keep / toss / remix — and above all WHY. No right answer hidden here: I want to see where your blade cuts, and what you're willing to LOSE by cutting.",
    cards: [
      c("winston-1", "In the meeting you're asked, flat out: monolith or microservices for the new product? You answer “it depends”, pull out a criteria matrix, and punt the call to a workshop next week.", "Expert nuance that refuses to shoot from the hip, or an elegant hideout so you never carry the blame when it breaks?"),
      c("winston-2", "A team of 5, 3,000 users, a queue of jobs to process. One wants Postgres + a cron running every minute; the other stands up Kafka + a Flink worker “to be ready to scale”.", "The boring cron that ships tonight and lasts ten years, or the real tool that spares you the rewrite the day it takes off — a takeoff that may never come?"),
      c("winston-3", "Startup, 6 devs, deadline in two months. You need auth (SSO, MFA, reset) and payments. One dev wants to build it all in-house “to stay in control and not fork out €800/mo”; the other wires up Clerk + Stripe and moves on.", "The SaaS that costs you rent but buys you three months, or the in-house build you own — until the day you dig up a hole in YOUR own MFA code?"),
      c("winston-4", "A team of 4, 200 users. To “separate concerns properly”, the product is split into 8 services talking over HTTP, each with its own DB, deploy, and logs. The feature that carried half the value now straddles three of them.", "Clean boundaries that let each piece grow, or complexity that merely moved from the code into the network — where the smallest change now touches three repos?"),
      c("winston-5", "A 200-line script with no tests, a Google Sheet, and a cron gluing two systems together every night. It's ugly, nobody dares touch it, and it's held prod steady for 18 months. The new hire wants to rewrite it all “properly” as a versioned, tested service.", "Shameful duct-tape to replace before it blows up in your face, or proof that a disposable thing that WORKS beats a “robust” thing you haven't written yet?"),
      c("winston-6", "Two options handle the load equally. The first: a proprietary serverless DB, magical in the demo but impossible to leave without a full rewrite. The second: plain Postgres, more plumbing to do yourself but you're out in a weekend. The founder wants the magical one for the investor pitch.", "Do you judge on what it does today, or on what it costs to WALK AWAY tomorrow — even if that means picking the less shiny one just because it's reversible?"),
    ],
  },
  kai: {
    intro:
      "Real BUILD decisions seen elsewhere — the ones where two approaches render the SAME screen and only your taste settles the invisible (the rendering, the CSS cascade, the weight shipped, accessibility). Each comes with its context and what it costs. For each: keep / toss / steal a bit — and above all WHY, at the grain.",
    cards: [
      c("kai-1", "A team of 3 spins up a marketing site and a blog. Default choice, no debate: create-next-app, React, 200 kB of JS for three pages that never move.", "Reuse the default the whole team already masters — wisdom that ships fast, or 200 kB none of these three pages will ever justify?"),
      c("kai-2", "A team of 6 is at war over CSS: some drop Tailwind classes straight into the JSX, others swear by component-scoped CSS-in-JS, one insists on global stylesheets that play the cascade and modern layers. The same button ends up in three versions.", "Scope every style locally, even if you never learn the cascade — or embrace it, even if one day everyone steps on everyone else?"),
      c("kai-3", "An internal app: three forms and a dashboard. The team moves everything to React Server Components + streaming SSR — client bundle melted down, data loaded right at the source. In exchange, rendering now runs half on the server, half on the client, and not a single bug reproduces the same way locally.", "Server rendering gave you a lighter, faster web — or did we just reinvent PHP 2005 with ten extra layers of abstraction?"),
      c("kai-4", "A breathtaking screen: animations everywhere, polished transitions, the client signs off on the mockup in ten seconds. In use: 4 s to first useful content, layout jumping on load, nothing reachable by keyboard. He wants to ship tomorrow.", "Ship the 'wow' that closes the deal — or hold the line on perf and keyboard, even if it means shaving down the mockup everyone already loved?"),
      c("kai-5", "For a plain date picker, a dev pulls a 300 kB library that handles 40 languages and 12 calendars: two dev-days saved, a battle-tested, maintained lib. The user on 3G downloads all 300 kB to tick one day in a month.", "Two days saved and a proven lib for you, three hundred kilos on every visitor's back: where do you set the cursor, your velocity or their load time?"),
      c("kai-6", "A lead picks Svelte for a high-traffic product. Harder hiring, fewer libraries, fewer ready-made answers — but five times less JS shipped to the browser. Every other team around runs React + Next, 'like everyone else'.", "Picking the thing nobody picks: technical courage, or a whim that'll cost the next person who inherits the code?"),
    ],
  },
  sam: {
    intro:
      "Real BACKEND decisions, each with its context and its stakes (team size, traffic, budget, what it costs). For each: keep / toss / steal a piece — and above all WHY, at the grain. No hidden right answer, just yours.",
    cards: [
      c("sam-1", "A team of 3 sees the same block of code show up for the 3rd time. One dev blocks the PR: \"we factor it out now, or we'll pay for it later.\" The other wants to copy-paste it one last time and see if the three cases actually diverge.", "Factor it out while all three cases are fresh in front of you, or let them diverge — at the risk of the wrong abstraction if you commit too early?"),
      c("sam-2", "A team of 4, 200 users, already splits the product into 8 microservices with its own gateway and event bus. The smallest feature touches 3 repos and needs a coordinated deploy.", "Keep clean boundaries and independent deploys, paid for up front, or fold it all back into a monolith — one repo, one deploy, and the coordination that vanishes?"),
      c("sam-3", "A startup, a single dev on call. He does everything with Postgres: queue, cache, full-text search, even pseudo-JSON. A colleague wants to pull in Redis + Elasticsearch + Kafka \"because that's what they're for\".", "One boring system to run and back up — even bending Postgres past what it's built for, or the tool built for each job — one more to operate every time?"),
      c("sam-4", "Your API is consumed by 3 apps in prod, two of them from other teams. You want to rename an ugly field and drop a legacy endpoint. Doing it clean = version it, deprecate for 6 months, warn everyone.", "Ship the clean rename now and let the consumers adapt, or honor the contract — the ugly field and the dead endpoint carried a year longer?"),
      c("sam-5", "To never write another migration, the team dumps everything into a JSONB \"data\" column. The schema lives in the code, not the database. Six months in, nobody knows which fields actually exist.", "Zero migrations and total flexibility, at the cost of no longer knowing what a row contains, or the schema in the database — structured, queryable, but every change goes through a migration?"),
      c("sam-6", "Two teams share a \"User\" model through a common lib. Every change by one breaks the other's build. An architect proposes DUPLICATING the model on both sides: each evolves alone, even if the two versions drift apart.", "A copy each team evolves on its own, even if the two drift apart, or a single source of truth — shared, but every change has to be negotiated?"),
    ],
  },
  nadia: {
    intro:
      "REAL infra decisions, each with its context and what it costs (team size, traffic, budget, on-call at 3am). For each one, call it: I keep it / I toss it / I steal a piece — and above all WHY, no corporate hedging.",
    cards: [
      c("nadia-1", "A team of 4 devs launches a B2B SaaS for 200 users. They go straight to Kubernetes + Istio, three environments, a month of setup before the first feature ships.", "Foundations laid for the day it scales, or a sledgehammer whose YAML one single guy holds — when a Render/Fly.io would've shipped in an afternoon?"),
      c("nadia-2", "3am, prod is down, the CEO is texting you. You fix it in 30 seconds by clicking in the AWS console — or in 20 minutes through the Terraform PR that CI has to validate.", "Save prod right now, even if the fix exists nowhere tomorrow — or hold the “everything goes through Git” line even as every lost minute costs customers?"),
      c("nadia-3", "Every microservice ships with its 3 Grafana dashboards and 40 alerts. Result: 22 screens, 15 alerts a night, and on-call muted Slack two weeks ago.", "Each team owning and tuning its own alerts is real ownership — or a wall of noise that trains on-call to ignore the one alert that actually matters?"),
      c("nadia-4", "The CI pipeline takes 40 minutes: lint, tests, e2e, security scan, multi-arch build. Nobody dares touch it. Across 12 devs, that's hours lost every day waiting on the little green check.", "A quality wall you won't sell out, or a toll everyone endures without ever daring to cut the 30 min of tests that never fail?"),
      c("nadia-5", "The platform team enforces a single “golden path”: one blessed language, one database type, a mandatory service template. Deploying off the rails means a ticket and a three-day wait.", "A golden path that saves 50 product devs enormous time, or a gilded cage that bans the right tool and turns any off-road initiative into a ticket you have to beg for?"),
      c("nadia-6", "A server has been running in prod for 437 days without a reboot, hand-patched, with configs no one ever documented. It works perfectly. They even nicknamed it “Gandalf”.", "Legendary uptime you must never touch — or a time bomb no one could rebuild the day the disk dies, that you'd have to re-provision as code while it's still running?"),
    ],
  },
  dara: {
    intro:
      "A wall of EVIDENCE: numeric claims about the real world. For each: “I decide on it / I distrust it / I'm missing X” + why.",
    cards: [
      c("dara-1", "“+300% growth” — without the starting base."),
      c("dara-2", "A stock chart with a truncated Y-axis to dramatise the drop."),
      c("dara-3", "n=30 in the off-season: do you call it on the directional, or wait?"),
      c("dara-4", "“40% of betas come back in week 2” vs ONE bartender saying “I can't do without it”."),
      c("dara-5", "A 20-metric dashboard with “events created” shown in big."),
      c("dara-6", "A poll with a hidden margin of error, presented as fact."),
    ],
  },
  nora: {
    intro:
      "Choices about WRITING and voice (advertising, product, editorial). Keep / toss / remix by what rings true vs what rings hollow — and why, to the word.",
    cards: [
      c("nora-1", "A “Submit” button replaced by “Let's go!” with an emoji."),
      c("nora-2", "A brilliant double-meaning tagline — that you have to read twice to get."),
      c("nora-3", "A 404 page cracking jokes (“Oops, this page ran away”) instead of helping."),
      c("nora-4", "Product copy in “plain language”: short sentences, zero adjectives, zero voice — just the info."),
      c("nora-5", "A marketing email stuffed with “delve”, “seamless”, “elevate” and em-dashes."),
      c("nora-6", "An onboarding that addresses you casually and tells a story before explaining the feature."),
    ],
  },
};

const DECKS: Record<Lang, Record<string, Deck>> = { fr: DECKS_FR, en: DECKS_EN };

// Ce qu'on invite la personne à INJECTER (phase 3), par agent.
const INJECTION_FR: Record<string, string> = {
  sally: "Tes apps/flows fétiches (dont tu voles la matière) — et ceux qui te font fermer l'app sur le champ.",
  tessa: "Tes design systems préférés (Radix, Carbon, le tien…) — et ceux que tu détestes.",
  john: "Les produits dont tu admires la stratégie / la prio — et les « obèses qui font tout à moitié ».",
  camille: "Les marques / manifestes / mouvements culturels que tu admires — et ceux qui « sonnent faux ».",
  margaux: "Tes identités / DA de marque fétiches (logos, typos, campagnes, mondes de marque — uploade-les) — et celles qui sonnent creux.",
  winston: "Les archis / repos que tu trouves modèles — et tes bêtes noires de structure.",
  dara: "Les dashboards / métriques que tu respectes — et les vanity que tu méprises.",
  nora: "Les copies / voix / plumes que tu admires (une marque, un média, un produit qui écrit bien) — et celles qui te font fermer l'onglet.",
  kai: "Les codebases / UI front que tu trouves exemplaires (perf, DX, a11y) — et celles qui te font fermer les devtools de dégoût.",
  sam: "Les archis backend / API que tu trouves modèles — et les usines à gaz que tu as dû maintenir en pleurant.",
  nadia: "Les setups infra / CI que tu trouves sains — et les usines à YAML dont tu as hérité.",
};

const INJECTION_EN: Record<string, string> = {
  sally: "Your fetish apps/flows (whose texture you steal) — and the ones that make you close the app on the spot.",
  tessa: "Your favourite design systems (Radix, Carbon, your own…) — and the ones you hate.",
  john: "The products whose strategy / prioritisation you admire — and the “bloated ones that do everything halfway”.",
  camille: "The brands / manifestos / cultural movements you admire — and the ones that “ring false”.",
  margaux: "Your fetish brand identities / art direction (logos, type, campaigns, brand worlds — upload them) — and the ones that ring hollow.",
  winston: "The architectures / repos you find exemplary — and your structural pet peeves.",
  dara: "The dashboards / metrics you respect — and the vanity ones you despise.",
  nora: "The copy / voices / pens you admire (a brand, a publication, a product that writes well) — and the ones that make you close the tab.",
  kai: "The frontend codebases / UIs you find exemplary (perf, DX, a11y) — and the ones that make you close the devtools in disgust.",
  sam: "The backend architectures / APIs you find exemplary — and the over-engineered messes you've maintained in tears.",
  nadia: "The infra / CI setups you find sane — and the YAML factories you've inherited.",
};

const INJECTION_PROMPTS: Record<Lang, Record<string, string>> = { fr: INJECTION_FR, en: INJECTION_EN };

const DEFAULT_INJECTION: Record<Lang, string> = {
  fr: "Les exemples que tu admires — et ceux que tu rejettes.",
  en: "The examples you admire — and the ones you reject.",
};

export function deckFor(agentId: string, lang: Lang = "fr"): Deck | null {
  return DECKS[lang]?.[agentId] ?? DECKS.fr[agentId] ?? null;
}
export function injectionPromptFor(agentId: string, lang: Lang = "fr"): string {
  return INJECTION_PROMPTS[lang]?.[agentId] ?? INJECTION_PROMPTS.fr[agentId] ?? DEFAULT_INJECTION[lang] ?? DEFAULT_INJECTION.fr;
}
