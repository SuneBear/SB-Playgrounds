import * as Tags from "../../tags";
import * as THREE from "three";
import ObjectPool from "../../util/ObjectPool";
import SpriteManager from "../../util/SpriteManager";
import { detachObject, shareAtlasTexture } from "../../util/three-util";
import { loadTexture } from "../../util/load";
import * as MathUtil from "../../util/math";
import { tweenFromTo, tweenTo } from "../AnimationSystem";
// import { Assets as AssetsOld } from "../AssetLoaderSystem";

// TODO: resolve this to asset-loaded png
// import noiseMapUrl from "../../assets/textures/HDR_RGBA_0.png";

// import sheetData01 from "../../assets/spritesheets/temp_sprites-0.sheet";
// import sheetData02 from "../../assets/spritesheets/temp_sprites-1.sheet";
// import sheetData03 from "../../assets/spritesheets/temp_sprites-2.sheet";
// import sheetUrl01 from "../../assets/spritesheets/temp_sprites-0.png";
// import sheetUrl02 from "../../assets/spritesheets/temp_sprites-1.png";
// import sheetUrl03 from "../../assets/spritesheets/temp_sprites-2.png";

import {
  createSpriteMaterial,
  getEmptyTexture,
  getSpriteGeometry,
} from "../../util/materials";
// import Assets from "../../util/Assets";
// Assets.prepare(["spritesheets/temp_sprites"]);

// const sheets = [
//   { data: sheetData01, url: sheetUrl01 },
//   { data: sheetData02, url: sheetUrl02 },
//   { data: sheetData03, url: sheetUrl03 },
// ];

const MAX_HEIGHT = 20;
const TREE_DATA = { height: 15 };

const spriteData = {
  tree_naked2: {
    ...TREE_DATA,
    ignoreFlip: true,
    shadow: true,
    shadowScale: 0.7,
    shadowOffsetX: -0.35,
    shadowOffsetY: 0.05,
    varianceStd: 0.5,
    useMapDiscard: true,
  },
  "forest-twig1": { minSize: 0.5, maxSize: 0.75 },
  "forest-twig2": { minSize: 0.5, maxSize: 0.75 },
  "forest-twig3": { minSize: 0.5, maxSize: 0.75 },
  tree1: {
    ...TREE_DATA,
    ignoreFlip: true,
    minSize: 8,
    useMapDiscard: true,
  },
  tree2: {
    ...TREE_DATA,
    ignoreFlip: true,
    useMapDiscard: true,
  },
  "origin-tree": {
    ignoreFlip: true,
    height: 10,
    useMapDiscard: true,
  },
  tree3: {
    ...TREE_DATA,
    ignoreFlip: true,
    useMapDiscard: true,
  },
  tree5: {
    ...TREE_DATA,
    ignoreFlip: true,
    varianceStd: 0.25,
    useMapDiscard: true,
  },
  acorns1: {
    height: 0.5,
  },
  fallen_wood1: {
    height: 0.5,
  },
  fallen_wood2: {
    height: 0.5,
  },
  tree_naked1: {
    ...TREE_DATA,
    ignoreFlip: true,
    shadow: true,
    shadowScale: 0.7,
    shadowOffsetX: -0.3,
    shadowOffsetY: -0.6,
    varianceStd: 0.5,
  },
  tree_naked3: {
    ...TREE_DATA,
    ignoreFlip: true,
    height: 7,
    shadow: true,
    shadowScale: 0.5,
    shadowOffsetX: -0.2,
    varianceStd: 0.5,
    useMapDiscard: true,
  },
  smalltree1: {
    useMapDiscard: false,
    minSize: 3,
  },
  tree_naked2: {
    ...TREE_DATA,
    ignoreFlip: true,
    shadow: true,
    shadowScale: 0.6,
    shadowOffsetX: -0.35,
    shadowOffsetY: 0.1,
    varianceStd: 0.5,
    useMapDiscard: true,
  },
  decayed_stump1: {
    ignoreFlip: true,
    height: 1.5,
    minSize: 1.5,
    maxSize: 2.25,
    varianceStd: 0.25,
    shadow: true,
    shadowScale: 1.0,
    shadowOffsetX: -0.25,
    shadowOffsetY: -0.5,
    useMapDiscard: true,
  },
  decayed_twig1: {
    minSize: 1,
    height: 1.25,
    maxSize: 1.5,
    useMapDiscard: false,
  },
  decayed_twig2: {
    minSize: 1,
    height: 1.25,
    maxSize: 1.5,
    useMapDiscard: false,
  },
  decayed_twig3: {
    minSize: 1,
    height: 1.25,
    maxSize: 1.5,
    useMapDiscard: false,
  },
  decayed_twig4: {
    minSize: 1,
    height: 1.25,
    maxSize: 1.5,
    useMapDiscard: false,
  },
  "oat-shadow1": {
    minSize: 1,
    height: 1.5,
    maxSize: 2,
    useMapDiscard: false,
    ignoreFlip: true,
  },
  "small-rock1": {
    minSize: 0.35,
    height: 0.5,
    maxSize: 0.65,
    useMapDiscard: false,
    ignoreFlip: true,
  },
  "small-rock2": {
    minSize: 0.35,
    height: 0.5,
    maxSize: 0.65,
    useMapDiscard: false,
    ignoreFlip: true,
  },
  "wetland-plant1": {
    minSize: 1,
    height: 1.25,
    maxSize: 1.5,
    useMapDiscard: false,
  },
  "wetland-plant2": {
    minSize: 1,
    height: 1.25,
    maxSize: 1.5,
    useMapDiscard: false,
  },
  "wetland-grass1": {
    minSize: 1,
    height: 1.25,
    maxSize: 1.5,
    useMapDiscard: false,
  },
};

const treeLushType = {
  ...TREE_DATA,
  ignoreFlip: true,
  minSize: 8,
  useMapDiscard: true,
};

const grasslandGrassType = {
  minSize: 1.5,
  height: 1.5,
  maxSize: 2.25,
  useMapDiscard: false,
};

export default async function AssetSprites(world) {
  const renderer = world.findTag(Tags.Renderer);
  // const sprites = await SpriteManager("spritesheets/temp_sprites", renderer);
  const dataTarget = world.findTag(Tags.GroundDataRenderTarget);
  const groundView = world.findTag(Tags.GroundPlaneView);

  const emptyTexture = getEmptyTexture();
  const planeGeo = getSpriteGeometry();

  // const spriteMaterial = createSpriteMaterial(world, noiseMap);
  //     const sprite = new THREE.Mesh(planeGeo, spriteMaterial);
  //     sprite.frustumCulled = false;
  //     sprite.name = "environment-sprite";
  //     return sprite;

  return {
    next: nextSprite,
    release(entity) {
      const data = entity.get(Tags.GroundAssetData);

      if (data.instance && data.instance.userData._pool) {
        data.instance.userData._pool.release(data.instance);
      }
      // data.instance.traverse((child) => {
      //   if (child.userData._entity) {
      //     child.userData._entity.kill();
      //   }
      // });
      detachObject(data.instance);
      data.instance = null;

      // if (entity.has(Tags.Object3D)) {
      //   const s = entity.get(Tags.Object3D);
      //   detachObject(s);
      // }
      // if (
      //   s &&
      //   s.material &&
      //   s.material.uniforms.map &&
      //   s.material.uniforms.map.value._pool
      // ) {
      //   s.material.uniforms.map.value._pool.release(
      //     s.material.uniforms.map.value
      //   );
      //   s.material.uniforms.map.value = emptyTexture;
      // }
      // if (s && s.userData._pool) {
      //   s.userData._pool.release(s);
      // }
    },
    update(e) {
      if (!e.has(Tags.Object3D)) return;
      // const object = e.get(Tags.Object3D);
      // if (!object) return;
      // const scalar = object.userData.scalarSize;
      // const spriteWidth = object.userData.spriteWidth;
      // const spriteHeight = object.userData.spriteHeight;
      // let curSize = 1;
      // object.scale.set(
      //   spriteWidth * scalar * curSize,
      //   spriteHeight * scalar * curSize,
      //   1
      // );
      // object.material.uniforms.spin.value = 1 - curSize;
      // object.visible = curSize > 1e-5;
    },
  };

  function nextSprite(e) {
    if (!e.has(Tags.GroundAssetData)) return;

    const sample = e.get(Tags.GroundAsset);
    const cellData = sample.cellEntity.get(Tags.EnvironmentCell);
    const sampleData = e.get(Tags.GroundAssetData);

    const random = cellData.random;

    const instance = sampleData.instance;
    if (!instance) return;
    instance.position.set(sample.x, 0, sample.z);

    const isSprite =
      instance.isMesh && instance.userData.type === "WayfinderSprite";
    const minScale = 0.95;
    const maxScale = 1.05;
    let curScale = MathUtil.clamp(
      Math.abs(sampleData.variance),
      minScale,
      maxScale
    );
    instance.scale.multiplyScalar(curScale);
    sampleData.scale.copy(instance.scale);
    if (isSprite) {
      const isFlip = sampleData.flip && !sampleData.ignoreFlip;
      instance.material.uniforms.flip.value = isFlip ? -1 : 1;
      instance.material.side = isFlip ? THREE.BackSide : THREE.FrontSide;

      let useMapDiscard = false;
      if (typeof sampleData.useMapDiscard === "boolean") {
        useMapDiscard = sampleData.useMapDiscard;
      }
      instance.material.uniforms.useMapDiscard.value = useMapDiscard;

      const aspect = instance.scale.x / instance.scale.y;
      instance.material.uniforms.aspect.value = aspect;
      instance.material.uniforms.spriteHeight.value = instance.scale.y;

      const spriteEntity = instance.userData._entity;
      if (spriteEntity) {
        if (!spriteEntity.has(Tags.ShaderUniformTime)) {
          spriteEntity.add(Tags.ShaderUniformTime);
        }
        const timeUniform = spriteEntity.get(Tags.ShaderUniformTime);
        timeUniform.uniform = instance.material.uniforms.time;
      }
    } else {
      instance.rotation.y = sampleData.rotation;
    }
    // const mesh = instance.clone(true);

    // e.add(Tags.Object3D, object);
    // e.add(Tags.ShadowCaster);
    // e.get(Tags.ShadowCaster).sprite = true;
    // e.add(Tags.ShaderUniformTime);

    // const sprite = sprites.map[sampleData.key];
  }

  function nextSpriteOld(e) {
    if (!e.has(Tags.GroundAssetData)) return;

    const sample = e.get(Tags.GroundAsset);
    const cellData = sample.cellEntity.get(Tags.EnvironmentCell);
    const sampleData = e.get(Tags.GroundAssetData);

    const random = cellData.random;

    const sprite = sprites.map[sampleData.key];
    if (!sprite) {
      console.warn("no sprite for", sampleData.key);
      return;
    }

    const object = spritePool.next();

    const tex = texturePools[sprite.sheetIndex].next();
    shareAtlasTexture(renderer, sprite.atlas, tex);

    object.material.uniforms.map.value = tex;
    object.material.uniforms.repeat.value.copy(sprite.repeat);
    object.material.uniforms.offset.value.copy(sprite.offset);
    // const isFlip = false;
    const isFlip = sampleData.flip && !sampleData.ignoreFlip;
    object.material.uniforms.flip.value = isFlip ? -1 : 1;
    object.material.side = isFlip ? THREE.BackSide : THREE.FrontSide;
    let useMapDiscard = false;
    if (typeof sampleData.useMapDiscard === "boolean") {
      useMapDiscard = sampleData.useMapDiscard;
    }
    object.material.uniforms.useMapDiscard.value = useMapDiscard;
    // object.material.side = THREE.BackSide;

    let spriteHeight = 1;
    let varianceMean = 1;
    let varianceStd = 0.25;
    let minSize = 0.5;
    let maxSize = 12;
    if (sampleData.height != null) spriteHeight = sampleData.height;
    if (sampleData.varianceMean != null) varianceMean = sampleData.varianceMean;
    if (sampleData.varianceStd != null) varianceStd = sampleData.varianceStd;
    if (sampleData.minSize != null) minSize = sampleData.minSize;
    if (sampleData.maxSize != null) maxSize = sampleData.maxSize;

    const variance = varianceMean + sampleData.variance * varianceStd;

    spriteHeight *= variance;
    spriteHeight = MathUtil.clamp(
      spriteHeight,
      minSize,
      Math.min(MAX_HEIGHT, maxSize)
    );
    const aspect = sprite.width / sprite.height;
    const spriteWidth = spriteHeight * aspect;
    object.userData.scalarSize = 1;
    object.userData.spriteName = sprite.name;
    object.userData.spriteWidth = spriteWidth;
    object.userData.spriteHeight = spriteHeight;
    object.position.set(sample.x, 0, sample.z);

    e.add(Tags.Object3D, object);
    e.add(Tags.ShadowCaster);
    e.get(Tags.ShadowCaster).sprite = true;
    e.add(Tags.ShaderUniformTime);

    const timeUniform = e.get(Tags.ShaderUniformTime);
    timeUniform.uniform = object.material.uniforms.time;

    object.material.uniforms.aspect.value = aspect;
    object.material.uniforms.spriteHeight.value = spriteHeight;
  }
}
