// Internationalisation FR/EN. Côté UI (ce dictionnaire) + côté modèle (les prompts
// reçoivent la langue, cf. lib/agents.ts). Tout ce que la PERSONNE lit est ici.

export type Lang = "fr" | "en";
export const LANGS: Lang[] = ["fr", "en"];

// Langue par défaut côté client (navigateur), repli FR.
export function detectLang(): Lang {
  if (typeof navigator === "undefined") return "fr";
  return (navigator.language || "fr").toLowerCase().startsWith("fr") ? "fr" : "en";
}

type Dict = {
  // Setup
  appTitle: string;
  setupSub: string;
  nameLabel: string;
  namePlaceholder: string;
  pinLabel: string;
  accessLabel: string;
  accessPlaceholder: string;
  enter: string;
  busy: string;
  errName: string;
  errPin: string;
  errGeneric: string;
  // Transparence
  noticeNotStored: string;
  noticeCollected: (who: string) => string;
  operatorFallback: string;
  // Espace
  spaceOf: (name: string) => string;
  spaceHint: string;
  actStart: string;
  actContinue: string;
  actEnrich: string;
  stEmpty: string;
  stPartial: string;
  stDone: string;
  delConfirm: (name: string) => string;
  delTitle: string;
  // Fiche
  ficheHeading: (agent: string, person: string, version: number) => string;
  savedYes: string;
  savedNo: string;
  copy: string;
  downloadMd: string;
  backSpace: string;
  // Classification
  stepClassif: string;
  enrichSuffix: string;
  noDeck: string;
  toInjection: string;
  enrichIntro: string;
  reasonPlaceholder: string;
  skipArtefact: string;
  endClassif: string;
  garde: string;
  jette: string;
  recombine: string;
  // Injection
  stepInjection: string;
  added: (n: number) => string;
  injectLead: string;
  stanceFetiche: string;
  stanceBeteNoire: string;
  labelPlaceholder: string;
  whyPlaceholder: string;
  attachTitle: string;
  add: string;
  removeTitle: string;
  genBusy: string;
  genRegen: string;
  genNew: string;
  notEnough: string;
  // Entretien
  stepInterview: string;
  answers: (n: number) => string;
  composerPlaceholder: string;
  toClassification: string;
  openingMsg: string;
  backTitle: string;
  errNetwork: string;
  errImage: string;
  // Divers
  defaultInjectionPrompt: string;
  langLocked: string;
};

const FR: Dict = {
  appTitle: "Intervieweur de goût",
  setupSub:
    "On capture ton goût de métier en 3 temps : entretien, réaction à des artefacts, puis tes propres références. Tu peux faire un seul profil ou plusieurs — tu choisiras dans ton espace.",
  nameLabel: "Ton prénom (il nomme ton espace)",
  namePlaceholder: "Alex",
  pinLabel: "Ton code à 4 chiffres (ouvre ton espace, protège tes profils)",
  accessLabel: "Code d'accès",
  accessPlaceholder: "(fourni par l'opérateur)",
  enter: "Entrer dans mon espace",
  busy: "…",
  errName: "Mets ton prénom.",
  errPin: "Choisis un code à 4 chiffres.",
  errGeneric: "Erreur.",
  noticeNotStored: "Ta personnalité n'est pas stockée — pense à la télécharger pour t'en servir.",
  noticeCollected: (who) =>
    `Ta personnalité est collectée par ${who} (sa clé API, son coût). Tu peux la télécharger pour t'en servir aussi.`,
  operatorFallback: "l'opérateur de cette instance",
  spaceOf: (name) => `Espace de ${name}`,
  spaceHint: "choisis un profil — démarre, continue, ou enrichis",
  actStart: "Démarrer",
  actContinue: "Continuer",
  actEnrich: "Enrichir",
  stEmpty: "à faire",
  stPartial: "en cours",
  stDone: "fiche faite",
  delConfirm: (name) => `Supprimer le profil ${name} ? (irréversible)`,
  delTitle: "Supprimer ce profil",
  ficheHeading: (agent, person, version) =>
    `Fiche — ${agent} · ${person}${version ? ` · v${version}` : ""}`,
  savedYes: "✓ Enregistrée dans ton espace.",
  savedNo: "Non stockée — copie/télécharge-la.",
  copy: "Copier",
  downloadMd: "Télécharger .md",
  backSpace: "← Mon espace",
  stepClassif: "2 · Classification",
  enrichSuffix: " (enrichir)",
  noDeck: "Pas d'artefacts pour ce profil — passe à l'injection.",
  toInjection: "Passer à l'injection →",
  enrichIntro: "Tu enrichis ce profil : réagis à de nouveaux artefacts. ",
  reasonPlaceholder: "Pourquoi ? (au grain — la couleur, le geste, l'intention…)",
  skipArtefact: "Passer cet artefact →",
  endClassif: "Terminer la classification →",
  garde: "Je garde",
  jette: "Je jette",
  recombine: "Je recombine",
  stepInjection: "3 · Injection",
  added: (n) => `${n} ajouté${n > 1 ? "s" : ""}`,
  injectLead: "À toi d'apporter tes artefacts. ",
  stanceFetiche: "fétiche",
  stanceBeteNoire: "bête noire",
  labelPlaceholder: "L'artefact (ex. « l'app Linear », « la pub Cantona Nike »…)",
  whyPlaceholder: "Pourquoi tu l'aimes / le détestes ?",
  attachTitle: "Joindre une image",
  add: "Ajouter",
  removeTitle: "Retirer",
  genBusy: "Génération…",
  genRegen: "Régénérer la fiche",
  genNew: "Générer la fiche",
  notEnough: "Encore un peu de matière avant de générer.",
  stepInterview: "1 · Entretien",
  answers: (n) => `${n} réponse${n > 1 ? "s" : ""}`,
  composerPlaceholder: "Réponds franchement…",
  toClassification: "Passer à la classification →",
  openingMsg: "Bonjour, je suis prêt·e — on peut commencer.",
  backTitle: "Retour à mon espace",
  errNetwork: "Erreur réseau.",
  errImage: "Image illisible.",
  defaultInjectionPrompt: "Les exemples que tu admires — et ceux que tu rejettes.",
  langLocked: "Langue verrouillée pendant le parcours — reviens à ton espace pour la changer.",
};

const EN: Dict = {
  appTitle: "Taste interviewer",
  setupSub:
    "We capture your craft taste in 3 acts: an interview, reactions to artefacts, then your own references. Do a single profile or several — you'll choose inside your space.",
  nameLabel: "Your first name (it names your space)",
  namePlaceholder: "Alex",
  pinLabel: "Your 4-digit code (opens your space, protects your profiles)",
  accessLabel: "Access code",
  accessPlaceholder: "(provided by the operator)",
  enter: "Enter my space",
  busy: "…",
  errName: "Enter your first name.",
  errPin: "Choose a 4-digit code.",
  errGeneric: "Error.",
  noticeNotStored: "Your profile isn't stored — remember to download it to use it.",
  noticeCollected: (who) =>
    `Your profile is collected by ${who} (their API key, their cost). You can download it to use it too.`,
  operatorFallback: "the operator of this instance",
  spaceOf: (name) => `${name}'s space`,
  spaceHint: "pick a profile — start, continue, or enrich",
  actStart: "Start",
  actContinue: "Continue",
  actEnrich: "Enrich",
  stEmpty: "to do",
  stPartial: "in progress",
  stDone: "done",
  delConfirm: (name) => `Delete the ${name} profile? (irreversible)`,
  delTitle: "Delete this profile",
  ficheHeading: (agent, person, version) =>
    `Profile — ${agent} · ${person}${version ? ` · v${version}` : ""}`,
  savedYes: "✓ Saved to your space.",
  savedNo: "Not stored — copy/download it.",
  copy: "Copy",
  downloadMd: "Download .md",
  backSpace: "← My space",
  stepClassif: "2 · Classification",
  enrichSuffix: " (enrich)",
  noDeck: "No artefacts for this profile — move on to injection.",
  toInjection: "Skip to injection →",
  enrichIntro: "You're enriching this profile: react to new artefacts. ",
  reasonPlaceholder: "Why? (at the grain — colour, gesture, intent…)",
  skipArtefact: "Skip this artefact →",
  endClassif: "Finish classification →",
  garde: "I keep",
  jette: "I toss",
  recombine: "I remix",
  stepInjection: "3 · Injection",
  added: (n) => `${n} added`,
  injectLead: "Now bring your own artefacts. ",
  stanceFetiche: "fetish",
  stanceBeteNoire: "pet peeve",
  labelPlaceholder: "The artefact (e.g. “the Linear app”, “the Nike Cantona ad”…)",
  whyPlaceholder: "Why do you love it / hate it?",
  attachTitle: "Attach an image",
  add: "Add",
  removeTitle: "Remove",
  genBusy: "Generating…",
  genRegen: "Regenerate profile",
  genNew: "Generate profile",
  notEnough: "A bit more material before generating.",
  stepInterview: "1 · Interview",
  answers: (n) => `${n} answer${n > 1 ? "s" : ""}`,
  composerPlaceholder: "Answer honestly…",
  toClassification: "Skip to classification →",
  openingMsg: "Hi, I'm ready — let's begin.",
  backTitle: "Back to my space",
  errNetwork: "Network error.",
  errImage: "Unreadable image.",
  defaultInjectionPrompt: "The examples you admire — and the ones you reject.",
  langLocked: "Language locked during the flow — go back to your space to change it.",
};

export const UI: Record<Lang, Dict> = { fr: FR, en: EN };
export function tr(lang: Lang): Dict {
  return UI[lang] || FR;
}
