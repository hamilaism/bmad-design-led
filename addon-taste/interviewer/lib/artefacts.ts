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

const c = (id: string, label: string, hint?: string): Card => ({ id, label, hint });

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
      "Des décisions de STRUCTURE prises dans de vrais design systems. Garde / jette / recombine selon ce qui fait un vrai système vs un tas de composants.",
    cards: [
      c("tessa-1", "`green-700` écrit en dur dans un composant bouton."),
      c("tessa-2", "Une couche sémantique à 40 rôles : `feedback.warning.subtle.bg.hover`."),
      c("tessa-3", "Le dark mode fait en dupliquant toute la palette (vs ré-aliasing)."),
      c("tessa-4", "Un « design system » = un Storybook isolé que seuls les devs front ouvrent."),
      c("tessa-5", "Des tokens nommés par valeur (`blue`, `big`) plutôt que par intention (`action.primary`)."),
      c("tessa-6", "Figma érigé en source de vérité, la prod suit Figma."),
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
      "Des postures de marque NUES (l'intention, pas le visuel). Garde / jette / recombine selon le pari de sens — et ce que ça dit d'une tendance de conso/culture.",
    cards: [
      c("camille-1", "Une marque outdoor militante qui désigne un ennemi (le consumérisme jetable)."),
      c("camille-2", "Un purpose de banque : « on est là pour vous », corporate-rassurant."),
      c("camille-3", "Une maison de luxe : discrétion, club fermé, on n'explique rien."),
      c("camille-4", "Un challenger boisson belliqueux : ironie froide contre le leader."),
      c("camille-5", "Un label streetwear : appartenance gatekeepée — tu es dedans ou dehors."),
      c("camille-6", "Un SaaS « on déteste les réunions » : ennemi fonctionnel, ton anti-corporate."),
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
      "Des décisions de SCHÉMA / structure de données. Garde / jette / recombine (« je fusionne ces tables », « je casse celle-là en deux ») + pourquoi.",
    cards: [
      c("winston-1", "Un schéma à 40 tables ultra-normalisé pour une app de 3 écrans."),
      c("winston-2", "Une god-table `users` à 60 colonnes nullable."),
      c("winston-3", "Une relation polymorphe (`commentable_type`, `commentable_id`)."),
      c("winston-4", "Toute la logique en base : RLS + fonctions security-definer, l'app devient bête."),
      c("winston-5", "Du JSONB partout pour éviter les migrations."),
      c("winston-6", "Copier-coller la même requête 5× plutôt que d'abstraire trop tôt."),
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
      "STRUCTURE decisions taken in real design systems. Keep / toss / remix by what makes a true system vs a pile of components.",
    cards: [
      c("tessa-1", "`green-700` hard-coded inside a button component."),
      c("tessa-2", "A 40-role semantic layer: `feedback.warning.subtle.bg.hover`."),
      c("tessa-3", "Dark mode built by duplicating the whole palette (vs re-aliasing)."),
      c("tessa-4", "A “design system” = an isolated Storybook only front-end devs ever open."),
      c("tessa-5", "Tokens named by value (`blue`, `big`) rather than by intent (`action.primary`)."),
      c("tessa-6", "Figma crowned as source of truth, production follows Figma."),
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
      "BARE brand postures (the intent, not the visual). Keep / toss / remix by the bet on meaning — and what it says about a consumer/culture trend.",
    cards: [
      c("camille-1", "A militant outdoor brand that names an enemy (throwaway consumerism)."),
      c("camille-2", "A bank's purpose: “we're here for you”, corporate-reassuring."),
      c("camille-3", "A luxury house: discretion, closed club, nothing explained."),
      c("camille-4", "A belligerent challenger drink: cold irony against the leader."),
      c("camille-5", "A streetwear label: gatekept belonging — you're in or out."),
      c("camille-6", "A “we hate meetings” SaaS: functional enemy, anti-corporate tone."),
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
      "SCHEMA / data-structure decisions. Keep / toss / remix (“I merge these tables”, “I split that one in two”) + why.",
    cards: [
      c("winston-1", "A 40-table, ultra-normalised schema for a 3-screen app."),
      c("winston-2", "A god-table `users` with 60 nullable columns."),
      c("winston-3", "A polymorphic relation (`commentable_type`, `commentable_id`)."),
      c("winston-4", "All logic in the database: RLS + security-definer functions, the app goes dumb."),
      c("winston-5", "JSONB everywhere to dodge migrations."),
      c("winston-6", "Copy-pasting the same query 5× rather than abstracting too early."),
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
