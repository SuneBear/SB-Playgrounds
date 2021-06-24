import { writable } from "svelte/store";
import getConfig from "../config";
import queryString from "./query-string";

import isMobile from "./isMobile";

const splitCopy = {
  nfbInteractiveLink: {
    en: "https://www.nfb.ca/interactive/",
    fr: "https://www.onf.ca/interactif/",
  },
  introBlurbOne: {
    en: "an animated journey across",
    fr: "une excursion animée",
  },
  introBlurbTwo: {
    en: "the poetry of the land",
    fr: "à travers la poésie du paysage",
  },
  startButton: {
    en: "start",
    fr: "démarrer",
  },
  resumeButton: {
    en: "resume",
    fr: "reprendre",
  },
  aboutButton: {
    en: "info",
    fr: "à propos",
  },
  skipButton: {
    en: "skip",
    fr: "passer",
  },
  continueButton: {
    en: "continue",
    fr: "continuer",
  },
  journalTitle: {
    en: "poems",
    fr: "poèmes",
  },
  newMemory: {
    en: "you've collected a new memory",
    fr: "tu as récupéré un nouveau souvenir",
  },
  introPlaceholder: {
    en: "nature is losing its memories...",
    fr: "TBD FR translation",
  },
  tapOrClickAndHold: {
    en: `${isMobile ? "Tap" : "Click"} + Hold`,
    fr: `${isMobile ? "Appuyez" : "Cliquez ou"} touchez`,
  },
  tutorialTapHold: {
    en: `${isMobile ? "Tap" : "Click"} and hold to explore`,
    fr: `${isMobile ? "Appuyez" : "Cliquez ou "} et maintenez pour explorer`,
  },
  tutorialResolve: {
    en: "Find the tree at the centre, to return the memories to the land",
    fr: "Trouvez l’arbre au centre du monde pour rendre à la terre ses souvenirs",
  },
  tutorialCollect: {
    en: "Collect tokens to recover nature’s lost memories",
    fr: "Rassemblez des éléments pour reconstituer la mémoire de la nature",
  },
  introVideoLine0: {
    en: "Nature's balance is endangered",
    fr: "L'équilibre naturel est en danger",
  },
  introVideoLine1: {
    en: "Memories of the land are fracturing",
    fr: "Les souvenirs de la terre s'évanouissent",
  },
  introVideoLine2: {
    en: "Recover the lost fragments to restore balance",
    fr: "Retrouvez les fragments perdus pour rétablir l'équilibre",
  },
  nfbProduction: {
    en: `A game by Matt DesLauriers`,
    fr: `Un jeu de Matt DesLauriers`,
  },
  nfbSubcaption: {
    en: `Produced by the National Film Board of Canada`,
    fr: `Produit par l’Office national du film du Canada`,
  },
  playHeader: {
    en: "play",
    fr: "jeu",
  },
  aboutHeader: {
    en: "about",
    fr: "à propos",
  },
  creditsHeader: {
    en: "credits",
    fr: "crédits",
  },
  moveCharacterText: {
    en: `to move the character across the landscape, in search of tokens that reveal lyrical fragments hidden in the wind.`,
    fr: `l'écran pour que le personnage se déplace dans son environnement à la recherche d'éléments qui révèleront des fragments lyriques cachés dans le vent.`,
  },
  collectText: {
    en: `COLLECT`,
    fr: `AMASSEZ`,
  },
  tokenStringText: {
    en: `tokens and string them together to form haiku-like poetry, recovering lost memories of nature.`,
    fr: `des éléments et assemblez-les pour former des poèmes ressemblant à des haïkus, retrouvant ainsi les souvenirs perdus de la nature.`,
  },
  orientText: {
    en: `ORIENT`,
    fr: `ORIENTEZ-VOUS`,
  },
  compassStringText: {
    en: `yourself with the Compass if you are lost or need a hint finding the closest tokens.`,
    fr: `à l’aide de la Boussole si vous êtes perdu ou avez besoin d’un indice pour découvrir les éléments autour de vous.`,
  },
  returnText: {
    en: `RETURN`,
    fr: `RENDEZ`,
  },
  memoriesStringText: {
    en: `the memories once you’ve collected enough to the Origin Tree at the centre of the world, advancing you to the next stage of the experience and bringing you closer to fully restoring nature’s balance.`,
    fr: `à la terre ses souvenirs. Lorsque vous aurez assemblé suffisamment de poèmes, trouvez l’Arbre Originel au centre de l’univers. Vous passerez alors à la prochaine étape de l’expérience, vous rapprochant de votre but ultime: restaurer entièrement l’équilibre de la nature.`,
  },
  wayfinderStrongText: {
    en: `WAYFINDER`,
    fr: `TRAVERSÉES`,
  },
  wayfinderTextParagraph: {
    en: `is an expression of our connectedness to the natural world. It's an opportunity to renew a damaged ecosystem through discovery and verse. The calming, contemplative gameplay is symbolic of the cause-and-effect relationship humans have with nature. It underscores our role in both affecting, but ultimately remedying, the effects of climate change through action and a greater appreciation of the environment.`,
    fr: `est une expression de notre connexion avec le monde naturel. C’est une occasion de renouveler, par l’entremise de la découverte et du vers, un écosystème endommagé. L’expérience de jeu, apaisante et contemplative, symbolise la relation de cause à effet que les humains entretiennent avec la nature. Elle souligne notre responsabilité face aux effets des changements climatiques et notre capacité à les entraîner, comme à y remédier, à travers nos actions et une plus grande appréciation de l’environnement.`,
  },
  wayfinderFurtherTextParagraph: {
    en: `The art is generative. The visual assets and poetry are assembled procedurally and algorithmically through code, creating different combinations for each new visitor. The textured, hand-illustrated aesthetic is delivered in real-time, and the poetic verses are created with a mix of artificial intelligence/machine learning and generative processes, providing thousands of possible combinations. As such, Wayfinder is an ever-changing, emergent artwork with infinite possibilities. Each time it runs, it produces a new and individualized world.`,
    fr: `L’art est génératif. Les éléments visuels et la poésie sont assemblés de manière procédurale et algorithmique à l’aide de code, créant différentes combinaisons pour chaque nouveau visiteur. L’esthétique texturée et illustrée à la main est livrée en temps réel, et les vers poétiques sont créés par un mélange d’intelligence artificielle/apprentissage machine et de processus génératifs, offrant ainsi des milliers de combinaisons possibles. Par conséquent, Traversées est une œuvre d’art émergente en constante évolution, renfermant d’infinies possibilités, qui produit un monde nouveau et individualisé à chaque utilisation.`,
  },
  moreAt: {
    en: `More at `,
    fr: `Plus d'infos à`,
  },
  moreAtLink: {
    en: "https://www.nfb.ca/interactive/wayfinder/",
    fr: "https://www.onf.ca/interactif/traversees/",
  },
  moreAtLinkText: {
    en: "nfb.ca/interactive/wayfinder",
    fr: "onf.ca/interactif/traversees",
  },
  mattRole: {
    en: `Concept, Design and Code`,
    fr: `Concept, design et code`,
  },
  guillaumeRole: {
    en: `Animation and 3D Modelling`,
    fr: `Animation et modélisation 3D`,
  },
  cedrineRole: {
    en: `UI Design`,
    fr: `Conception UI`,
  },
  williamRole: {
    en: `Creative Developer`,
    fr: `Développeur créatif`,
  },
  boombox: {
    en: `Music & Sound`,
    fr: `Musique et son`,
  },
  jelaniRole: {
    en: `Junior Developer`,
    fr: `Développeur junior`,
  },
  nicholasRole: {
    en: `Producer`,
    fr: `Producteur`,
  },
  robRole: {
    en: `Executive Producer`,
    fr: `Producteur exécutif`,
  },
  jasmineRole: {
    en: `Senior Production Coordinator`,
    fr: `Coordonnatrice de production principale`,
  },
  camilleJanineRole: {
    en: `Operation Managers`,
    fr: `Gestionnaires des opérations`,
  },
  victoriaRole: {
    en: `Studio Administrator`,
    fr: `Administratrice du studio`,
  },
  tammyRole: {
    en: `Marketing Managers`,
    fr: `Responsable marketing`,
  },
  jenniferRole: {
    en: `Publicist`,
    fr: `Relationniste`,
  },
  ericRole: {
    en: `Marketing Coordinator`,
    fr: `Coordonnateur marketing`,
  },
  sergiuRole: {
    en: `Information Technology`,
    fr: `Technologie de l'information`,
  },
  catherineRole: {
    en: `Digital Platforms`,
    fr: `Plateformes numériques`,
  },
  christianRole: {
    en: `Legal Services`,
    fr: `Services juridiques`,
  },
  socialRole: {
    en: `Social Media`,
    fr: `Médias sociaux`,
  },
  gabrielleRole: {
    en: `French Translation by`,
    fr: `Traduction française par`,
  },
  introPresents: {
    en: "The National Film Board of Canada Presents",
    fr: "L'Office national du film du Canada présente",
  },
  // harshitRole: {
  //   en: `Poem verses adapted from Haiku Dataset by <a href="https://www.kaggle.com/hjhalani30/haiku-dataset" target="_blank">Harshit Jhalani</a>, licensed under <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank">CC BY 4.0</a>`,
  //   fr: `Vers poétiques adaptés de Haiku Dataset par <a href="https://www.kaggle.com/hjhalani30/haiku-dataset" target="_blank">Harshit Jhalani</a>, licencié sous <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank">CC BY 4.0</a>`,
  // },
  endState0: {
    en: "You've recovered all the lost poetic fragments.",
    fr: "Vous avez retrouvé tous les fragments poétiques perdus.",
  },
  endState1: {
    en: "With your help, nature's memories have been restored.",
    fr: "Avec votre aide, les souvenirs de la nature ont été restaurés.",
  },
  endState2: {
    en: `Thanks for playing. See more NFB projects at <a href="https://www.nfb.ca/interactive/">nfb.ca/interactive</a>`,
    fr: `Merci d'avoir joué. Découvrez d'autres projets de l'ONF sur <a href="https://www.onf.ca/interactif/">onf.ca/interactif</a>`,
  },
  endState2A: {
    en: `Thanks for playing.`,
    fr: `Merci d'avoir joué.`,
  },
  endState2B: {
    en: `See more NFB projects at <a href="https://www.nfb.ca/interactive/">nfb.ca/interactive</a>`,
    fr: `Découvrez d'autres projets de l'ONF sur <a href="https://www.onf.ca/interactif/">onf.ca/interactif</a>`,
  },
  journalButton: {
    en: "poems",
    fr: "poèmes",
  },
};

const toLangCopy = (lang) =>
  Object.entries(splitCopy).reduce((dict, e) => {
    dict[e[0]] = e[1][lang];
    return dict;
  }, {});

const copy = {
  en: toLangCopy("en"),
  fr: toLangCopy("fr"),
};

const initialState =
  getConfig().lang === "fr" || /^fr$/i.test(queryString.lang) ? "fr" : "en";
let currentState = initialState;
let currentCopy = copy[currentState];

export const language = writable(initialState);
export const localize = writable(currentCopy);

localize.get = function () {
  return currentCopy;
};

language.set = function (lang) {
  if (lang !== "en" && lang !== "fr")
    throw new Error(`Invalid language ${lang}`);
  return language.update(() => lang);
};

language.subscribe((lang) => {
  currentState = lang;
  currentCopy = copy[currentState];
  localize.update(() => currentCopy);
});

language.get = function () {
  return currentState;
};
