// Pools d'artefacts VISUELS (vrais écrans) pour la classification adaptative.
// Les images vivent hors repo (bucket Supabase public `decks/`) ; ici, seulement les
// métadonnées + le cadrage. Curaté par axe de TENSION (ce qui divise le goût), pas par
// la taxo descriptive de la source. `essence` sert au picker IA + de label de verdict.
// Un rôle sans pool visuel retombe sur le deck texte de lib/artefacts.ts.

import type { Lang } from "./i18n";

export type Artefact = {
  id: string;
  axis: string;                          // l'axe de tension (interne, pour le picker)
  app: string;                           // app source (crédit)
  file: string;                          // chemin dans le bucket : "sally/xxx.webp"
  mobbinUrl: string;
  framing: { fr: string; en: string };   // la question montrée AVEC l'écran
  essence: { fr: string; en: string };   // tag court (raisonnement picker + label verdict)
};

export const POOLS: Record<string, Artefact[]> = {
  sally: [
    {
      id: "sally-imprint",
      axis: "friction-zéro ↔ investissement",
      app: "Imprint",
      file: "sally/sally-onboarding-imprint.webp",
      mobbinUrl: "https://mobbin.com/screens/bc73ead3-e62b-402d-ade7-34f717ecc828",
      framing: {
        fr: "Cet onboarding te fait répondre à des questions AVANT de te laisser entrer. Investissement qui crée l'attachement, ou friction qui fait fuir ?",
        en: "This onboarding makes you answer questions BEFORE letting you in. Investment that builds attachment, or friction that drives people away?",
      },
      essence: {
        fr: "onboarding qui front-load l'effort avant la valeur",
        en: "onboarding that front-loads effort before value",
      },
    },
    {
      id: "sally-equinox",
      axis: "investissement avec porte de sortie",
      app: "Equinox+",
      file: "sally/sally-onboarding-equinox.webp",
      mobbinUrl: "https://mobbin.com/screens/01893f1c-196f-49b1-aab9-48e52220a262",
      framing: {
        fr: "Même pari — mais ici tu peux « Skip for now ». La porte de sortie, c'est du respect, ou la lâcheté qui sabote l'effet ?",
        en: "Same bet — but here you can “Skip for now”. The escape hatch: respect, or the cowardice that kills the effect?",
      },
      essence: {
        fr: "onboarding-investissement avec échappatoire offerte",
        en: "investment onboarding with an offered escape hatch",
      },
    },
    {
      id: "sally-chime",
      axis: "progressif ↔ tout-d'un-bloc",
      app: "Chime",
      file: "sally/sally-form-chime.webp",
      mobbinUrl: "https://mobbin.com/screens/0ce2d86a-ae4a-4dbd-b04f-1197d195502b",
      framing: {
        fr: "Un formulaire éclaté en étapes (Basic Info → Vérification → You're in). Ça guide en douceur, ou ça cache la longueur réelle ?",
        en: "A form split into steps (Basic Info → Verification → You're in). Gentle guidance, or hiding the real length?",
      },
      essence: {
        fr: "formulaire progressif, une étape à la fois",
        en: "progressive form, one step at a time",
      },
    },
    {
      id: "sally-tide",
      axis: "preuve sociale / paywall-avant-valeur",
      app: "TIDE",
      file: "sally/sally-paywall-tide.webp",
      mobbinUrl: "https://mobbin.com/screens/f16a7a88-a1cc-4517-b6fe-b4697ce4c77c",
      framing: {
        fr: "Avant même d'utiliser l'app : « Editor's Choice, 30M d'utilisateurs », puis paywall. La preuve sociale te convainc ou te braque ?",
        en: "Before you even use the app: “Editor's Choice, 30M users”, then a paywall. Does the social proof win you over or put you off?",
      },
      essence: {
        fr: "paywall + preuve sociale avant toute valeur",
        en: "paywall + social proof before any value",
      },
    },
    {
      id: "sally-quittr",
      axis: "éthique / dark pattern",
      app: "QUITTR",
      file: "sally/sally-urgency-quittr.webp",
      mobbinUrl: "https://mobbin.com/screens/09ef2499-dfce-4ec1-8d23-8841b966f54d",
      framing: {
        fr: "« Offre unique, tu ne la reverras jamais, expire dans 4:59. » Outil de conversion assumé, ou manipulation que tu refuses de shipper ?",
        en: "“One-time offer, you'll never see it again, expires in 4:59.” An owned conversion tool, or manipulation you refuse to ship?",
      },
      essence: {
        fr: "urgence artificielle + rareté fabriquée (dark pattern)",
        en: "artificial urgency + manufactured scarcity (dark pattern)",
      },
    },
    {
      id: "sally-navigator",
      axis: "état vide sobre & honnête",
      app: "Navigator",
      file: "sally/sally-empty-navigator.webp",
      mobbinUrl: "https://mobbin.com/screens/10aed557-6b04-4b17-80d0-e9f1bccc7bbe",
      framing: {
        fr: "Un écran vide qui assume : « Your plate's all clear! », rien d'autre. Honnête et calme, ou il manque une main tendue vers l'action ?",
        en: "An empty state that owns it: “Your plate's all clear!”, nothing else. Honest and calm, or missing a hand toward action?",
      },
      essence: {
        fr: "état vide sobre, honnête, sans relance",
        en: "stark, honest empty state with no nudge",
      },
    },
    {
      id: "sally-anthropologie",
      axis: "état vide charmé",
      app: "Anthropologie",
      file: "sally/sally-empty-anthropologie.webp",
      mobbinUrl: "https://mobbin.com/screens/bab15dc2-a210-46e4-8dd8-f75530204cd0",
      framing: {
        fr: "Le même vide, mais habillé d'une illustration dessinée à la main. Le charme rachète le vide, ou c'est du maquillage qui retarde l'action ?",
        en: "The same emptiness, dressed in a hand-drawn illustration. Does the charm redeem the void, or is it makeup that delays the action?",
      },
      essence: {
        fr: "état vide illustré, charmé",
        en: "illustrated, charming empty state",
      },
    },
    {
      id: "sally-tolan",
      axis: "invisible ↔ matière (UI = personnage)",
      app: "Tolan",
      file: "sally/sally-character-tolan.webp",
      mobbinUrl: "https://mobbin.com/screens/90722ad9-55fe-4a5d-8df2-de63dae1a2ff",
      framing: {
        fr: "Ici l'UI EST un personnage qui occupe tout l'écran. Présence qui crée du lien, ou ego de designer qui se met devant la tâche ?",
        en: "Here the UI IS a character filling the whole screen. Presence that builds a bond, or designer ego stepping in front of the task?",
      },
      essence: {
        fr: "l'interface comme personnage, pleine présence",
        en: "the interface as a character, full presence",
      },
    },
    {
      id: "sally-bitepal",
      axis: "matière sur un utilitaire",
      app: "BitePal",
      file: "sally/sally-mascot-bitepal.webp",
      mobbinUrl: "https://mobbin.com/screens/b4d73f2c-21d7-4476-9a12-6732d5fe6aa7",
      framing: {
        fr: "Un tracker de calories déguisé en mascotte mignonne. La douceur aide à tenir, ou elle infantilise une tâche sérieuse ?",
        en: "A calorie tracker disguised as a cute mascot. Does the sweetness help you stick with it, or infantilise a serious task?",
      },
      essence: {
        fr: "skin mignon / mascotte sur un utilitaire froid",
        en: "cute mascot skin over a cold utility",
      },
    },
    {
      id: "sally-craft",
      axis: "l'invisible (anti-personnage)",
      app: "Craft",
      file: "sally/sally-minimal-craft.webp",
      mobbinUrl: "https://mobbin.com/screens/0d3d7837-e7e5-442c-adfd-cf58425d68c0",
      framing: {
        fr: "L'inverse : sobre, blanc, l'outil s'efface. « La meilleure UX est invisible » — ou ici elle est juste absente, froide ?",
        en: "The opposite: restrained, white, the tool disappears. “The best UX is invisible” — or here is it just absent, cold?",
      },
      essence: {
        fr: "interface réductive qui s'efface",
        en: "reductive interface that gets out of the way",
      },
    },
  ],
  john: [
    {
      id: "john-oku",
      axis: "pricing à la conviction vs optimisation",
      app: "Oku",
      file: "john/john-pricing-oku.webp",
      mobbinUrl: "https://mobbin.com/screens/5a7c2e81-8aa0-4cf1-812c-8bea5439593c",
      framing: {
        fr: "Un pricing qui dit « aide-nous à payer les factures, soutiens une équipe indé ». Posture honnête qui fidélise, ou amateurisme qui laisse de l'argent sur la table ?",
        en: "Pricing that says “help us pay the bills, support an indie team”. Honest posture that builds loyalty, or amateurism leaving money on the table?",
      },
      essence: {
        fr: "pricing à la conviction (indie, « soutiens-nous »)",
        en: "conviction-led pricing (indie, “support us”)",
      },
    },
    {
      id: "john-opentable",
      axis: "tiers B2B / le pricing comme produit",
      app: "OpenTable",
      file: "john/john-tiers-opentable.webp",
      mobbinUrl: "https://mobbin.com/screens/36c5d9d4-6b3c-48be-a862-204b845e47ca",
      framing: {
        fr: "Trois tiers B2B avec des frais au couvert imbriqués. La grille fait le boulot de vente, ou elle noie le client sous la complexité ?",
        en: "Three B2B tiers with nested per-cover fees. Does the grid do the selling, or drown the customer in complexity?",
      },
      essence: {
        fr: "pricing 3-tiers B2B complexe (frais imbriqués)",
        en: "complex 3-tier B2B pricing (nested fees)",
      },
    },
    {
      id: "john-mixpanel",
      axis: "pricing à l'usage",
      app: "Mixpanel",
      file: "john/john-usage-mixpanel.webp",
      mobbinUrl: "https://mobbin.com/screens/ed1c88ba-3a66-4029-bb9b-0bf228ffea42",
      framing: {
        fr: "Un pricing à l'usage : tu glisses ton volume, le prix suit. Aligné sur la valeur reçue, ou angoissant car imprévisible ?",
        en: "Usage-based pricing: slide your volume, the price follows. Aligned with value received, or anxiety-inducing because unpredictable?",
      },
      essence: {
        fr: "pricing à l'usage (curseur de volume)",
        en: "usage-based pricing (volume slider)",
      },
    },
    {
      id: "john-churnkey",
      axis: "pricing à la valeur / ROI",
      app: "Churnkey",
      file: "john/john-value-churnkey.webp",
      mobbinUrl: "https://mobbin.com/screens/fb3f5f54-8d6d-4fdc-99ad-69bde8a7a683",
      framing: {
        fr: "Un prix justifié par un « ROI 600 % attendu » affiché en gros. Ça ancre la valeur, ou ça promet un chiffre que personne ne tiendra ?",
        en: "A price justified by “600% ROI expected” shown big. Does it anchor value, or promise a number no one will hit?",
      },
      essence: {
        fr: "pricing à la valeur, vendu au ROI promis",
        en: "value pricing sold on promised ROI",
      },
    },
    {
      id: "john-reddit",
      axis: "bloat vs focus",
      app: "Reddit",
      file: "john/john-bloat-reddit.webp",
      mobbinUrl: "https://mobbin.com/screens/4162aa9a-e586-48f1-bafe-2d9a764ef5b9",
      framing: {
        fr: "Un écran de réglages à rallonge, option sur option. Pouvoir donné à l'utilisateur, ou produit obèse qui n'a jamais su dire non ?",
        en: "An endless settings screen, option after option. Power handed to the user, or an obese product that never learned to say no?",
      },
      essence: {
        fr: "prolifération de réglages (le produit obèse)",
        en: "settings sprawl (the obese product)",
      },
    },
    {
      id: "john-wolt",
      axis: "boucle de croissance / referral",
      app: "Wolt",
      file: "john/john-referral-wolt.webp",
      mobbinUrl: "https://mobbin.com/screens/24604f4e-4d98-433c-970f-9acf67d7734f",
      framing: {
        fr: "« Invite un ami, gagne des crédits. » Boucle de croissance saine, ou growth-hack qui transforme tes users en VRP non payés ?",
        en: "“Invite a friend, earn credits.” Healthy growth loop, or a growth-hack that turns your users into unpaid salespeople?",
      },
      essence: {
        fr: "boucle de referral give-get (croissance)",
        en: "give-get referral loop (growth)",
      },
    },
    {
      id: "john-todoist",
      axis: "gating freemium",
      app: "Todoist",
      file: "john/john-gating-todoist.webp",
      mobbinUrl: "https://mobbin.com/screens/3352ce6e-8e08-4ed9-b0c5-9027f7640f8c",
      framing: {
        fr: "Une fonctionnalité utile bloquée en plein usage : « c'est du Premium ». Freemium honnête, ou rançon sur un besoin que tu as créé ?",
        en: "A useful feature blocked mid-use: “that's Premium”. Honest freemium, or ransom on a need you created?",
      },
      essence: {
        fr: "gating freemium d'une feature en plein usage",
        en: "freemium gating of a feature mid-use",
      },
    },
    {
      id: "john-peanut",
      axis: "micro-paiement / monétisation au contenu",
      app: "Peanut",
      file: "john/john-paywall-peanut.webp",
      mobbinUrl: "https://mobbin.com/screens/d9f9079c-6a93-4413-8665-ff2302577b17",
      framing: {
        fr: "Payer 1,48 € pour débloquer UN post. Micro-monétisation juste (l'auteur est payé), ou expérience fragmentée en péage permanent ?",
        en: "Pay €1.48 to unlock ONE post. Fair micro-monetisation (the author gets paid), or an experience fragmented into a permanent toll?",
      },
      essence: {
        fr: "paywall au post (micro-paiement de contenu)",
        en: "per-post paywall (content micro-payment)",
      },
    },
    {
      id: "john-ngl",
      axis: "éthique de la monétisation",
      app: "NGL",
      file: "john/john-monetize-ngl.webp",
      mobbinUrl: "https://mobbin.com/screens/75194d7f-e3e6-4135-878e-b238ff848b1d",
      framing: {
        fr: "Une app ado qui monnaie la curiosité : « paie pour des indices sur qui t'a écrit », 6,98 €/semaine. Business malin, ou exploitation que tu refuses ?",
        en: "A teen app monetising curiosity: “pay for hints on who messaged you”, €6.98/week. Clever business, or exploitation you refuse?",
      },
      essence: {
        fr: "monétisation de la curiosité (indices payants)",
        en: "monetising curiosity (paid hints)",
      },
    },
  ],
};

export function poolFor(agentId: string): Artefact[] | null {
  return POOLS[agentId] ?? null;
}
export function hasVisualPool(agentId: string): boolean {
  return !!POOLS[agentId]?.length;
}

// URL publique d'un artefact (bucket Supabase public, ou DECKS_BASE). Server-only.
export function artefactImageUrl(file: string): string {
  const base =
    process.env.DECKS_BASE ||
    (process.env.SUPABASE_URL ? process.env.SUPABASE_URL.replace(/\/$/, "") + "/storage/v1/object/public/decks" : "");
  return base ? `${base}/${file}` : "";
}
