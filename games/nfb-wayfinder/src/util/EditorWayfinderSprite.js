import * as THREE from "three";
import * as Tags from "../tags";
import { createSpriteMaterial } from "./materials";
import defined from "./defined";

const planeGeo = new THREE.PlaneGeometry(1, 1, 1, 1);
planeGeo.translate(0, 0.5, 0);

export class WayfinderSpriteMaterial extends THREE.MeshBasicMaterial {
  constructor(opt = {}) {
    super({
      ...opt,
      map: opt.map || new THREE.Texture(),
    });
    this.name = this.name || "UntitledWayfinderSprite";
    this.userData.type = "WayfinderSpriteMaterial";
  }

  onBeforeCompile(shader) {
    const vertexShader = /*glsl*/ `
    #include <common>
    varying vec2 vUv;
    uniform bool flipX;
    uniform bool silhouette;
    void main () {
      vUv = uv;
      if (flipX) vUv.x = 1.0 - vUv.x;

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

      if (silhouette) {
        float xSkew = -60.0 * (PI/180.0);
        float ySkew = 0.0;

        // Create a transform that will skew our texture coords
        mat3 trans = mat3(
          1.0       , tan(xSkew), 0.0,
          tan(ySkew), 1.0,        0.0,
          0.0       , 0.0,        1.0
        );
        float yPos = vertexWorldPos.y;
        vertexWorldPos.y *= 0.25;
        vertexWorldPos.xyz -= camRightWorld * yPos * 0.5;
        vertexWorldPos.z += -0.15;
      }
      gl_Position = projectionMatrix * viewMatrix * vec4(vertexWorldPos, 1.0);
    }`;

    const fragmentShader = /*glsl*/ `
    uniform sampler2D map;
    uniform bool silhouette;
    // uniform vec3 color;
    varying vec2 vUv;
    void main () {
      gl_FragColor = texture2D(map, vUv);
      if (gl_FragColor.a < 0.5) discard;
    }
    `;

    shader.uniforms = shader.uniforms || {};
    const flipX = Boolean(this.userData.flipX);
    shader.uniforms.flipX = { value: flipX, type: "b" };
    shader.uniforms.silhouette = { value: false, type: "b" };
    shader.vertexShader = vertexShader;
    shader.fragmentShader = fragmentShader;
    this._currentShader = shader;
    this.userData.flipX = flipX;
  }

  getFlipX() {
    return Boolean(this.userData.flipX);
  }

  setFlipX(flipX) {
    flipX = Boolean(flipX);
    if (this._currentShader) {
      this._currentShader.uniforms.flipX.value = flipX;
    }
    this.userData.flipX = flipX;
  }
}

export default class WayfinderSprite extends THREE.Mesh {
  constructor() {
    super(planeGeo, createMaterial());
    this.userData.type = "WayfinderSprite";
    this.onBeforeRender = onBeforeRender.bind(this);
    this.__onImageUpdate = this.onBeforeRender;
  }
}

function onBeforeRender() {
  let oldX = this.scale.x;
  const spriteHeight = this.scale.y;
  let aspect = 1;
  if (this.material && this.material.map && this.material.map.image) {
    const { width, height } = this.material.map.image;
    aspect = width / height;
    this.scale.x = spriteHeight * aspect;
  }
  if (oldX !== this.scale.x) {
    this.updateMatrix();
  }
}

function setSpriteData(world, child, map, maxY = Infinity, flipX = false) {
  const aspect = map && map.image ? map.image.width / map.image.height : 1;
  child.geometry = planeGeo;
  child.material = createSpriteMaterial(world);
  child.material.uniforms.map.value = map;

  child.material.uniforms.repeat.value.copy(map.repeat);
  child.material.uniforms.offset.value.copy(map.offset);

  child.material.uniforms.flip.value = flipX ? -1 : 1;
  child.material.side = flipX ? THREE.BackSide : THREE.FrontSide;
  child.material.uniforms.useMapDiscard.value = false;

  // child.scale.y = Math.min(child.scale.y, maxY);
  // child.scale.x = child.scale.y * aspect;

  child.material.uniforms.aspect.value = aspect;
  child.material.uniforms.spriteHeight.value = child.scale.y;
}

export function setSpriteFlip(sprite, flipX) {
  sprite.material.uniforms.flip.value = flipX ? -1 : 1;
  sprite.material.side = flipX ? THREE.BackSide : THREE.FrontSide;
}

export function setMeshToSprite(world, child, maxY = Infinity) {
  const map =
    child.material.uniforms && child.material.uniforms.map
      ? child.material.uniforms.map.value
      : child.material.map;
  const flipX = defined(child.material.userData.flipX, child.userData.flipX);
  setSpriteData(world, child, map, maxY, flipX);
}

export function createSprite(
  world,
  map,
  height = 1,
  maxY = Infinity,
  flipX = false
) {
  const mesh = new THREE.Mesh();
  mesh.scale.y = height;
  setSpriteData(world, mesh, map, maxY, flipX);
  return mesh;
}

export function traverseAndFixSprites(world, scene) {
  scene.traverse((child) => {
    if (child && child.userData && child.userData.type === "WayfinderSprite") {
      // changeToWayfinderSprite(child);
      setMeshToSprite(world, child);

      // child.position.y = 0;
      // const e = world.entity();
      // e.add(Tags.Object3D, object);
      // e.add(Tags.ShadowCaster);
      // e.get(Tags.ShadowCaster).sprite = true;
      // e.add(Tags.ShaderUniformTime);

      // child.scale.y =
    }
  });
}

export function changeToWayfinderSprite(mesh) {
  mesh.geometry = planeGeo;
  const texture = new THREE.Texture();
  if (mesh.material.map) {
    texture.image = mesh.material.map.image;
    texture.needsUpdate = true;
  }
  const materialUserData = { ...mesh.material.userData };
  mesh.material = createMaterial(texture);
  Object.assign(mesh.material.userData, materialUserData);
  mesh.onBeforeRender = onBeforeRender.bind(mesh);
  mesh.__onImageUpdate = mesh.onBeforeRender;
}

function createMaterial(map) {
  return new WayfinderSpriteMaterial({
    map: map || new THREE.Texture(),
  });
}
