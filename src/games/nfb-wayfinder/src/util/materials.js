import * as THREE from "three";
import spriteFragmentShader from "../shaders/sprite.frag";
import spriteVertexShader from "../shaders/sprite.vert";
import * as Tags from "../tags";
import toonFragmentShader from "../shaders/toon.frag";
import toonVertexShader from "../shaders/toon.vert";
import * as ShaderManager from "./ShaderManager";

import { AllTokens, getTokenSheet, loadTokenSprites } from "../util/tokens";
import SpriteManager from "./SpriteManager";
import Assets from "./Assets";
import { shareAtlasTexture } from "./three-util";

const planeGeo = new THREE.PlaneGeometry(1, 1, 4, 4);
planeGeo.translate(0, 0.5, 0);

// Assets.prepare(AllTokens.map((id) => `image/tokens/ico_${id}`));

let tex;

export function getEmptyTexture() {
  if (!tex) {
    const data = new Uint8Array(2 * 2 * 3);
    tex = new THREE.DataTexture(data, 2, 2, THREE.RGBFormat);
    tex.needsUpdate = true;
  }
  return tex;
}

export function getSpriteGeometry() {
  return planeGeo;
}

export function setSpriteToken(renderer, sprite, type, height = null) {
  let map;
  // if (tokenTextureMap.has(type)) {
  //   map = tokenTextureMap.get(type);
  // } else {
  //   map = new THREE.Texture();
  //   tokenTextureMap.set(type, map);

  //   // queue loading this asset
  //   // Assets.loadGPUTexture(renderer, map, `image/tokens/ico_${type}`);
  // }

  getTokenSheet().then((sheet) => {
    const frame = sheet.map[`tokens/${type}`];
    if (frame) {
      shareAtlasTexture(renderer, frame.atlas, frame.texture);
      sprite.material.uniforms.map.value = frame.texture;
      sprite.material.uniforms.repeat.value.copy(frame.repeat);
      sprite.material.uniforms.offset.value.copy(frame.offset);
      if (height != null) {
        const aspect = frame.width / frame.height;
        const width = height * aspect;
        sprite.scale.set(width, height, 1);
      }
    }
  });
}

export function createTokenMaterial(bloom = 0.666, depthTested = true) {
  // TODO: force initialize all tokens upon startup?
  return ShaderManager.create({
    transparent: true,
    name: "token-material",
    uniforms: {
      // effect: { value: 0 },
      // noiseMap: { value: noiseMap },
      repeat: { value: new THREE.Vector2(1, 1) },
      offset: { value: new THREE.Vector2(0, 0) },
      map: { value: getEmptyTexture() },
      color: { value: new THREE.Color(1 + bloom, 1 + bloom, 1 + bloom) },
      opacity: { value: 1 },
      time: { value: 0 },
    },
    depthTest: depthTested,
    depthWrite: depthTested,
    vertexShader: /*glsl*/ `
    varying vec2 vUv;
    uniform vec2 repeat;
    uniform vec2 offset;
    void main () {
      vUv = uv;
      vUv *= repeat;
      vUv += offset;

      vec3 centerWorldPos = (modelMatrix * vec4(vec3(0.0), 1.0)).xyz;
      vec3 camRightWorld = vec3(viewMatrix[0].x, viewMatrix[1].x, viewMatrix[2].x);
      vec3 camUpWorld = vec3(viewMatrix[0].y, viewMatrix[1].y, viewMatrix[2].y);

      vec2 scale;
      scale.x = length( vec3( modelMatrix[ 0 ].x, modelMatrix[ 0 ].y, modelMatrix[ 0 ].z ) );
      scale.y = length( vec3( modelMatrix[ 1 ].x, modelMatrix[ 1 ].y, modelMatrix[ 1 ].z ) );

      vec3 offsetPos = position.xyz;
      vec3 vertexWorldPos = centerWorldPos
        + camRightWorld * offsetPos.x * scale.x
        + camUpWorld * offsetPos.y * scale.y;

      // gl_Position = projectionMatrix * modelViewMatrix * vec4(position.xyz, 1.0);
      gl_Position = projectionMatrix * viewMatrix * vec4(vertexWorldPos, 1.0);
    }
    `,
    side: THREE.DoubleSide,
    fragmentShader: /*glsl*/ `
    varying vec2 vUv;
    uniform sampler2D map;
    // uniform sampler2D noiseMap;
    uniform vec3 color;
    uniform float time;
    uniform float opacity;
    // uniform float effect;
    void main () {
      vec2 uv = vUv;

      // vec4 noiseLow = texture2D(noiseMap, vUv * 0.075 + vec2(time * 0.075, 0.0)) * 2.0 - 1.0;
      // vec4 noiseHigh = texture2D(noiseMap, (vUv * 0.25 + vec2(0.0, time * 0.075))) * 2.0 - 1.0;

      vec4 tcol = texture2D(map, vUv);
      // vec4 ecol = vec4(0.0);
      // ecol += texture2D(map, vUv + noiseLow.rg * 0.2) * 0.2;
      // ecol += texture2D(map, vUv + noiseLow.rg * 0.1) * 0.33;
      // ecol += texture2D(map, vUv + noiseHigh.rg * 0.05) * 0.33;
      // vec4 fcol = mix(tcol, ecol, effect);
      vec4 outColor = vec4(color, opacity) * tcol;
      gl_FragColor = vec4(outColor);
    }
    `,
  });
}

export function createSpriteMaterial(world) {
  const groundView = world.findTag(Tags.GroundPlaneView);
  const emptyTexture = getEmptyTexture();
  // const fogTarget = world.findTag(Tags.GroundFogRenderTarget);
  const dataTarget = world.findTag(Tags.GroundDataRenderTarget);

  return ShaderManager.create({
    name: "WayfinderSpriteShader",
    extensions: {
      derivatives: true,
    },
    // defines: {
    //   SILHOUETTE: true,
    // },
    transparent: true,
    // depthTest: false,
    // depthWrite: false,
    side: THREE.DoubleSide,
    fragmentShader: spriteFragmentShader,
    vertexShader: spriteVertexShader,
    uniforms: {
      // worldFogProjection: {
      //   value: fogTarget ? fogTarget.projection : new THREE.Matrix4(),
      // },
      // worldFogMap: {
      //   value: fogTarget ? fogTarget.target.texture : getEmptyTexture(),
      // },
      // worldDataSize: { value: 512 }, // TODO: fix hardcoding...
      shadowColor: { value: new THREE.Color("#280422") },
      groundMap: { value: groundView.target.texture },
      groundProjectionMatrix: { value: groundView.projectionMatrix },
      worldDataMap: {
        value: dataTarget ? dataTarget.target.texture : new THREE.Texture(),
      },
      worldDataProjection: {
        value: dataTarget ? dataTarget.projection : new THREE.Matrix4(),
      },
      worldDataView: {
        value: dataTarget ? dataTarget.view : new THREE.Matrix4(),
      },
      map: { value: emptyTexture },
      // noiseMap: { value: noiseMap || new THREE.Texture() },
      flip: { value: 1 },
      silhouette: { value: false, type: "b" },
      useMapDiscard: { value: false, type: "b" },
      color: { value: new THREE.Color("white") },
      time: { value: 0 },
      spin: { value: 0 },
      spriteHeight: { value: 1 },
      aspect: { value: 1 },
      repeat: { value: new THREE.Vector2(1, 1) },
      offset: { value: new THREE.Vector2(0, 0) },
      tintColor: { value: new THREE.Color("#ffffff") },
    },
  });
}

export function createMeshMaterial(world, mesh, { map, ignoreGround = false }) {
  const groundView = world.findTag(Tags.GroundPlaneView);
  const groundTexture = groundView.target.texture;
  const groundProjectionMatrix = groundView.projectionMatrix;
  mesh.updateMatrix();
  mesh.updateMatrixWorld();

  const bounds = new THREE.Box3().setFromObject(mesh);
  const oldMat = mesh.material;

  const alphaTest = oldMat.alphaTest || 0;
  // child.material.alphaTest = mat.alphaTest;
  // child.material.transparent = mat.transparent;

  return ShaderManager.create({
    transparent: Boolean(oldMat.transparent),
    name: "WayfinderMeshShader",
    defines: {
      HAS_INTENSITY: Boolean(false),
      HAS_VERTEX_COLORS: Boolean(false),
    },
    vertexShader: toonVertexShader,
    fragmentShader: toonFragmentShader,
    side: THREE.FrontSide,
    extensions: {
      derivatives: true,
    },
    uniforms: {
      alphaTest: { value: alphaTest },
      ignoreGround: { value: Boolean(ignoreGround), type: "i" },
      normalMap: { value: new THREE.Texture() },
      groundTexture: { value: groundTexture || new THREE.Texture() },
      groundTextureEnabled: { type: "b", value: Boolean(groundTexture) },
      groundBounce: { type: "b", value: true },
      groundBounceLow: { value: 0.06 },
      groundBounceHigh: { value: 0.25 },
      groundBounceStrength: { value: 0.5 },
      groundProjectionMatrix: {
        value: groundProjectionMatrix || new THREE.Matrix4(),
      },
      useNormalMap: { type: "b", value: false },
      flipNormalY: { type: "b", value: false },
      diffuseShading: { type: "b", value: false },
      debugNormals: { type: "b", value: false },
      resolution: { value: new THREE.Vector2() },
      celShading: { type: "b", value: false },
      darkShading: { type: "b", value: false },
      vertexColors: { type: "b", value: false },
      useOverlayMap: { type: "b", value: false },
      useNoiseMap: { type: "b", value: false },
      useDiffuseMap: { type: "b", value: true },
      overlayColor: { value: new THREE.Color() },
      colorA: { value: new THREE.Color() },
      colorB: { value: new THREE.Color() },
      cameraDirection: { value: new THREE.Vector3() },
      minBounds: { value: bounds.min },
      maxBounds: { value: bounds.max },
      lightDirection: { value: new THREE.Vector3() },
      map: { value: map || new THREE.Texture() },
      noiseMap: { value: new THREE.Texture() },
      overlayMap: { value: new THREE.Texture() },
    },
  });
}
