import * as THREE from "three";

import image_data from "../assets/image/**/*.{png,jpeg,jpg,svg}";
import spritesheet_legacy_data from "../assets/spritesheets/*.{sheet,png,jpeg,jpg}";
import json_data from "../assets/json/*.{json,txtjson}";
// import gltf_image_data from "../assets/gltf/*.{sheet,png,jpg,json}";
import { spliceObject } from "./array";
import rightNow from "right-now";
import { addFrameTask } from "./addFrameTasks";

const AssetWorker = null;
// const AssetWorker = new Worker("./AssetWorker.js");
// AssetWorker.addEventListener("message", ({ data }) => {
//   if (data && data.error) console.error(`[AssetWorker] ${data.error}`);
// });

const useWorker = false && AssetWorker;

const urls = new Map();
traverseLeafUrls(
  image_data,
  (key, data) => {
    urls.set(key, data);
  },
  ["image"]
);

// traverseLeafUrls(
//   gltf_image_data,
//   (key, data) => {
//     urls.set(key, data);
//   },
//   ["gltf"]
// );

addUrls(urls, json_data, "json", {
  type: "json",
});
addUrls(urls, spritesheet_legacy_data, "spritesheets", {
  type: "spritesheet-legacy",
});
combineSheets(urls);

const imageWorkerExtensions = ["png", "webp", "jpg", "jpeg"];
const loaders = [
  {
    type: "image",
    extensions: ["svg", "png", "webp", "jpg", "jpeg"],
  },
  {
    type: "json",
    extensions: ["json", "sheet", "txtjson"],
  },
  {
    type: "spritesheet-legacy",
  },
];

const LOGGING = false;
const log = LOGGING ? (...args) => console.log("[Assets]", ...args) : () => {};

const forceRAF = false;
let requestIdle, cancelIdle;
if (!forceRAF && typeof window.requestIdleCallback === "function") {
  requestIdle = window.requestIdleCallback.bind(window);
  cancelIdle = window.cancelIdleCallback.bind(window);
} else {
  console.warn(`[Assets] Using Request Animation Frame`);
  requestIdle = window.requestAnimationFrame.bind(window);
  cancelIdle = window.cancelAnimationFrame.bind(window);
}

const canUseWebP = false;
//  (() => {
//   var elem = document.createElement("canvas");
//   if (!!(elem.getContext && elem.getContext("2d"))) {
//     // was able or not to get WebP representation
//     return elem.toDataURL("image/webp").indexOf("data:image/webp") == 0;
//   } else {
//     // very old browser like IE 8, canvas not supported
//     return false;
//   }
// })();

const jsonPriority = ["json", "sheet"];
const imagePriority = ["jpg", "png"];
if (canUseWebP) imagePriority.unshift("webp");
imagePriority.unshift("svg");

class AssetManager {
  constructor() {
    this._idleHandle = null;
    this._idleTimeout = 1000;
    this._loadQueuedBound = this.loadQueued.bind(this);
    this._ready = Promise.resolve();
    this.urlMap = urls;
    this.queue = new Set();
    this.cache = new Map();
    this.config = new Map();
    this.timing = new Map();
  }

  urlToID(url) {
    this.urlMap.set(url, url);
    return url;
  }

  setConfig(id, opt) {
    this.config.set(id, opt);
  }

  getConfig(id) {
    return this.config.has(id) ? this.config.get(id) : {};
  }

  _processOnNextTick() {
    this._cancelIdle();
    this._idleHandle = requestIdle(this._loadQueuedBound, {
      timeout: this._idleTimeout,
    });
  }

  _cancelIdle() {
    if (this._idleHandle != null) {
      cancelIdle(this._idleHandle);
      this._idleHandle = null;
    }
  }

  prepare(ids) {
    ids = Array.isArray(ids) ? ids : [ids];
    ids.forEach((id) => {
      if (!urls.has(id)) {
        console.warn(`No asset by ID ${id}`);
        if (/\.[^.]+$/.test(id)) {
          console.warn(
            `[Hint] Don't include the extension like ".png" on the asset ID`
          );
        }
      }
      if (!this.queue.has(id) && !this.cache.has(id)) {
        // log("Queing", id);
        this.queue.add(id);
      }
    });
    this._processOnNextTick();
  }

  loadQueued() {
    this._cancelIdle();
    // Loads the queue in parallel
    if (!this.queue.size) {
      return Promise.resolve();
    }
    log(`Loading ${this.queue.size} assets`);
    const then = rightNow();
    const ids = Array.from(this.queue);
    this.queue.clear();
    return Promise.all(ids.map((id) => this.load(id))).then((results) => {
      const ms = rightNow() - then;
      log(`Loaded queue in ${ms} ms`);
      return results;
    });
  }

  release(id) {
    if (this.queue.has(id)) this.queue.delete(id);
    if (this.cache.has(id)) this.cache.delete(id);
    if (this.config.has(id)) this.config.delete(id);
  }

  async loadGPUTexture(renderer, texture, id, settings) {
    const image = await this.load(id);
    texture.image = image;

    const texOpts = { ...this.getConfig(id), ...settings };
    const release = texOpts.release !== false;
    const init = texOpts.init !== false;
    if (texOpts.repeat) texture.repeat.copy(texOpts.repeat);
    if (texOpts.offset) texture.offset.copy(texOpts.offset);
    delete texOpts.release;
    delete texOpts.init;
    delete texOpts.crossOrigin;
    delete texOpts.repeat;
    delete texOpts.offset;
    Object.assign(texture, texOpts);
    texture.needsUpdate = true;
    if (init) {
      addFrameTask(() => {
        renderer.initTexture(texture);
        // release reference
        if (release) {
          texture.image = {
            width: image.width,
            height: image.height,
          };
          this.release(id);
        }
      });
    }
    return texture;
  }

  // Creates a texture and then releases all references to the CPU one
  async createGPUTexture(renderer, id, settings) {
    const texture = new THREE.Texture();
    return this.loadGPUTexture(renderer, texture, id, settings);
  }

  createGPUTextureTask(renderer, id, settings) {
    const texture = new THREE.Texture();
    const promise = this.loadGPUTexture(renderer, texture, id, settings);
    return [texture, promise];
  }

  async load(id) {
    // remove from queue if it's being waited on
    if (this.queue.has(id)) this.queue.delete(id);

    // if we have it in cache, return that
    if (this.cache.has(id)) {
      return this.cache.get(id);
    }

    const now = rightNow();
    this.timing.set(id, now);

    // not in cache, get the data
    const data = urls.get(id);

    if (!data) {
      console.error(`Could not find URL for asset ID ${id}`);
      return null;
    }

    // find loader for data type...
    let loader;
    let dataType = Array.isArray(data) ? "spritesheet-legacy" : data.type;
    if (dataType) {
      loader = loaders.find((e) => e.type === dataType);
    } else if (typeof data === "string") {
      const dataExt = getExt(data);
      if (!dataExt) {
        console.warn(
          `Could not extract loader type for ${id} with data: ${data}`
        );
        return;
      }
      loader = loaders.find((e) => {
        return e.extensions.some((ext) => {
          return ext === dataExt;
        });
      });
    } else {
      const keys = data ? Object.keys(data) : [];
      loader = loaders.find((e) => {
        return e.extensions.some((ext) => {
          return keys.includes(ext);
        });
      });
    }
    if (!loader) {
      console.warn(`Could not find loader for ${id} and URL object ${data}`);
      return;
    }

    const config = this.getConfig(id);

    // load
    let p;
    if (loader.type === "image") {
      p = loadImageAsset(id, data, config);
    } else if (loader.type === "json") {
      p = loadJsonAsset(id, data, config);
    } else if (loader.type === "spritesheet-legacy") {
      p = loadSpriteSheetAsset(id, data, config);
    } else {
      throw new Error(`Loader type ${loader.type} not yet implemented`);
    }

    // set cache
    this.cache.set(id, p);
    return p
      .then((result) => {
        const now = rightNow();
        const then = this.timing.get(id);
        const idName = typeof id === "object" ? Object.values(id)[0] : id;
        log(`Loaded ${idName} in ${Math.round(now - then)} ms`);
        return result;
      })
      .catch((err) => {
        console.error(`Error loading Asset by ID ${id}`);
        console.error(err.message);
        this.release(id);
      });
  }
}

export default new AssetManager();

function findBestURL(id, urls, priorities) {
  // some assets only have one type of extension, return that
  if (typeof urls === "string") {
    return { ext: getExt(urls), url: urls };
  }

  let ext;
  if (priorities) {
    // some assets can have multiple, and we find best based on priority
    ext = priorities.find((ext) => ext in urls);
  } else {
    ext = Object.keys(urls)[0];
  }

  if (!ext) {
    console.log("NO EXT", urls, ext, priorities);
    throw new Error(
      `Could not find a suitable extension for ${id} from: ${Object.keys(urls)}`
    );
  }
  return { ext, url: urls[ext] };
}

function getExt(str) {
  const m = /\.([^.]+)$/.exec(str);
  if (!m || !m[1]) return "";
  return m[1].toLowerCase();
}

function combineSheets(urls) {
  const sheetUrls = Array.from(urls.entries()).filter(
    ([key, value]) => value.type === "spritesheet-legacy"
  );
  const sets = new Map();
  sheetUrls.forEach(([key, value]) => {
    let base = key;
    let id = 0;

    const m = /(.*)\-([\d]+)$/.exec(base);
    if (m) {
      base = m[1];
      id = parseInt(m[2], 10) || 0;
    }

    if (sets.has(base)) {
      sets.get(base).push({ id, key });
    } else {
      sets.set(base, [{ id, key }]);
    }
  });
  Array.from(sets.entries()).forEach(([key, value]) => {
    value.sort((a, b) => a.id - b.id);
    const datas = value.map((v) => {
      const ret = urls.get(v.key);
      urls.delete(v.key);
      return ret;
    });
    urls.set(key, datas);
  });
}

async function loadSpriteSheetAsset(id, array, config) {
  const assets = array.map((obj, i) => {
    const uid = id + "-" + i;
    const imagePromise = loadImageAsset(uid, obj, config);
    const jsonPromise = loadJsonAsset(uid, obj, config);
    return [jsonPromise, imagePromise];
  });
  const promises = assets.flat();
  const results = await Promise.all(promises);
  const data = [];
  for (let i = 0; i < results.length; i += 2) {
    const json = results[i];
    const img = results[i + 1];
    data.push([json, img]);
  }
  return data;
}

async function loadJsonAsset(id, urls, config) {
  const { ext, url } = findBestURL(id, urls, jsonPriority);
  const resp = await fetch(url);
  return resp.json();
}

async function loadImageAsset(id, urls, config) {
  const { ext, url } = findBestURL(id, urls, imagePriority);
  if (useWorker && imageWorkerExtensions.includes(ext))
    return loadImageWorkerThread(id, url, config);
  else return loadImageMainThread(url, config);
}

async function loadSVGToImage(url, opt = {}) {
  const resp = await fetch(url);
  const svg = await resp.text();
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const dataUrl = "data:image/svg+xml;charset-utf-8," + encodeURIComponent(svg);
  const image = await loadImage(dataUrl, opt);
  canvas.width = image.width;
  canvas.height = image.height;
  ctx.drawImage(image, 0, 0);
  return canvas;
}

async function loadImageWorkerThread(id, url, config = {}) {
  return new Promise((resolve, reject) => {
    AssetWorker.postMessage({
      type: "image",
      id,
      url,
      config,
    });

    log(`Loading ${id} in worker...`);
    AssetWorker.addEventListener("message", receiver);

    function receiver(ev) {
      if (ev.data && ev.data.id === id) {
        AssetWorker.removeEventListener("message", receiver);
        if (ev.data.error) {
          let error = ev.data ? ev.data.error : `No Data Received`;
          console.error(`[AssetWorker] ${error}`);
          reject(new Error(error));
        } else {
          const result = ev.data.result;
          log(`Received ${id}`, result);
          resolve(result);
        }
      }
    }
  });
}

function loadImageMainThread(url, opt = {}) {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onerror = () => {
      reject(new Error(`Error loading URL ${url}`));
    };
    img.onload = () => {
      resolve(img);
    };
    if (opt.crossOrigin != null) img.crossOrigin = opt.crossOrigin;
    // log(`Loading image ${url}`);
    img.src = url;
  });
}

function addUrls(map, obj, prefix, opts = {}) {
  Object.entries(obj).forEach(([key, urls]) => {
    const k = [prefix, key].join("/");
    if (map.has(k)) {
      console.error(`WARN: Asset map already has entry by key ${k}`);
    }
    if (urls && typeof urls === "object") {
      urls = { ...opts, ...urls };
    }
    map.set(k, urls);
  });
}

function traverseLeafUrls(tree, cb, prefixes = []) {
  Object.entries(tree).forEach(([key, value]) => {
    let isLeaf;
    // see if there's another child inside that object
    if (value && typeof value === "object") {
      const hasChildren = Object.values(value).some((e) => {
        return e && typeof e === "object";
      });
      isLeaf = !hasChildren;
    } else if (typeof value === "string") {
      isLeaf = true;
    } else {
      isLeaf = false;
    }

    if (key === "json") isLeaf = true;

    const newPrefixes = [...prefixes, key];
    if (isLeaf) {
      const id = newPrefixes.join("/");
      cb(id, value);
    } else {
      traverseLeafUrls(value, cb, newPrefixes);
    }
  });
}
