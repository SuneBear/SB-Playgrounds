import "./polyfills";
import initialize from "./systems/initialize";
import query from "./util/query-string";
import * as Tags from "./tags";
import Assets from "./util/Assets";
// import nfb from "./nfb.js";
import attachFastClick from "./vendor/fastclick";

attachFastClick(document.body);

// import { Plugins } from "@capacitor/core";
// const { SplashScreen } = Plugins;
// SplashScreen.hide();

// import "./alec/test-alec";

// let ProdApp = require("./alec-svelte/GameApp.svelte").default;
// let App = ProdApp;

import App from "./alec-svelte/GameApp.svelte";
// if (process.env.NODE_ENV === "development") {
//   let DevApp = require("./alec-svelte/EditorApp.svelte").default;
//   App = query.env === "production" ? ProdApp : DevApp;
// } else {
//   App = ProdApp;
// }

import getConfig from "./config";
import CanvasSystem from "./systems/CanvasSystem";
import LoadJSONSystem from "./systems/LoadJSONSystem";

const config = getConfig();
let initPromise;

function init() {
  if (initPromise) return initPromise;
  initPromise = new Promise((resolve) => {
    const container =
      config.container || document.querySelector("main.content");
    new App({
      target: container,
      props: {
        onCreate: setup,
      },
    });

    async function setup(world) {
      await initialize(world);

      const sys = world.hasSystem(CanvasSystem)
        ? world.getSystem(CanvasSystem).instance
        : null;
      let jsonLoader;
      if (world.hasSystem(LoadJSONSystem)) {
        jsonLoader = world.getSystem(LoadJSONSystem).instance;
      }
      config.stop = () => {
        if (sys) sys.running = false;
      };
      config.start = () => {
        if (sys) sys.running = true;
      };
      config.load = (json) => {
        if (jsonLoader) jsonLoader.load(json);
      };
      config.world = world;
      config.Tags = Tags;

      resolve();
    }
  });
  return initPromise;
}

config.init = init;
if (config.autoInit !== false) {
  window.requestAnimationFrame(() => {
    config.init();
  });
}
