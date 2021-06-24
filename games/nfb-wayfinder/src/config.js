const IS_WEBGL2 = true;

export default function getConfig() {
  const sym = Symbol.for("wayfinder.config");
  let config;
  if (sym in window) {
    config = window[sym];
  } else {
    window[sym] = {};
    config = window[sym];
  }

  if (!config.context && !config.contextLoaded) {
    config.contextLoaded = true;
    config.context = getContext();
    config.context.canvas.style.display = "none";
  }

  config.haikusPerBiome = 2;

  return config;
}

export function hideLoader() {
  // After we add those systems we can hide the loader as it will be replaced
  // by the svelte UI
  const loader = document.querySelector(".loader");
  if (loader) loader.style.display = "none";
}

function getContext() {
  const config = getConfig();
  const canvas = config.canvas || document.createElement("canvas");
  return findContext(canvas, IS_WEBGL2 ? "webgl2" : "webgl", {
    alpha: false,
    antialias: false,
    stencil: false,
    depth: true,
    powerPreference: "high-performance",
    failIfMajorPerformanceCaveat: true,
    // desynchronized: false,
    premultipliedAlpha: true,
    preserveDrawingBuffer: false,
  });

  function findContext(canvas, type, opts) {
    const contextNames = [];
    if (type === "webgl2") contextNames.push("webgl2");
    contextNames.push("webgl", "experimental-webgl");
    let context;
    for (let i = 0; i < contextNames.length; i++) {
      try {
        context = canvas.getContext(contextNames[i], opts);
        if (context != null) return context;
      } catch (err) {
        // pass
      }
    }
    return null;
  }
}
