import * as Tags from "../tags";
import * as THREE from "three";
import fragmentShader from "../shaders/post-process.frag";
// import lutMapUrl from "../assets/textures/lut-post-process.png";
import queryString from "../util/query-string";
import { loadTexture } from "../util/load";
// import noiseMapUrl from "../assets/textures/HDR_RGBA_0.png";
import fragmentShaderBloom from "../shaders/post-process-bloom-glow.frag";
import { setEntityTweenFromTo } from "./AnimationSystem";
import * as ShaderManager from "../util/ShaderManager";

import Assets from "../util/Assets";
import { postRender, preRender } from "../util/addFrameTasks";

const LUT_ID = "image/data/lut-forest";
const NOISE_ID = "image/data/bluenoise-0";

// pre-fetch these assets at startup as they are needed to render a frame
// Assets.prepare([NOISE_ID, LUT_ID]);

export const GLOW_LAYER = 12;

export default function SubmitFrameSystem(world, opt = {}) {
  const { fade = 0 } = opt;
  const renderer = world.findTag(Tags.Renderer);

  const supportsHalfFloat =
    renderer.capabilities.isWebGL2 ||
    Boolean(renderer.extensions.get("OES_texture_half_float"));

  const supportsFullFloat =
    renderer.capabilities.isWebGL2 ||
    Boolean(renderer.extensions.get("OES_texture_float"));

  let renderTarget, renderTargetGlow, renderTargetGlow1, renderTargetGlow2;

  let renderTargetGround;

  const glowWidth = 512;
  const glowBlurWidth = 512;
  const groundWidth = 768;

  const shouldDrawGround = queryString.ground !== false;
  const shouldUseFloat = queryString.float !== false;
  const shouldUsePost = queryString.post !== false;
  const canUseFloat =
    shouldUseFloat && (supportsHalfFloat || supportsFullFloat);

  let currentLut = null;
  const lutMap = new THREE.Texture();
  lutMap.minFilter = lutMap.magFilter = THREE.LinearFilter;
  lutMap.generateMipmaps = false;

  // await Assets.createGPUTexture(renderer, LUT_ID, {
  //   minFilter: THREE.LinearFilter,
  //   magFilter: THREE.LinearFilter,
  //   generateMipmaps: false,
  // });

  const [noiseMap] = Assets.createGPUTextureTask(renderer, NOISE_ID, {
    wrapS: THREE.RepeatWrapping,
    wrapT: THREE.RepeatWrapping,
  });

  const shadowCasters = world.view([Tags.ShadowCaster, Tags.Object3D]);

  const postScene = new THREE.Scene();
  const postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const postGeometry = new THREE.BufferGeometry();
  postGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute([-1, -1, -1, 4, 4, -1], 2)
  );

  const plainVertexShader = /*glsl*/ `
    varying vec2 vUv;
    void main () {
      vUv = position.xy * 0.5 + 0.5;
      gl_Position = vec4(position.xy, 0.0, 1.0);
    }
  `;

  const plainMaterial = new THREE.ShaderMaterial({
    name: "GlowPass1Material",
    depthWrite: true,
    depthTest: false,
    uniforms: {
      map: { value: new THREE.Texture() },
    },
    side: THREE.BackSide,
    vertexShader: plainVertexShader,
    fragmentShader: /*glsl*/ `
      varying vec2 vUv;
      uniform sampler2D map;
      void main () {
        gl_FragColor = texture2D(map, vUv);
      }
    `,
  });

  const glowPass0Material = new THREE.ShaderMaterial({
    name: "GlowPass0Material",
    depthWrite: false,
    depthTest: false,
    uniforms: {
      resolution: { value: new THREE.Vector2(0, 0) },
      map: { value: new THREE.Texture() },
    },
    defines: {
      HAS_FLOAT: canUseFloat,
    },
    side: THREE.BackSide,
    vertexShader: plainVertexShader,
    fragmentShader: /*glsl*/ `
      uniform highp sampler2D map;
      varying vec2 vUv;
      float luma(vec3 color) {
        return dot(color, vec3(0.299, 0.587, 0.114));
      }
      void main () {
        vec3 rgb = texture2D(map, vUv).rgb;
        
        #ifdef HAS_FLOAT
          vec3 col;
          col.r = rgb.r > 1.0 ? rgb.r : 0.0;
          col.g = rgb.g > 1.0 ? rgb.g : 0.0;
          col.b = rgb.b > 1.0 ? rgb.b : 0.0;
          col -= 1.0;
          col = max(col, 0.0);
          gl_FragColor = vec4(col, 1.0);
        #else
          float L = luma(rgb);
          gl_FragColor = vec4(vec3(smoothstep(0.75, 1.0, L)), 1.0);
        #endif
      }
    `,
  });

  const glowPass1Material = new THREE.ShaderMaterial({
    name: "GlowPass1Material",
    depthWrite: false,
    depthTest: false,
    uniforms: {
      direction: { value: new THREE.Vector2(1, 0) },
      resolution: { value: new THREE.Vector2(0, 0) },
      map: { value: new THREE.Texture() },
    },
    side: THREE.BackSide,
    vertexShader: plainVertexShader,
    fragmentShader: fragmentShaderBloom,
  });

  const postMaterial = new THREE.ShaderMaterial({
    name: "PostMaterial",
    depthWrite: false,
    depthTest: false,
    defines: {
      HAS_FLOAT: canUseFloat,
    },
    uniforms: {
      resolution: { value: new THREE.Vector2(0, 0) },
      noiseMap: { value: noiseMap },
      glowMap: { value: new THREE.Texture() },
      lutMap: { value: lutMap },
      rampColor0: { value: new THREE.Color("#57738f") },
      rampColor1: { value: new THREE.Color("#172a46") },
      rampStrength: { value: 1 },
      time: { value: 0 },
      map: { value: new THREE.Texture() },
      fadeToBlackColor: { value: new THREE.Color("#130904") },
      fadeToBlack: { value: fade },
    },
    side: THREE.BackSide,
    vertexShader: plainVertexShader,
    fragmentShader,
  });
  const postQuad = new THREE.Mesh(postGeometry, postMaterial);
  postQuad.name = "post-process-quad";
  postQuad.frustumCulled = false;
  postScene.add(postQuad);

  // const groundTag = world.findTag(Tags.GroundPlaneView);
  // const shadowTag = world.findTag(Tags.SpriteBlobShadowView);
  // const grassTag = world.findTag(Tags.GrassPlaneView);
  const renderLayers = world.findTag(Tags.RenderLayers);
  const postProcess = world
    .entity()
    .add(Tags.PostProcessEnabled, shouldUsePost);
  const faderEvents = world.listen(Tags.ScreenFade);
  const faderView = world.view(Tags.ScreenFade);
  const appState = world.findTag(Tags.AppState);
  const activeEnvView = world.view(Tags.ActiveEnvironmentState);
  const editableData = world.findTag(Tags.GroundMeshEditableData);

  let compiled = false;

  const lutIds = {
    forest: "forest",
    tundra: "tundra6",
    grasslands: "grasslands",
  };

  window.printStats = printStats;
  return function submitFrameSystem(dt) {
    if (activeEnvView.length > 0) {
      const state = activeEnvView[0].get(Tags.EnvironmentState);
      let newLut = lutIds[state.name];
      if (currentLut !== newLut) {
        currentLut = newLut;
        // dynamically swap LUT maps as needed
        Assets.loadGPUTexture(renderer, lutMap, `image/data/lut-${currentLut}`);
        // postMaterial.uniforms.rampStrength.value =
        //   state.name === "tundra" ? 0 : 0;
      }
    }

    if (appState.rendering) {
      postMaterial.uniforms.time.value += dt;
      doRender(dt);
    }
  };

  function doRender(dt = 0) {
    const doPost = postProcess.get(Tags.PostProcessEnabled);
    const scene = world.findTag(Tags.MainScene);
    const camera = world.findTag(Tags.MainCamera);
    const canvas = renderer.domElement;
    const width = appState.canvasWidth;
    const height = appState.canvasHeight;

    // nothing to render
    if (!width || !height) return;
    const aspect = width / height;
    const atmospherics = world.findTag(Tags.Atmospherics);

    if (!renderTarget) {
      renderTarget = new THREE.WebGLRenderTarget(width, height);
      renderTarget.texture.generateMipmaps = false;
      renderTarget.texture.minFilter = THREE.LinearFilter;
      renderTarget.texture.magFilter = THREE.LinearFilter;
      if (canUseFloat) {
        renderTarget.texture.type = supportsHalfFloat
          ? THREE.HalfFloatType
          : THREE.FloatType;
      }
      postMaterial.uniforms.map.value = renderTarget.texture;
      postMaterial.uniforms.resolution.value.set(width, height);
    }
    if (width !== renderTarget.width || height !== renderTarget.height) {
      renderTarget.setSize(width, height);
      postMaterial.uniforms.resolution.value.set(width, height);
    }

    // const curGroundWidth = Math.min(groundWidth, width / 2);
    // const curGroundHeight = Math.round(curGroundWidth / aspect);
    // if (
    //   !renderTargetGround ||
    //   renderTargetGround.width !== curGroundWidth ||
    //   renderTargetGround.height !== curGroundHeight
    // ) {
    //   if (!renderTargetGround) {
    //     renderTargetGround = new THREE.WebGLRenderTarget(
    //       curGroundWidth,
    //       curGroundHeight
    //     );
    //     renderTargetGround.texture.generateMipmaps = false;
    //     renderTargetGround.texture.minFilter = THREE.LinearFilter;
    //     renderTargetGround.texture.magFilter = THREE.LinearFilter;
    //     renderTargetGround.depthBuffer = true;
    //   } else {
    //     renderTargetGround.setSize(curGroundWidth, curGroundHeight);
    //   }
    // }

    const gWidth = Math.min(glowWidth, width);
    const gHeight = Math.round(gWidth / aspect);
    if (
      !renderTargetGlow ||
      renderTargetGlow.width !== gWidth ||
      renderTargetGlow.height !== gHeight
    ) {
      if (!renderTargetGlow) {
        renderTargetGlow = new THREE.WebGLRenderTarget(gWidth, gHeight);
        renderTargetGlow.depthBuffer = false;
        renderTargetGlow.texture.generateMipmaps = false;
        renderTargetGlow.texture.minFilter = THREE.LinearFilter;
        renderTargetGlow.texture.magFilter = THREE.LinearFilter;
      } else {
        renderTargetGlow.setSize(gWidth, gHeight);
      }
    }

    const g1Width = Math.min(width, glowBlurWidth);
    const g1Height = Math.round(g1Width / aspect);
    if (
      !renderTargetGlow1 ||
      renderTargetGlow1.width !== g1Width ||
      renderTargetGlow1.height !== g1Height
    ) {
      if (!renderTargetGlow1) {
        renderTargetGlow1 = new THREE.WebGLRenderTarget(g1Width, g1Height);
        renderTargetGlow1.depthBuffer = false;
        // renderTargetGlow1.texture.type = THREE.HalfFloatType;
        renderTargetGlow1.texture.generateMipmaps = false;
        renderTargetGlow1.texture.minFilter = THREE.LinearFilter;
        renderTargetGlow1.texture.magFilter = THREE.LinearFilter;
        renderTargetGlow2 = renderTargetGlow1.clone();
      } else {
        renderTargetGlow1.setSize(g1Width, g1Height);
        renderTargetGlow2.setSize(g1Width, g1Height);
      }
      glowPass1Material.uniforms.resolution.value.set(g1Width, g1Height);
    }

    if (faderEvents.changed) {
      faderEvents.added.forEach((e) => {
        const d = e.get(Tags.ScreenFade);
        // postMaterial.uniforms.fadeToBlack.value = d.from;
        setEntityTweenFromTo(
          e,
          postMaterial.uniforms.fadeToBlack,
          "value",
          d.from,
          d.to,
          d.duration,
          d.ease,
          d.delay
        );
        const tween = e.get(Tags.TargetKeyTween);
        tween.assignFromOnStart = true;
        tween.callbackOnStart = d.callbackOnStart;
        tween.callbackOnFinish = d.callbackOnFinish;
      });
    }

    const wasAutoClear = renderer.autoClear;
    renderer.autoClear = false;
    renderer.info.autoReset = false;
    scene.autoUpdate = false;
    scene.matrixAutoUpdate = false;
    scene.updateMatrix();
    scene.updateMatrixWorld();

    renderer.info.reset();

    // initialize any pending shaders
    ShaderManager.initialize(renderer, 15);

    if (!compiled) {
      compiled = true;
      console.log("Compiling scene");
      renderer.compile(scene, camera);
    }

    preRender();

    // first render a down-sampled ground
    // renderer.setRenderTarget(renderTargetGround);
    // renderer.clear();

    // camera.layers.disableAll();
    // camera.layers.enable(renderLayers.ground);
    // renderer.render(scene, camera);

    if (doPost) renderer.setRenderTarget(renderTarget);
    else renderer.setRenderTarget(null);

    // draw main scene
    renderer.clear();

    // postQuad.material = plainMaterial;
    // postQuad.material.uniforms.map.value = renderTargetGround.texture;
    // renderer.render(postScene, postCamera);

    camera.layers.disableAll();
    if (shouldDrawGround) {
      camera.layers.enable(renderLayers.grass);
      camera.layers.enable(renderLayers.ground);
    }
    camera.layers.enable(renderLayers.groundDepth);
    camera.layers.enable(renderLayers.water);

    // renderer.render(scene, camera);

    // camera.layers.disableAll();
    camera.layers.enable(renderLayers.shadow);
    drawShadows(scene, camera);

    camera.layers.enableAll();
    // camera.layers.disable(GLOW_LAYER);
    camera.layers.disable(renderLayers.water);
    camera.layers.disable(renderLayers.shadow);
    camera.layers.disable(renderLayers.ground);
    camera.layers.disable(renderLayers.groundDepth);
    camera.layers.disable(renderLayers.atmospherics);
    camera.layers.disable(renderLayers.grass);
    renderer.render(scene, camera);

    if (doPost) {
      // downsample + threshold result
      if (canUseFloat) {
        renderer.setRenderTarget(renderTargetGlow);
        // renderer.clear();
        postQuad.material = glowPass0Material;
        glowPass0Material.uniforms.map.value = renderTarget.texture;
        glowPass0Material.uniforms.resolution.value.set(gWidth, gHeight);
        renderer.render(postScene, postCamera);

        // now do a horizontal pass
        renderer.setRenderTarget(renderTargetGlow1);
        // renderer.clear();
        postQuad.material = glowPass1Material;
        glowPass1Material.uniforms.map.value = renderTargetGlow.texture;
        glowPass1Material.uniforms.resolution.value.set(gWidth, gHeight);
        glowPass1Material.uniforms.direction.value.set(1, 0);
        renderer.render(postScene, postCamera);

        // vertical pass
        renderer.setRenderTarget(renderTargetGlow2);
        // renderer.clear();
        postQuad.material = glowPass1Material;
        glowPass1Material.uniforms.map.value = renderTargetGlow1.texture;
        glowPass1Material.uniforms.resolution.value.set(g1Width, g1Height);
        glowPass1Material.uniforms.direction.value.set(0, 1);
        renderer.render(postScene, postCamera);
      }

      renderer.setRenderTarget(null);
      // renderer.clear();
      postQuad.material = postMaterial;
      if (canUseFloat) {
        postMaterial.uniforms.glowMap.value = renderTargetGlow2.texture;
      }
      postMaterial.uniforms.lutMap.value = editableData.useCustomLUT
        ? editableData.lutMap
        : lutMap;
      renderer.render(postScene, postCamera);
    }

    // if (atmospherics) {
    //   renderer.render(atmospherics.scene, atmospherics.camera);
    // }

    renderer.autoClear = wasAutoClear;

    postRender();

    // camera.layers.enableAll();
    // renderer.render(scene, camera);
    // console.log(glowPass0Material.uniforms.resolution);
    // console.log(glowPass1Material.uniforms.resolution);
    // console.log(postMaterial.uniforms.resolution);
  }

  function printStats() {
    let sum = 0;
    world.findTag(Tags.MainScene).traverse((child) => {
      if (child.isMesh) sum++;
    });
    console.log("Total Meshes", sum);
    console.log("Geometries", renderer.info.memory.geometries);
    console.log("Textures", renderer.info.memory.textures);
    console.log("Calls", renderer.info.render.calls);
    console.log("Triangles", renderer.info.render.triangles);
    console.log("Points", renderer.info.render.points);
    console.log(
      "Programs",
      renderer.info.programs.map((p) => p.name)
    );
  }

  function drawShadows(scene, camera) {
    for (let i = 0; i < shadowCasters.length; i++) {
      const e = shadowCasters[i];
      const child = e.get(Tags.Object3D);
      if (
        child.visible &&
        child.isMesh &&
        child.userData.__shadowMaterial &&
        child.userData.__shadowEnabled
      ) {
        child.userData.__material = child.material;
        child.userData.__materialDepthTest = child.material.depthTest;
        child.userData.__materialDepthWrite = child.material.depthWrite;
        child.userData.__materialBlending = child.material.blending;
        child.userData.__materialTransparent = child.material.transparent;
        child.material = child.userData.__shadowMaterial;
        child.material.depthTest = true;
        child.material.depthWrite = false;
        child.material.transparent = true;
        child.material.blending = THREE.MultiplyBlending;
        if (child.material.uniforms && child.material.uniforms.silhouette) {
          child.material.uniforms.silhouette.value = true;
        }
      }
    }

    renderer.render(scene, camera);

    for (let i = 0; i < shadowCasters.length; i++) {
      const e = shadowCasters[i];
      const child = e.get(Tags.Object3D);
      if (child.visible && child.isMesh && child.userData.__material) {
        child.material = child.userData.__material;
        child.material.depthWrite = child.userData.__materialDepthTest;
        child.material.depthTest = child.userData.__materialDepthWrite;
        child.material.transparent = child.userData.__materialTransparent;
        child.material.blending = child.userData.__materialBlending;

        if (child.material.uniforms && child.material.uniforms.silhouette) {
          child.material.uniforms.silhouette.value = false;
        }
      }
    }
  }

  function setMaterial(mat, target) {
    postQuad.material = mat;
    const width = target.width;
    const height = target.height;
    if (mat.uniforms.resolution) {
      mat.uniforms.resolution.value.set(width, height);
    }
  }
}
