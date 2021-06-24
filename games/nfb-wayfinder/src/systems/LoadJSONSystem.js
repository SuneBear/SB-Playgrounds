import * as Tags from "../tags";
import * as THREE from "three";
import deepClone from "deep-clone";
// import scene0 from "../assets/models/scenegrass.jsonw";
// import scene1 from "../assets/models/scene-empty.json";
import { clearGroup, disposeTree, pruneUserData } from "../util/three-util";
import { setMeshToSprite } from "../util/EditorWayfinderSprite";

// import { Assets } from "./AssetLoaderSystem";
import { createMeshMaterial } from "../util/materials";

export default async function LoadJSONSystem(world) {
  const group = new THREE.Group();
  world.entity().add(Tags.Object3D, group);

  // const noiseMap = await world
  //   .findTag(Tags.AssetCache)
  //   .request(Assets.SpriteNoiseMap);

  // let a = true;
  // setInterval(() => {
  //   a = !a;
  //   load(a ? scene0 : scene1);
  // }, 1000);

  // (async () => {
  //   const resp = await fetch(scene0);
  //   const json = await resp.json();
  //   load(json);
  // })();

  // load(testscene);

  return {
    process(dt) {},
    load,
  };

  async function load(json) {
    json = deepClone(json);

    group.traverse((child) => {
      if (child.userData._entity) {
        child.userData._entity.kill();
        delete child.userData._entity;
        pruneUserData(child);
      }
    });
    disposeTree(group, { textures: true });

    const loader = new THREE.ObjectLoader();
    const scene = await new Promise((resolve) => {
      loader.parse(json, resolve);
    });
    scene.traverse((child) => {
      pruneUserData(child);
      if (child.isMesh) {
        const isSprite =
          child.isSprite || child.userData.type === "WayfinderSprite";
        if (isSprite) {
          setMeshToSprite(world, child);
          child.userData._entity = world
            .entity()
            .add(Tags.Object3D, child)
            .add(Tags.ShaderUniformTime, {
              uniform: child.material.uniforms.time,
            })
            .add(Tags.ShadowCaster, { sprite: true });
        } else if (child.material) {
          const map = child.material.map;

          const tag = child.userData ? child.userData.tag : null;
          const ignoreGround = tag
            ? tag.includes("noshadow") || tag.includes("noground")
            : false;
          if (ignoreGround) {
            child.material.alphaTest = 0.5;
            child.material.transparent = true;
          }
          child.material = createMeshMaterial(world, child, {
            map,
            ignoreGround,
          });
          child.userData._entity = world.entity().add(Tags.Object3D, child);
          if (!ignoreGround)
            child.userData._entity.add(Tags.ShadowCaster, { sprite: false });
        }
      }

      // if (
      //   child.isMesh &&
      //   child.material.isMeshBasicMaterial &&
      //   child.userData.type !== "WayfinderSprite"
      // ) {
      //   const map = child.material.map;
      //   child.material = createToonShader(world, child, map);

      //   child.userData._entity = world
      //     .entity()
      //     .add(Tags.Object3D, child)
      //     .add(Tags.ShadowCaster, { sprite: false });
      // }

      // if (child.userData.type === "WayfinderSprite") {
      //   child.userData._entity = world
      //     .entity()
      //     .add(Tags.Object3D, child)
      //     .add(Tags.ShadowCaster, { sprite: true });
      // }
    });
    group.add(scene);
  }
}
