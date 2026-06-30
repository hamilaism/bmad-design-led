// Le canal RÉVÉLÉ : classification (juger des artefacts) + injection (apporter les siens).
// Méthode : voir ../../protocol/README.md. Decks dérivés des « objets natifs » par agent.

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

export const DECKS: Record<string, Deck> = {
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
      "Des partis-pris VISUELS. Réagis à l'œil, au grain, à la main — pas au discours. (Tu pourras uploader tes propres visuels à l'injection juste après.)",
    cards: [
      c("margaux-1", "La bordure 1px contrastée partout : des cards bordées comme base."),
      c("margaux-2", "Le glassmorphism : gros blur, transparence, profondeur verre."),
      c("margaux-3", "L'avarice chromatique : un seul accent sourd, presque austère, « pas instagrammable »."),
      c("margaux-4", "Le candy : chaque section sa teinte saturée, ça pète dans le feed."),
      c("margaux-5", "L'éditorial print riche (magazine) plaqué sur une UI mobile."),
      c("margaux-6", "Le grain de film / la texture ajoutée sur un fond plat."),
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
};

// Ce qu'on invite la personne à INJECTER (phase 3), par agent.
export const INJECTION_PROMPTS: Record<string, string> = {
  sally: "Tes apps/flows fétiches (dont tu voles la matière) — et ceux qui te font fermer l'app sur le champ.",
  tessa: "Tes design systems préférés (Radix, Carbon, le tien…) — et ceux que tu détestes.",
  john: "Les produits dont tu admires la stratégie / la prio — et les « obèses qui font tout à moitié ».",
  camille: "Les marques / manifestes / mouvements culturels que tu admires — et ceux qui « sonnent faux ».",
  margaux: "Tes références visuelles / DA fétiches (uploade-les) — et tes vrais dégoûts.",
  winston: "Les archis / repos que tu trouves modèles — et tes bêtes noires de structure.",
  dara: "Les dashboards / métriques que tu respectes — et les vanity que tu méprises.",
};

export function deckFor(agentId: string): Deck | null {
  return DECKS[agentId] ?? null;
}
export function injectionPromptFor(agentId: string): string {
  return INJECTION_PROMPTS[agentId] ?? "Les exemples que tu admires — et ceux que tu rejettes.";
}
