import * as Tags from "../tags";
import * as THREE from "three";
import Stats from "../util/Stats.js";
import documentVisibility from "../util/documentVisibility";
import Canvas from "../components/Canvas.svelte";
import getConfig from "../config";
import rightNow from "right-now";
import frameSequence from "../util/frame-sequence";
import { nextFrameTask } from "../util/addFrameTasks";
import queryString from "../util/query-string";

function patchTextureClone(renderer) {
  THREE.Texture.prototype.clone = function (recursive) {
    const tex = new this.constructor().copy(this);
    const previousProperties = renderer.properties.get(this);
    const newProperties = renderer.properties.get(tex);
    Object.assign(newProperties, previousProperties);
    return tex;
  };
}

export default function CanvasSystem(world, { context }) {
  world.system.info({ hidden: true });
  if (!context) {
    // return window.alert("No WebGL context!");
    console.error("Could not load context");
  }

  console.log("[renderer] Creating WebGL");
  const renderer = new THREE.WebGLRenderer({
    canvas: context ? context.canvas : undefined,
    context,
  });

  const config = getConfig();
  const canvas = renderer.domElement;
  // canvas.style.visibility = "hidden";

  const promoFPS = queryString.fps || 30;
  // renderer.setClearColor("#000");
  renderer.setClearColor("#130904");

  const debugShaders =
    process.env.NODE_ENV === "development" || queryString.debug;
  renderer.debug.checkShaderErrors = debugShaders;

  patchTextureClone(renderer);
  // renderer.outputEncoding = THREE.LinearEncoding;

  let stats;
  if (process.env.NODE_ENV === "development") {
    if (queryString.debug) stats = new Stats();
  }

  // renderer.sortObjects = false;

  // const gl = renderer.getContext();
  // gl.enable(gl.SAMPLE_ALPHA_TO_COVERAGE);
  // gl.enable(gl.SAMPLE_COVERAGE);
  // console.log(gl.getParameter(gl.SAMPLES));

  const scene = new THREE.Scene();
  scene.name = "MainScene";
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 500);
  camera.name = "MainCamera";
  camera.position.set(2, 2, -2);
  camera.lookAt(new THREE.Vector3());

  let shouldDownload = false;
  const download = (canvas) => {
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.download = Date.now() + ".png";
    a.href = url;
    a.click();
  };
  if (queryString.promo) {
    const doSequence = async () => {
      const fps = 24;
      const duration = 5;
      const totalFrames = Math.ceil(fps * duration);
      const fpsInterval = 1 / fps;
      let sequence = await frameSequence();
      const frameList = Array(totalFrames)
        .fill()
        .map((_, frame) => frame);
      for (let frame of frameList) {
        step(fpsInterval);
        console.log("Frame %d / %d", frame + 1, totalFrames);
        await sequence(canvas, frame, totalFrames);
        await new Promise((resolve) => requestAnimationFrame(resolve));
      }
      console.log("Done");
      start();
    };
    window.drift = function drift() {
      const endEntity = world.entity();
      endEntity.tagOn(Tags.GameLandingCameraDrift);
      // endEntity.tagOn(Tags.CameraZoomOut);
      endEntity.tagOn(Tags.BlockTokenCollection);
      endEntity.tagOn(Tags.HideCharacter);
      endEntity.tagOn(Tags.HideHUD);
      endEntity.tagOn(Tags.BlockUserMove);
      endEntity.tagOn(Tags.CameraStopUserMovement);
      endEntity.tagOn(Tags.ModalStoppingUserMovement);
    };
    window.addEventListener("keydown", (ev) => {
      if (ev.key.toLowerCase() === "s" && (ev.metaKey || ev.ctrlKey)) {
        ev.preventDefault();
        shouldDownload = true;
      } else if (ev.key.toLowerCase() === "k" && (ev.metaKey || ev.ctrlKey)) {
        ev.preventDefault();
        stop();
        doSequence();
      }
    });
  }

  let lastTime = rightNow();
  let lastSecond = rightNow();
  let frameCountPerSecond = 0;
  const uiEvents = world.listen(Tags.IsGameUIActive);
  const transitionView = world.view(Tags.TransitionToNextBiome);
  const resolveView = world.view(Tags.ShowBiomeResolution);
  const gameStartedView = world.view(Tags.GameStarted);
  const transitionEvents = world.listen(Tags.TransitionToNextBiome);
  const driftView = world.view(Tags.GameLandingCameraDrift);
  const driftEvents = world.listen(Tags.GameLandingCameraDrift);
  const activeEnvEvents = world.listen(Tags.ActiveEnvironmentState);
  const gameStartEvents = world.listen(Tags.GameStarted);

  // every N seconds, check how many dropped frames we have
  let frameDropDelayInterval = 2.5;

  const maxDPR = queryString.lowbattery ? 1 : 2;
  const maxDensity = Math.min(maxDPR, window.devicePixelRatio);
  const densityList = [
    ...new Set(
      maxDensity <= 1
        ? [maxDensity]
        : [
            maxDensity,
            // maxDensity * (7 / 8),
            maxDensity * (3 / 4),
            maxDensity * (2 / 3),
            maxDensity * (5 / 8),
            1,
          ].filter((d) => d >= 1)
    ),
  ];
  let curDensityIndex = 0;

  scene.add(camera);

  const e = world
    .entity("CanvasComponent")
    .add(Tags.ViewLayer, {
      id: "canvas",
      component: Canvas,
      props: {
        embed: config.embed,
        parent: config.container,
        canvas,
        resize,
        stats: stats ? stats.dom : null,
      },
    })
    .add(Tags.Canvas, canvas)
    .add(Tags.Renderer, renderer)
    .add(Tags.MainScene, scene)
    .add(Tags.MainCamera, camera)
    .add(Tags.AppState);

  const appState = e.get(Tags.AppState);
  let width, height, pixelRatio, canvasWidth, canvasHeight;

  let needsResize = true;
  let hidden = true;
  let maxArea = 2;

  let raf;
  let playing = false;
  let running = false;
  let lowBattery = Boolean(queryString.lowbattery);

  let densityTimer = null,
    resettingDensity = false;

  const resetDensity = (delay = frameDropDelayInterval) => {
    resettingDensity = true;
    if (densityTimer != null) clearTimeout(densityTimer);
    densityTimer = setTimeout(() => {
      resettingDensity = false;
      frameCountPerSecond = 0;
      lastSecond = rightNow();
    }, frameDropDelayInterval * 1000);
  };

  documentVisibility((visible) => {
    if (visible) start();
    else stop();
  });

  return {
    get running() {
      return running;
    },
    set running(v) {
      running = v;
    },
    process(dt) {
      if (activeEnvEvents.changed) {
        if (curDensityIndex > 0 && curDensityIndex > densityList.length / 2) {
          // give the game a chance to try and increase resolution at start of biome
          curDensityIndex--;
          resize(width, height);
        }
        resetDensity();
      }
      if (uiEvents.changed || driftEvents.changed || transitionEvents.changed) {
        resetDensity();
      }
      if (gameStartEvents.changed) {
        curDensityIndex = 0;
        resize(width, height);
        // clear density timer when UI appears / disappears
        resetDensity();
      }
    },
    show,
    step,
    dispose() {
      stop();
      // renderer.setAnimationLoop(null);
      e.kill();
    },
  };

  function updateAppState() {
    if (needsResize) {
      triggerResize();
    }
    appState.width = width;
    appState.height = height;
    appState.pixelRatio = pixelRatio;
    appState.canvasWidth = canvasWidth;
    appState.canvasHeight = canvasHeight;
  }

  function resize(w, h) {
    const hasSizeChanged = w !== width || h !== height;
    if (hasSizeChanged) {
      const oldArea = width * height;
      const newArea = w * h;
      maxArea = Math.max(maxArea, newArea);
      if (newArea <= maxArea * 0.5) {
        curDensityIndex = 0;
      } else if (newArea < oldArea) {
        // curDensityIndex = 0;
        if (curDensityIndex > densityList.length / 2) {
          curDensityIndex--;
        }
      }
      // reset density to ignore FPS drops that happen on resize
      resetDensity();
    }

    const newDPR =
      queryString.pixelRatio != null
        ? queryString.pixelRatio
        : densityList[curDensityIndex];
    const hasDPRChanged = newDPR !== pixelRatio;
    if (hasDPRChanged && !hasSizeChanged) {
      resetDensity(0.5);
    }

    if (hasDPRChanged) {
      console.log("[resize] New density", newDPR);
    }

    if (hasSizeChanged || hasDPRChanged) {
      width = w;
      height = h;

      // let dpr = 2;
      // if (!queryString.promo) {
      //   const size = width * height;
      //   const maxPhoneSize = 411 * 823; // based on Pixel XL2
      //   const maxTabletSize = 1024 * 768; // based on iPad
      //   if (size > maxTabletSize) dpr = Math.min(dpr, 1.25);
      //   else if (size > maxPhoneSize) dpr = Math.min(dpr, 1.25);
      //   if (lowBattery) dpr = 1;
      // }
      // dpr = 1.25;
      // console.log("PIXEL RATIO", dpr);

      // const dpr = width * height > 600000 ? 1.25 : 1.5;
      // pixelRatio = 1; //Math.min(dpr, window.devicePixelRatio);

      pixelRatio = newDPR;
      canvasWidth = Math.floor(width * pixelRatio);
      canvasHeight = Math.floor(height * pixelRatio);
      if (running && !hidden) {
        needsResize = true;
      } else {
        triggerResize();
      }
    }
  }

  function start() {
    if (!playing) {
      playing = true;
      lastTime = rightNow();
      raf = window.requestAnimationFrame(animate);
    }
  }

  function stop() {
    if (raf != null) {
      window.cancelAnimationFrame(raf);
      raf = null;
    }
    if (playing) {
      playing = false;
    }
  }

  function triggerResize() {
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    needsResize = false;
  }

  function step(delta) {
    let resizing = needsResize;
    updateAppState();

    if (appState.running || resizing) {
      // clamp delta time for long frames
      if (!queryString.promo) {
        delta = Math.min(delta, 1 / 10);
      }

      // Let's assume frame tasks should always happen
      const task = nextFrameTask();
      if (task) task(delta);

      if (running) {
        world.root.process(delta);
        if (stats) stats.update();
        if (shouldDownload) {
          shouldDownload = false;
          download(canvas);
        }
      }
    }
  }

  function animate(time) {
    if (!playing) return;
    raf = window.requestAnimationFrame(animate);
    // let now = rightNow();
    let delta = (time - lastTime) / 1000;
    let deltaFrame = (time - lastSecond) / 1000;

    if (!resettingDensity) {
      frameCountPerSecond++;
      if (deltaFrame >= frameDropDelayInterval) {
        const drops = frameDropDelayInterval * 60 - frameCountPerSecond;
        const avgFPS = frameCountPerSecond / frameDropDelayInterval;
        // console.log("New second", avgFPS, drops);
        lastSecond = time;
        frameCountPerSecond = 0;
        const inGame = gameStartedView.length > 0 || driftView.length > 0;
        const isTransitioning =
          transitionView.length > 0 || resolveView.length > 0;
        if ((avgFPS <= 55 || drops >= 10) && inGame && !isTransitioning) {
          const oldDPR = densityList[curDensityIndex];
          curDensityIndex++;
          if (curDensityIndex > densityList.length - 1) {
            curDensityIndex = densityList.length - 1;
          }
          const newDPR = densityList[curDensityIndex];
          if (oldDPR !== newDPR) {
            resize(width, height);
          }
        }
      }
    }

    lastTime = time;
    step(delta);
  }

  function show() {
    canvas.style.display = "";
    hidden = false;
    appState.ready = true;
  }
}
