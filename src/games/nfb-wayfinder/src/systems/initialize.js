import * as Tags from "../tags";
import * as THREE from "three";
import queryString from "../util/query-string";

import SnowAtmosphereSystem from "./SnowAtmosphereSystem";
import DOMTextSystem from "./DOMTextSystem";
import GameUISystem from "./GameUISystem";
import CanvasSystem from "./CanvasSystem";
// import TokenWritingSystem from "./TokenWritingSystem";
import TokenPaperFollowSystem from "./TokenPaperFollowSystem";
// import TextLogSystem from "./TextLogSystem";
import SceneSystem from "./SceneSystem";
import InputSystem from "./InputSystem";
import CompassSystem from "./CompassSystem";
import ScreenCompassSystem from "./ScreenCompassSystem";
import UserMoveSystem from "./UserMoveSystem";
import WindAtmosphereSystem from "./WindAtmosphereSystem";
import RainAtmosphereSystem from "./RainAtmosphereSystem";
import CharacterSystem from "./CharacterSystem";
import HatWindLineSystem from "./HatWindLineSystem";
// import GIFRecordSystem from "./GIFRecordSystem";
import AtmosphericsSystem from "./AtmosphericsSystem";
// import TokenSystem from "./TokenSystem";
import TallGrassSystem from "./TallGrassSystem";
import HaikuFloraSystem from "./HaikuFloraSystem";
import UserZoomSystem from "./UserZoomSystem";
import RenderDebugTargetsSystem from "./RenderDebugTargetsSystem";
import UserFollowSystem from "./UserFollowSystem";
import ShaderUniformSystem from "./ShaderUniformSystem";
import LoadJSONSystem from "./LoadJSONSystem";
import TreeSpriteAnimationSystem from "./TreeSpriteAnimationSystem";
import TextSpriteSystem from "./TextSpriteSystem";
import EnvironmentGrassSystem from "./EnvironmentGrassSystem";
import EnvironmentGroundRenderTextureSystem from "./EnvironmentGroundRenderTextureSystem";
import SubmitFrameSystem from "./SubmitFrameSystem";
import AnimationSystem from "./AnimationSystem";
import ProceduralSpawningLeaves from "./ProceduralSpawningLeaves";
import ProceduralSpawningDots from "./ProceduralSpawningDots";
import EnvironmentGroundDataTextureSystem from "./EnvironmentGroundDataTextureSystem";
// import EnvironmentGroundFogTextureSystem from "./EnvironmentGroundFogTextureSystem";
// import AssetLoaderSystem from "./AssetLoaderSystem";
import AudioSystem from "./AudioSystem";
import SimpleEnvironmentSystem from "./SimpleEnvironmentSystem";
import SimpleEnvironmentCellSystem from "./SimpleEnvironmentCellSystem";
import SimpleEnvironmentAssetsSystem from "./SimpleEnvironmentAssetsSystem";
import ShadowMapSystem from "./ShadowMapSystem";
import LoadRefGLTFSystem from "./LoadRefGLTFSystem";
import PoemCollectionSystem from "./PoemCollectionSystem";
import HaikuCollectionSystem from "./HaikuCollectionSystem";
import StanzaLineSpawningGrowthSystem from "./StanzaLineSpawningGrowthSystem";
import WaterCollectionSystem from "./WaterCollectionSystem";
import DevTutorialSystem from "./DevTutorialSystem";
import BirdFlyingSystem from "./BirdFlyingSystem";
import GroundBirdsSystem from "./GroundBirdsSystem";
import ButterflySystem from "./animals/ButterflySystem";
import RabbitSystem from "./animals/RabbitSystem";
import SealSystem from "./animals/SealSystem";
import OwlSystem from "./animals/OwlSystem";
import FoxSystem from "./animals/FoxSystem";
import FishSystem from "./animals/FishSystem";
import JumpingRabbitSystem from "./animals/JumpingRabbitSystem";
import OriginTreeSystem from "./OriginTreeSystem";
import OriginTreeIntroSystem from "./OriginTreeIntroSystem";
import IntroTutorialSystem from "./IntroTutorialSystem";
import LetterboxBarsSystem from "./LetterboxBarsSystem";
import AnimalSpawnSystem from "./AnimalSpawnSystem";
import OutroSystem from "./OutroSystem";

import { getVideo } from "../util/globalIntroVideo";
// import TutorialSystem from "./TutorialSystem";

// import Haiku from "../util/haikugen";
// const haiku = Haiku();
// const list = [];
// for (let i = 0; i < 150; i++) {
//   const gen = haiku.generate();
//   list.push(gen.map((e) => e.fr).join(" / "));
// }
// window.text = list.join("\n");

import getConfig, { hideLoader } from "../config";
import resetPlayerPos, { setPlayerPos } from "../util/resetPlayerPos";

import Assets from "../util/Assets";
import NotSupportedOverlay from "../overlays/NotSupportedOverlay.svelte";
import query from "../util/query-string";
import SpriteSheetAnimationSystem from "./SpriteSheetAnimationSystem";
import TutorialMessageSystem from "./TutorialMessageSystem";
import { revealHeader, sendAnalytics } from "../nfb";
import FloatingEndLines from "./FloatingEndLines";
import TokenPlacementSystem from "./TokenPlacementSystem";
import TokenConstellationSystem from "./TokenConstellationSystem";
import { loadTokenSprites } from "../util/tokens";
import { WorldDecayTweens } from "../tags";

export default async function initializeWorld(world) {
  const config = getConfig();
  window.world = world;
  window.Tags = Tags;

  let finalResolve;
  const finalPromise = new Promise((resolve) => {
    finalResolve = resolve;
  });

  // Make sure we add any asset IDs that *need*
  // to be prepared initially, mostly just intro UI bits
  await preloadRequiredAssets();

  // Now we run UI systems, this will trigger intro

  world.addSystem(CanvasSystem, { context: config.context });

  // don't submit rendering yet as it will slow down other initializations
  const appState = world.findTag(Tags.AppState);
  appState.rendering = false;

  // Bit of an odd thing here, we have to process
  // a single tick to ensure the Canvas.svelte is mounted
  // as many other systems will depend on its width/height state etc...
  world.root.process(1 / 60);

  // Show canvas
  const canvasSystem = world.getSystem(CanvasSystem).instance;

  // Start the rendering now
  canvasSystem.running = true;

  // Actually show the DOM canvas to the screen
  canvasSystem.show();

  // Run a single tick, this will trigger a frame render
  canvasSystem.step();

  const showUI = true;
  let gamePromise = Promise.resolve();

  world.addSystem(DOMTextSystem);
  // world.addSystem(TextLogSystem);
  world.addSystem(GameUISystem, {
    readyToInitialize,
    readyToShowEngine,
  });

  hideLoader();

  // this entity will have some flags that turns the game and input 'on'
  const initEntity = world.entity();
  initEntity.add(Tags.CameraStopUserMovement);
  initEntity.add(Tags.HideHUD);
  initEntity.add(Tags.MoveUserToOrigin);

  Assets.prepare([
    "image/ui/close-button",
    "image/ui/ico_resume",
    "image/ui/btn_start",
    "image/ui/btn_about",
    "image/ui/hint-card-left",
    "image/ui/hint-card-middle",
    "image/ui/hint-card-right",
    "image/ui/ico_paperJournal1-rotated",
  ]);

  if (!queryString.nolanding) {
    console.log("[video] Loading video");
    getVideo().load();
  }

  // Now the intro is on its way to showing
  // and in the background we can load things while that's happening
  const renderer = world.findTag(Tags.Renderer);
  await Promise.all([Assets.loadQueued(), loadTokenSprites(renderer)]);

  return finalPromise;

  function readyToInitialize() {
    console.log("[init] Initialize Game Systems");
    Assets.prepare(["spritesheets/temp_grass_sprites"]);

    gamePromise = initializeGame(world);

    // start loading any more queued
    const p = Assets.loadQueued();
  }

  async function readyToShowEngine() {
    await gamePromise;

    sendAnalytics({
      event: "finished_loading",
      label: "FinishedLoading",
    });

    console.log("[init] Start Rendering Engine");

    // start rendering and submit a single frame
    appState.rendering = true;
    world.root.process(1 / 60);

    // // Show canvas
    // const canvasSystem = world.getSystem(CanvasSystem).instance;

    // // Start the rendering now
    // canvasSystem.running = true;

    // // Actually show the DOM canvas to the screen
    // canvasSystem.show();

    // // Run a single tick, this will trigger a frame render
    // canvasSystem.step();

    // let a whole new tick go through before we actually show the canvas
    // to avoid any first-frame issues ...
    requestAnimationFrame(() => {
      initEntity.remove(Tags.HideHUD);
      world.entity().add(Tags.ScreenFade, {
        duration: 3,
        from: 1,
        to: 0,
      });
      initEntity.remove(Tags.MoveUserToOrigin);
      initEntity.remove(Tags.CameraStopUserMovement);

      finalResolve();
    });
  }
}

function preloadRequiredAssets() {
  return Promise.all(["image/svg/nfblogo"].map((id) => Assets.load(id)));
}

async function initializeGame(world, initEntity) {
  const config = getConfig();

  // global state for render layers
  world.entity().add(Tags.RenderLayers);

  world.addSystem(SceneSystem);
  world.addSystem(InputSystem);
  // world.addSystem(AssetLoaderSystem);
  world.addSystem(ShaderUniformSystem);

  world.addSystem(UserMoveSystem);
  world.addSystem(CharacterSystem);
  world.addSystem(HatWindLineSystem);
  world.addSystem(UserZoomSystem, {
    allowMouseZoom: process.env.NODE_ENV === "development",
    maxDistance: 400,
  });
  world.addSystem(UserFollowSystem);

  world.addSystem(AnimationSystem);

  world.addSystem(EnvironmentGroundDataTextureSystem);
  // world.addSystem(EnvironmentGroundFogTextureSystem);
  world.addSystem(EnvironmentGroundRenderTextureSystem);
  world.addSystem(ShadowMapSystem);

  if (!config.embed) await world.addSystem(LoadRefGLTFSystem);

  world.addSystem(SimpleEnvironmentSystem);

  await world.addSystem(EnvironmentGrassSystem);

  world.addSystem(SimpleEnvironmentCellSystem);
  await world.addSystem(SimpleEnvironmentAssetsSystem);

  // await world.addSystem(SpriteVideoSystem);
  world.addSystem(SpriteSheetAnimationSystem);
  world.addSystem(TreeSpriteAnimationSystem);
  if (config.embed) await world.addSystem(LoadJSONSystem);

  await world.addSystem(ProceduralSpawningLeaves);
  world.addSystem(ProceduralSpawningDots);
  if (!config.embed) world.addSystem(OriginTreeSystem);
  if (!config.embed) world.addSystem(OriginTreeIntroSystem);
  world.addSystem(TutorialMessageSystem);
  if (!config.embed && !queryString.notutorial)
    world.addSystem(IntroTutorialSystem);

  // world.addSystem(TokenSystem);
  // world.addSystem(TokenWritingSystem);
  world.addSystem(TokenPlacementSystem);
  world.addSystem(TokenConstellationSystem);
  world.addSystem(TokenPaperFollowSystem);
  world.addSystem(WaterCollectionSystem);
  // world.addSystem(StanzaLineSpawningGrowthSystem);
  world.addSystem(RainAtmosphereSystem);
  world.addSystem(WindAtmosphereSystem);
  world.addSystem(SnowAtmosphereSystem);
  world.addSystem(AnimalSpawnSystem);
  world.addSystem(HaikuFloraSystem);

  // world.addSystem(ScreenCompassSystem);
  world.addSystem(CompassSystem);

  // await world.addSystem(DevTutorialSystem);
  world.addSystem(BirdFlyingSystem);
  world.addSystem(GroundBirdsSystem);
  world.addSystem(ButterflySystem);
  // world.addSystem(RabbitSystem);
  // world.addSystem(SealSystem);
  // world.addSystem(OwlSystem);
  world.addSystem(FoxSystem);
  world.addSystem(FishSystem);
  world.addSystem(JumpingRabbitSystem);
  world.addSystem(FloatingEndLines);
  // world.addSystem(TutorialSystem);
  world.addSystem(OutroSystem);

  // await world.addSystem(DevTutorialUISystem);
  if (!config.embed) world.addSystem(LetterboxBarsSystem);

  if (!config.embed) world.addSystem(HaikuCollectionSystem);
  // world.addSystem(AtmosphericsSystem);
  if (!config.embed) world.addSystem(AudioSystem);

  await world.addSystem(SubmitFrameSystem, { fade: config.embed ? 0 : 1 });
  // world.addSystem(GIFRecordSystem);
  // world.addSystem(RenderDebugTargetsSystem);

  // TODO: figure out how to initialize the world a bit better
  // if (world.hasSystem(SimpleEnvironmentSystem)) {
  // const system = world.getSystem(SimpleEnvironmentSystem);
  // system.instance.createInitialEnvironment();
  // }

  if (query.nointroseq) {
    resetPlayerPos(world);
  }

  if (config.embed) {
    setPlayerPos(
      world,
      new THREE.Vector3(-20.625336223781655, 0, -7.556151890652441)
    );
  }

  // debug code
  if (query.resolve) {
    setPlayerPos(world, new THREE.Vector3(25, 0, -25));
    for (let i = 0; i < 3; i++) {
      window.addPoem();
    }
  }

  // if (query.testwater) {
  //   const waterStart = new THREE.Vector3(
  //     34.19839943737152,
  //     0,
  //     -18.377668713353398
  //   );
  //   setPlayerPos(world, waterStart);
  // }

  if (query.testtoken) {
    const tokenStart = new THREE.Vector3(
      -71.4775163757554,
      0,
      -34.91576302604653
    );
    setPlayerPos(world, tokenStart);
  }
}
