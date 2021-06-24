import * as Tags from "../tags";
import * as THREE from "three";
import * as Helpers from "../util/helpers";
import { polygonCentroid } from "d3-polygon";
import FastPoissonDiskSampling from "fast-2d-poisson-disk-sampling";
import Random from "../util/Random";
import { getMinimumSpanningTree } from "../util/mst";
import distanceSq from "euclidean-distance/squared";
import { Delaunay } from "d3-delaunay";
import SimplexNoise from "simplex-noise";
// import concaveman, { fastConvexHull } from "../util/concaveman";
import simplify from "simplify-path";
import pointInPoly from "point-in-polygon";
// import { ConvexHull } from "three/examples/jsm/math/ConvexHull";
import queryString from "../util/query-string";
import * as ShaderManager from "../util/ShaderManager";

import { MetaData } from "../util/RefGLTFLoader";

import { quadtree as Quadtree } from "d3-quadtree";
import boundPoints from "bound-points";
import earcut from "earcut";

// import floorOverlayUrl from "../assets/textures/environment/floor_overlay.png";
// import groundTextureUrl from "../assets/textures/environment/floor.jpg";
// import waterDistortMapUrl from "../assets/textures/WaterDistortion.png";
// import waterNoiseMapUrl from "../assets/textures/WaterNoise.png";
// import groundPathTextureUrl from "../assets/textures/environment/floor-path.jpg";

import { loadTexture } from "../util/load";
import getConfig from "../config";
import createEnvironmentEntity from "./environment/createEnvironmentEntity";
import vertexShader from "../shaders/ground-simple.vert";
import fragmentShader from "../shaders/ground-simple.frag";
import { detachObject } from "../util/three-util";
import Assets from "../util/Assets";
import { getEmptyTexture } from "../util/materials";
import resetPlayerPos, { setPlayerPos } from "../util/resetPlayerPos";
import { setEntityTweenFromTo, tweenFromTo } from "./AnimationSystem";
import { sendAnalytics } from "../nfb";

const WATER_DISTORT = "image/data/water-distort";
const WATER_MAP = "image/data/water-noise";
const ICE_MAP = "image/opaque/ice";
const FLOOR_OVERLAY = "image/opaque/floor-overlay";
const FLOOR_PATH = "image/opaque/floor-path";
const FLOOR = "image/opaque/floor";
const FLOOR_TUNDRA = "image/opaque/floor-tundra";

// prepare some of the assets that we will see immediately
Assets.prepare([FLOOR, FLOOR_PATH, FLOOR_OVERLAY]);

export default function SimpleEnvironmentSystem(world) {
  const renderer = world.findTag(Tags.Renderer);
  const waterDistortMap = new THREE.Texture();
  const waterNoiseMap = new THREE.Texture();

  const repeat = {
    wrapS: THREE.RepeatWrapping,
    wrapT: THREE.RepeatWrapping,
  };

  const [mapGround, mapOverlay, mapGroundPath] = [
    FLOOR,
    FLOOR_OVERLAY,
    FLOOR_PATH,
  ].map((id) => {
    const [tex] = Assets.createGPUTextureTask(renderer, id, {
      wrapS: THREE.RepeatWrapping,
      wrapT: THREE.RepeatWrapping,
    });
    return tex;
  });

  let hasLoadedWaterDistort = false;

  const onOutroEvent = world.listen([
    Tags.EndGameState,
    Tags.ResetToCameraDrift,
  ]);

  const quadGeo = new THREE.PlaneBufferGeometry(1, 1, 1, 1);
  quadGeo.rotateX(-Math.PI / 2);
  const width = 512;
  const height = 512;
  const bounds = [
    [-width / 2, -height / 2],
    [width / 2, height / 2],
  ];
  const uvMat = new THREE.Matrix3();
  const texRepeat = 1024 / 60;
  const repeatX = 1 * texRepeat;
  const repeatY = (1.0 / (width / height)) * texRepeat * -1.0;
  uvMat.setUvTransform(0, 0, 1, 1, THREE.MathUtils.degToRad(-45), 0, 0);
  const haikusTotal = getConfig().haikusPerBiome;
  // const haikusTotal =
  //   typeof queryString.maxHaikus === "number" ? queryString.maxHaikus : 2;
  const biomeData = {
    forest: {
      grassInstanceCount: 700,
      grassScale: 0.6,
      grassTipFactor: 1.5,
      colors: [
        { name: "forest-items-triangle", color: "#9D9166" },
        { name: "forest-items-dry", color: "#59622a" },
        { name: "forest-items-autumn", color: "#745C13" },
        { name: "forest-items-triangle", color: "#766D43" },
      ],
      waterId: "forest-items-water",
      haikusTotal,
      waterColors: [],
      seed: [18632, 45808, 21972, 11421],
      hasLakes: false,
    },
    grasslands: {
      grassInstanceCount: 1000,
      grassScale: 1,
      grassTipFactor: 1.5,
      hasLakes: true,
      haikusTotal,
      seed: [23005, 20871, 29486, 37533],
      colors: [
        { name: "grasslands-items-field", color: "#556325" },
        { name: "grasslands-items-yellow", color: "#8D7721" },
        { name: "grasslands-items-field", color: "#486b25" },
        { name: "grasslands-items-wet", color: "#605e41" },

        // { name: "grasslands-items-field", color: "#ff0000" },
        // { name: "grasslands-items-field", color: "#00ff00" },
        // { name: "grasslands-items-field", color: "#0000ff" },
        // { name: "grasslands-items-field", color: "#00ffff" },
        // { name: "grasslands-items-wet", color: "#556325" },
      ],
      waterId: "grasslands-items-water",
      waterColors: [{ name: "lake", color: "#072d17" }],
    },
    tundra: {
      grassInstanceCount: 500,
      grassScale: 0.6,
      grassTipFactor: 0.5,
      hasLakes: true,
      hasIce: true,
      haikusTotal,
      seed: [13005, 27871, 29486, 37533],
      overlayOpacity: 0,
      colors: [
        {
          name: "tundra-items-basic",
          color: "#797f84",
        },
        // { name: "tundra-items-basic", color: "#898e91" },
        // { name: "tundra-items-snow", color: "#d9d9d9" },
        // { name: "grasslands-field", color: "#5a823a" },
        // { name: "grasslands-yellow", color: "#8D7721" },
      ],
      waterId: "tundra-items-ice",
      waterColors: [{ name: "lake", color: "#072d17" }],
    },
  };

  const depthMesh = new THREE.Mesh(
    quadGeo,
    new THREE.MeshBasicMaterial({
      // color: "red",
      colorWrite: false,
    })
  );
  depthMesh.layers.set(world.findTag(Tags.RenderLayers).groundDepth);
  depthMesh.scale.set(width, 1, height);
  depthMesh.position.y = 0.0;
  depthMesh.name = "env-depth-mesh";
  world.entity().add(Tags.Object3D, depthMesh);

  const meshEntity = createMesh();
  // meshEntity.get(Tags.Object3D).visible = false;
  const config = getConfig();
  const ignoreOrigin = false;
  // if (!config.embed) {
  //   world.entity().add(Tags.GLTFRefAsset, {
  //     position: [0, 0],
  //     name: "origin-0",
  //   });
  // }

  const barrenGroundEvents = world.listen(Tags.TutorialBarrenGround);
  const tweenColor = {
    value: 0,
    lastValue: 0,
    colorA: meshEntity
      .get(Tags.Object3D)
      .material.uniforms.originColor.value.clone(),
    colorB: new THREE.Color("#59622a"),
  };
  const finalResolutionEvents = world.listen(Tags.FinalBiomeResolution);
  const groundAssetView = world.view([Tags.GroundAsset, Tags.GroundAssetData]);
  const envCellView = world.view(Tags.EnvironmentCell);
  const cellView = world.view([Tags.GroundAsset, Tags.GroundAssetData]);
  const gltfAssetView = world.view(Tags.GLTFRefAsset);
  const environments = world.view(Tags.EnvironmentState);
  const envStateCurrent = world.view([
    Tags.EnvironmentState,
    Tags.ActiveEnvironmentState,
  ]);

  const envList = ["forest", "grasslands", "tundra"];
  const hasSeenBiome = {};
  let envEntityLast = null;

  let envStart = "forest";
  if (queryString.biome === "grasslands") envStart = "grasslands";
  else if (queryString.biome === "tundra") envStart = "tundra";
  let env = null;

  setTimeout(() => {
    function getSwapper() {
      const env0 = env;
      const env1 = createEnvironment("grasslands");
      let currentEnv = env0;
      env0.name = "forest";
      env1.name = "grasslands";
      return () => {
        const newEnv = currentEnv === env0 ? env1 : env0;
        currentEnv.remove(Tags.ActiveEnvironmentState);
        newEnv.add(Tags.ActiveEnvironmentState);
        currentEnv = newEnv;
      };
    }

    let swapper;
    window.swapEnv = () => {
      swapper = swapper || getSwapper();
      swapper();
    };
  }, 0);

  // const activeTokens = world.view(Tags.GroundSpawnTokenTag);
  const swapView = world.view(Tags.SafeToSwapBiomes);
  const shadowAssetView = world.view(Tags.ShadowCaster);
  const transitionEvents = world.listen(Tags.TransitionToNextBiome);
  const transitionWithCameraStoppingView = world.view([
    Tags.TransitionToNextBiome,
    Tags.CameraStopUserMovement,
  ]);

  createInitialEnvironment();

  let oldOverrideColor = null;

  return {
    process,
    // Since this is an expensive operation that leads to 'jank'
    // we want to expose exactly when to call this, in between the NFB
    // logo animating in / out basically...
    createInitialEnvironment,
  };

  function createInitialEnvironment() {
    if (!env) {
      env = createEnvironment(envStart);
      env.add(Tags.ActiveEnvironmentState);

      if (queryString.testwater) {
        const lakes = env.get(Tags.EnvironmentState).lakes;
        if (lakes && lakes.length) {
          const lake = lakes[Math.floor(Math.random() * lakes.length)].polygon;
          const point = lake[Math.floor(Math.random() * lake.length)];
          setPlayerPos(world, new THREE.Vector3(point[0], 0, point[1]));
        }
      } else if (queryString.testfox) {
        const patches = env.get(Tags.EnvironmentState).patches;
        const patch = patches.find((p) => p.name.includes("patch-17"));
        if (patch) {
          setPlayerPos(
            world,
            new THREE.Vector3(patch.position[0], 0, patch.position[1])
          );
        }
      }
    }
  }

  function process(dt) {
    transitionEvents.added.forEach((e) => {
      e.add(Tags.CameraStopUserMovement);
    });

    if (onOutroEvent.added.length > 0) {
      world.entity().add(Tags.TransitionToNextBiome).add(Tags.SafeToSwapBiomes);
      // env.reomve(Tags.ActiveEnvironmentState);
      // env.add(Tags.ActiveEnvironmentState);
      // const env1 = createEnvironment("grasslands");
      // let currentEnv = env0;
      // env0.name = "forest";
      // env1.name = "grasslands";
      // return () => {
      //   const newEnv = currentEnv === env0 ? env1 : env0;
      //   currentEnv.remove(Tags.ActiveEnvironmentState);
      //   newEnv.add(Tags.ActiveEnvironmentState);
      //   currentEnv = newEnv;
      // };

      // world.entity()
      //   .add(Tags.SafeToSwapBiomes)
      //   .add()
    }

    if (swapView.length > 0) {
      transitionWithCameraStoppingView.forEach((e) => {
        e.remove(Tags.CameraStopUserMovement);
      });
      swapView.forEach((e) => {
        // remove each
        e.remove(Tags.SafeToSwapBiomes);
      });

      // reset player to origin
      resetPlayerPos(world);

      oldOverrideColor = null;

      const activeEnvEntity = envStateCurrent.length
        ? envStateCurrent[0]
        : null;
      const curEnv = activeEnvEntity
        ? activeEnvEntity.get(Tags.EnvironmentState).name
        : "forest";
      const curIdx = envList.indexOf(curEnv);
      if (curIdx >= 0) {
        let newIdx = curIdx + 1;
        if (newIdx >= envList.length) {
          // special case: tundra to grasslands
          newIdx = 1;
        }
        if (newIdx < envList.length) {
          const name = envList[newIdx];
          // activeEnvEntity.remove(Tags.ActiveEnvironmentState);
          envCellView.forEach((e) => e.kill());
          groundAssetView.forEach((e) => e.kill());
          environments.forEach((e) => e.kill());

          const env = createEnvironment(name);

          env.add(Tags.ActiveEnvironmentState);

          world.query(Tags.TransitionToNextBiome).entities.forEach((e) => {
            e.remove(Tags.TransitionToNextBiome);
          });
          if (!hasSeenBiome[name]) {
            hasSeenBiome[name] = true;
            sendAnalytics({
              event: "biome_visited",
              eventLabel: name,
            });
          }
        } else {
          console.log("VIEW LAYER END STATE");
        }
      }
    }

    const mesh = meshEntity.get(Tags.Object3D);
    const data = meshEntity.get(Tags.GroundMeshEditableData);
    mesh.material.uniforms.uvRepeatScale.value = data.uvRepeatScale;
    mesh.material.uniforms.useOverrideColor.value = data.useOverrideColor;
    mesh.material.uniforms.useOverrideMap.value = data.useOverrideMap;
    mesh.material.uniforms.overrideMap.value = data.overrideMap;

    if (oldOverrideColor !== data.overrideColor) {
      mesh.material.uniforms.overrideColor.value.set(data.overrideColor);
      oldOverrideColor = data.overrideColor;
    }

    let newEnvEntity = null;
    if (envStateCurrent.length > 0) {
      const curEntity = envStateCurrent[0];
      const current = curEntity.get(Tags.EnvironmentState);
      newEnvEntity = curEntity;
      mesh.material.uniforms.solved.value =
        ignoreOrigin || config.embed ? 1 : current.solved;
      mesh.material.uniforms.dataMapBiome.value = current.textures[0];
      mesh.material.uniforms.dataMapColor.value = current.textures[1];
      mesh.material.uniforms.dataMapLake.value = current.textures[2];
      mesh.material.uniforms.overlayOpacity.value = current.overlayOpacity;

      for (let i = 0; i < current.waterMeshes.length; i++) {
        const wmesh = current.waterMeshes[i];
        wmesh.material.uniforms.waterNoiseMap.value = data.useOverrideWater
          ? data.overrideWater
          : waterNoiseMap;
        wmesh.material.uniforms.colorA.value.set(
          data.useOverrideWaterColor
            ? data.overrideWaterColorA
            : wmesh.userData.colorA
        );
        wmesh.material.uniforms.colorB.value.set(
          data.useOverrideWaterColor
            ? data.overrideWaterColorB
            : wmesh.userData.colorB
        );
      }
    }
    if (newEnvEntity !== envEntityLast) {
      // remove old environment
      if (envEntityLast && envEntityLast.has(Tags.Object3D)) {
        const object = envEntityLast.get(Tags.Object3D);
        detachObject(object);

        console.log("Killing previous environment");

        // remove all old tokens
        // activeTokens.forEach((e) => e.kill());

        envEntityLast.remove(Tags.Object3D);
      }
      envEntityLast = newEnvEntity;
      // attach new environment
      if (newEnvEntity) {
        const envState = newEnvEntity.get(Tags.EnvironmentState);
        const group = envState.group;
        newEnvEntity.add(Tags.Object3D, group);

        gltfAssetView.forEach((e) => {
          const p = e.get(Tags.GLTFRefAsset);
          if (p.biome !== envState.name) {
            e.kill();
          }
        });
        // shadowAssetView.forEach((e) => {
        //   e.kill();
        // });

        envState.patches.forEach((p) => {
          const e = world.entity().add(Tags.GLTFRefAsset, {
            position: p.position,
            name: p.name,
            biome: envState.name,
          });
        });

        // envState.tokens.forEach((t) => {
        //   const pos = t;
        //   const e = world
        //     .entity()
        //     .add(Tags.GroundSpawnPosition2D, pos)
        //     .add(Tags.GroundSpawnTokenTag);
        // });
      }
    }

    if (finalResolutionEvents.changed) {
      const uniforms = meshEntity.get(Tags.Object3D).material.uniforms;
      const target = uniforms.tutorial;
      if (finalResolutionEvents.added.length > 0) {
        tweenColor.colorA.copy(uniforms.originColor.value);
        tweenFromTo(world, tweenColor, "value", 0, 1, 8, "sineOut");
        tweenFromTo(world, target, "value", target.value, 1, 8, "sineOut");
      } else if (finalResolutionEvents.removing.length > 0) {
        tweenColor.value = 0;
        target.value = 0;
      }
    }

    if (tweenColor.value !== tweenColor.lastValue) {
      tweenColor.lastValue = tweenColor.value;
      const uniforms = meshEntity.get(Tags.Object3D).material.uniforms;
      uniforms.originColor.value
        .copy(tweenColor.colorA)
        .lerp(tweenColor.colorB, tweenColor.value);
    }

    if (barrenGroundEvents.changed) {
      if (barrenGroundEvents.added.length > 0) {
        if (meshEntity.has(Tags.Object3D)) {
          meshEntity.get(Tags.Object3D).material.uniforms.tutorial.value = 1;
        }
      } else if (barrenGroundEvents.removing.length > 0) {
        if (meshEntity.has(Tags.Object3D)) {
          const target = meshEntity.get(Tags.Object3D).material.uniforms
            .tutorial;
          tweenFromTo(world, target, "value", target.value, 0, 2, "sineOut");
        }
      }
    }
    // const tutorialStateEntity = world.findEntity(Tags.TutorialAnimationState);
    // if (tutorialStateEntity && meshEntity.has(Tags.Object3D)) {
    //   const state = tutorialStateEntity.get(Tags.TutorialAnimationState);
    //   meshEntity.get(Tags.Object3D).material.uniforms.tutorial.value = state;
    // }
  }

  function createEnvironment(name) {
    if (
      (name === "grasslands" || name === "tundra") &&
      !hasLoadedWaterDistort
    ) {
      hasLoadedWaterDistort = true;
      Assets.loadGPUTexture(renderer, waterDistortMap, WATER_DISTORT, repeat);
    }
    if (name === "grasslands") {
      Assets.loadGPUTexture(renderer, waterNoiseMap, WATER_MAP, repeat);
    } else if (name === "tundra") {
      console.log("CREATE ENV");
      Assets.loadGPUTexture(renderer, waterNoiseMap, ICE_MAP, repeat);
      Assets.loadGPUTexture(renderer, mapGround, FLOOR_TUNDRA, repeat);
      // Assets.loadGPUTexture(renderer, mapGroundPath, FLOOR_TUNDRA, repeat);
    }

    // if ((name === "grasslands" || name === "tundra") && !hasLoadedGrasslands) {
    //   hasLoadedGrasslands = true;
    //   // We load these outside of blocking anything
    //   // But we will hit some async issues where the water might need to render
    //   // before texture finishes loading.. this should block the transition page instead
    //   // This could be done with Assets.prepare + loadQueued in transition page
    //   const repeat = {
    //     wrapS: THREE.RepeatWrapping,
    //     wrapT: THREE.RepeatWrapping,
    //   };
    // Assets.loadGPUTexture(renderer, waterDistortMap, WATER_DISTORT, repeat);
    // Assets.loadGPUTexture(renderer, waterNoiseMap, WATER_NOISE, repeat);
    // }
    // if (name === 'tundra' && !hasLoadedTundra) {
    //   hasLoadedTundra = true;
    //   const repeat = {
    //     wrapS: THREE.RepeatWrapping,
    //     wrapT: THREE.RepeatWrapping,
    //   };
    //   Assets.loadGPUTexture(renderer, waterDistortMap, WATER_DISTORT, repeat);
    //   Assets.loadGPUTexture(renderer, waterNoiseMap, WATER_NOISE, repeat);
    // }
    return createEnvironmentEntity(world, {
      biome: name,
      biomeData,
      width,
      height,
      bounds,
      renderer,
      uvMat,
      waterVertexShader: vertexShader,
      repeatX,
      repeatY,
      mapGround,
      mapOverlay,
      mapGroundPath,
      waterDistortMap,
      waterNoiseMap,
    });
  }

  function createMesh() {
    const dataTarget = world.findTag(Tags.GroundDataRenderTarget);
    // const fogTarget = world.findTag(Tags.GroundFogRenderTarget);

    const shader = ShaderManager.create({
      depthWrite: false,
      depthTest: false,
      name: "GroundShader",
      uniforms: {
        solved: { value: 0 },
        uvRepeatScale: { value: 1 },
        clearColor: { value: new THREE.Color("#130904") },
        uvScale: { value: new THREE.Vector2(repeatX, repeatY) },
        uvTransform: {
          value: uvMat,
        },

        environmentSize: {
          value: new THREE.Vector2(width, height),
        },
        // worldFogMap: {
        //   value: fogTarget ? fogTarget.target.texture : getEmptyTexture(),
        // },
        // worldFogProjection: {
        //   value: fogTarget ? fogTarget.projection : new THREE.Matrix4(),
        // },
        worldDataMap: {
          value: dataTarget ? dataTarget.target.texture : getEmptyTexture(),
        },
        worldDataProjection: {
          value: dataTarget ? dataTarget.projection : new THREE.Matrix4(),
        },
        worldDataView: {
          value: dataTarget ? dataTarget.view : new THREE.Matrix4(),
        },
        dataMapBiome: { value: getEmptyTexture() },
        dataMapColor: { value: getEmptyTexture() },
        dataMapLake: { value: getEmptyTexture() },
        overrideColor: { value: new THREE.Color("red") },
        originColor: { value: new THREE.Color("#969492") },
        useOverrideColor: { value: true, type: "b" },
        useOverrideMap: { value: true, type: "b" },
        overrideMap: { value: getEmptyTexture() },
        time: { value: 0 },
        tutorial: { value: 0 },
        outro: { value: 0 },
        // map0: { value: maps[0] },
        // map1: { value: maps[1] },
        // map2: { value: maps[2] },
        // map3: { value: maps[3] },
        // mapPath: { value: maps[4] },
        mapOverlay: { value: mapOverlay },
        mapGroundPath: { value: mapGroundPath },
        mapGround: { value: mapGround },
        overlayOpacity: { value: 0.3 },
      },

      defines: {
        HAS_DATA_MAP: true,
      },
      fragmentShader,
      vertexShader,
    });

    const quadMesh = new THREE.Mesh(quadGeo, shader);
    quadMesh.scale.set(width, 1, height);
    quadMesh.layers.set(world.findTag(Tags.RenderLayers).ground);
    quadMesh.name = "ground-quad";
    return world
      .entity()
      .add(Tags.Object3D, quadMesh)
      .add(Tags.ShaderUniformTime, { uniform: quadMesh.material.uniforms.time })
      .add(Tags.GroundMeshEditableData)
      .add(Tags.GroundPlaneLayer, quadMesh);
  }
}
