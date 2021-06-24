import * as Tags from "../tags";
import * as THREE from "three";

import createGroundPatchPool from "./environment/createGroundPatchPool";
import waitForSingleton from "../util/waitForSingleton";
import createTilingGrid from "../util/createTilingGrid";
import { detachObject } from "../util/three-util";
import { loadTexture } from "../util/load";
import { tweenFromTo, tweenTo } from "./AnimationSystem";

import SpriteManager from "../util/SpriteManager";
import Assets from "../util/Assets";
import { getEmptyTexture } from "../util/materials";

export default async function EnvironmentGrassSystem(world) {
  const renderer = world.findTag(Tags.Renderer);

  const sprites = await SpriteManager(
    "spritesheets/temp_grass_sprites",
    renderer
  );

  // sprites.atlases.forEach((atlas) => {
  //   atlas.anisotropy = 4;
  // });

  const grassEditableEntity = world.entity().add(Tags.GrassEditableData);
  const groundView = world.findTag(Tags.GroundPlaneView);
  const grassPatchView = world.view(Tags.GroundPatchInstance);
  const activeState = world.view([
    Tags.EnvironmentState,
    Tags.ActiveEnvironmentState,
  ]);

  let grid;
  let grass;

  let envVersion = null;
  let lastEnv = null;
  const emptyTex = getEmptyTexture();
  setup();

  return function envGrassSytem(dt) {
    const world0TweenTag = world.findTag(Tags.WorldTweens);
    let world0Tween = 0;
    if (world0TweenTag) {
      world0Tween = world0TweenTag[0];
    }

    let currentEnvironmentState;
    if (activeState.length) {
      currentEnvironmentState = activeState[0].get(Tags.EnvironmentState);
    }

    if (lastEnv !== currentEnvironmentState) {
      lastEnv = currentEnvironmentState;
      grass.setPrefix(
        currentEnvironmentState ? currentEnvironmentState.name : ""
      );
    }

    const data = grassEditableEntity.get(Tags.GrassEditableData);
    const useSpriteAtlas = !data.useCustomGrass;
    const editScale = data.grassScale;
    const curMap = useSpriteAtlas ? sprites.atlases[0] : data.customGrassMap;

    grassPatchView.forEach((e) => {
      const mesh = e.get(Tags.GroundPatchInstance);
      const t = 1 - world0Tween;
      let size = mesh.userData.globalSpriteScale;

      if (currentEnvironmentState) {
        size *= currentEnvironmentState.grassScale;
        mesh.material.uniforms.grassTipFactor.value =
          currentEnvironmentState.grassTipFactor;
        mesh.material.uniforms.worldMapSize.value.set(
          currentEnvironmentState.data.width,
          currentEnvironmentState.data.height
        );
        mesh.material.uniforms.waterMap.value =
          currentEnvironmentState.waterMap;
        mesh.geometry.setCount(currentEnvironmentState.grassInstanceCount);
      }

      mesh.material.uniforms.globalSpriteScale.value = editScale * t * size;
      mesh.material.uniforms.useSpriteAtlas.value = useSpriteAtlas;
      mesh.material.uniforms.map.value = curMap;
      if (!useSpriteAtlas) {
        const map = mesh.material.uniforms.map.value;
        if (map && map.image && map.image.height !== 0) {
          mesh.material.uniforms.spriteMapAspect.value =
            map.image.width / map.image.height;
        }
      }
    });

    const camera = world.findTag(Tags.MainCamera);
    const position = world.findTag(Tags.UserTarget).position;
    grid.update(camera, position);
  };

  function setup() {
    const size = 40;
    grass = createGroundPatchPool(world, {
      sprites,
      groundMap: groundView.target.texture,
      groundProjectionMatrix: groundView.projectionMatrix,
      samples: {
        size,
      },
      initialCapacity: 9,
    });
    grid = createTilingGrid({
      size,
      maxCells: 9,
      initialCapacity: 9,
      tileHeight: 2.5,
      populateTile: (group, tile) => {
        const mesh = grass.next();
        group.add(mesh);
        group.userData.grass = mesh;
        // group.userData.box = new THREE.BoxHelper(group);
        // group.add(group.userData.box);
        // const e = world.entity().add(Tags.Object3D, group.userData.box);
        // group.userData.boxEntity = e;
      },
      releaseTile: (group, tile) => {
        // if (group.userData.box) {
        //   group.userData.box.geometry.dispose();
        //   group.userData.box = null;
        // }
        // if (group.userData.boxEntity) {
        //   group.userData.boxEntity.kill();
        // }
        if (group.userData.grass) {
          grass.release(group.userData.grass);
          group.userData.grass = null;
        }
        detachObject(group);
      },
    });
    world.entity().add(Tags.Object3D, grid.group);
  }
}
