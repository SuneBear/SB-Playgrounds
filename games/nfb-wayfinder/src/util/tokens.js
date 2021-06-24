import tokens from "../assets/image/tokens/ico_*.png";
import invertedTokens from "../assets/image/tokens-inverted/ico_*.png";
import collectedTokens from "../assets/image/tokens-collected/*.png";
import SpriteManager from "./SpriteManager";

export const InvertedTokenURLs = invertedTokens;
export const CollectedTokenURLs = collectedTokens;
export const TokenURLs = tokens;

export const AllTokens = [
  "sun",
  "moon",
  "wind",
  "mist",
  "rain",
  "storm",
  "tree",
  "leaf",
  "fish",
  "animal",
  "feather",
  "grass",
  "flower",
  "insect",
  "snow",
  "stars",
];

export const BiomeFeatures = {
  forest: {
    tokens: [
      "sun",
      "moon",
      // "wind",
      "mist",
      "rain",
      "storm",
      "tree",
      "leaf",
      "fish",
      "animal",
      "feather",
      // "grass",
      "flower",
      "insect",
      // "snow",
      "stars",
      // ...AllTokens,
    ],
  },
  grasslands: {
    tokens: [
      "sun",
      "moon",
      "wind",
      "mist",
      "rain",
      "storm",
      // "tree",
      // "leaf",
      "fish",
      "animal",
      "feather",
      "grass",
      "flower",
      "insect",
      // "snow",
      "stars",
      // ...AllTokens,
    ],
  },
  tundra: {
    tokens: [
      // "sun",
      "moon",
      "wind",
      "mist",
      "rain",
      "storm",
      "tree",
      // "leaf",
      "fish",
      "animal",
      "feather",
      // "grass",
      "flower",
      "insect",
      "snow",
      "stars",
      // ...AllTokens,
    ],
  },
};

const tokenTextureMap = new Map();
let tokenSpritePromiseResolved;
let tokenSpritePromise = new Promise((resolve) => {
  tokenSpritePromiseResolved = resolve;
});

let canvasCache = {};

export function getTokenSheet() {
  return tokenSpritePromise;
}

export function loadTokenSprites(renderer) {
  // console.log("[Tokens] Loading");
  SpriteManager("spritesheets/tokens", renderer, {
    release: false,
  }).then((sheet) => {
    // console.log("[Tokens] Loaded", sheet);
    // console.log(sheet.atlases[0].image);
    tokenSpritePromiseResolved(sheet);
  });
}

export async function createTokenCanvas(name) {
  const sheet = await tokenSpritePromise;
  const canvas = document.createElement("canvas");
  if (name in sheet.map) {
    const frame = sheet.map[name];
    canvas.width = frame.width;
    canvas.height = frame.height;
    const ctx = canvas.getContext("2d");
    // ctx.fillStyle = "red";
    // ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(
      sheet.atlases[0].image,
      frame.data.x,
      frame.data.y,
      frame.data.w,
      frame.data.h,
      0,
      0,
      frame.width,
      frame.height
    );
  } else {
    console.error(`Name %s not in token sheet`, name);
  }
  return canvas;
}
