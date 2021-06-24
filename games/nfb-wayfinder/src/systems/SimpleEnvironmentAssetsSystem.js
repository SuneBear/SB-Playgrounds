import * as Tags from "../tags";
import * as THREE from "three";
import AssetSprites from "./environment/AssetSprites";
import { addSampleData } from "./environment/asset-types";
import { detachObject } from "../util/three-util";
import { tweenFromTo } from "./AnimationSystem";
import * as MathUtil from "../util/math";
import Random from "../util/Random";
// import { AssetGLTFs } from "./environment/AssetGLTFs";
// const classes = ["rock", "tree", "branch", "stump"];

const _box = new THREE.Box3();
const worldScale = new THREE.Vector3();

function patchSpriteBox3(box, sprite) {
  sprite.getWorldScale(worldScale);
  const scaleY = worldScale.y;
  box.max.y += scaleY * 0.4; // more as it's not axis-aligned but camera-aligned
  // box.min.z -= 1; // more for shadow
  // box.max.z += 1; // more for shadow
  box.min.x -= 2; // more for shadow
  box.max.x += 0; // more for some edge ../
}

export default async function SimpleEnvironmentAssetsSystem(world) {
  const sprites = await AssetSprites(world);
  // const gltfs = AssetGLTFs(world);
  let gltfs;
  const container = new THREE.Group();
  container.name = "assets";

  world.entity().add(Tags.Object3D, container);

  const cellView = world.view(Tags.EnvironmentCell);
  const cellEvents = world.listen(Tags.EnvironmentCell);
  const frustum = world.findTag(Tags.MainCameraFrustum);
  const groundAssetEvents = world.listen([
    Tags.GroundAsset,
    Tags.GroundAssetData,
  ]);
  const groundAssetView = world.view([Tags.GroundAsset, Tags.GroundAssetData]);
  const groundAssetAllView = world.view([
    Tags.GroundAsset,
    Tags.GroundAssetData,
    Tags.Object3D,
  ]);

  const includeGLTF = Boolean(gltfs);
  // const geom = new THREE.SphereGeometry(1, 16, 16);
  const tmp2D = new THREE.Vector2();
  const tmpBox = new THREE.Box3();

  const itemsMap = world.findTag(Tags.GLTFSpawnItemsMap);
  // const helpers = world.view([Tags.BoxHelper, Tags.Object3D]);

  const sysRandom = Random();
  // let globalAssetTween = { scale: 1 };
  const barrenGroundEvents = world.listen(Tags.TutorialBarrenGround);
  const finalBiomeEvents = world.listen(Tags.FinalBiomeResolution);
  const barrenGroundView = world.view(Tags.TutorialBarrenGround);
  const activeEnvChanged = world.listen(Tags.ActiveEnvironmentState);

  let time = 0;
  return function envAssetSystem(dt) {
    if (activeEnvChanged.changed) {
      // cellView.forEach((e) => e.kill());
      // groundAssetView.forEach((e) => e.kill());
    }

    time += dt;
    for (let j = 0; j < cellEvents.added.length; j++) {
      const e = cellEvents.added[j];
      const c = e.get(Tags.EnvironmentCell);
      const cell = c.cell;
      const random = c.random;
      const colorData =
        c.environmentState.colors[
          cell.colorIndex % c.environmentState.colors.length
        ];

      const cellClass = colorData ? colorData.name : null;
      c.children.length = 0;
      // if (true) {
      //   //hasCellClass(cellClass)
      for (let i = 0; i < cell.samples.length; i++) {
        const idx = cell.samples[i];
        const assetEntity = world.entity().add(Tags.GroundAsset);
        const t = assetEntity.get(Tags.GroundAsset);
        const pos = c.environmentState.samples[idx];
        t.x = pos[0];
        t.z = pos[1];
        t.cellEntity = e;
        const child = addSampleData(
          container,
          itemsMap,
          assetEntity,
          cellClass,
          random
        );
        if (child) {
          // container.add(child);
          assetEntity.add(Tags.Object3D, child);
        }
        c.children.push(assetEntity);
      }

      for (let i = 0; i < cell.waterSamples.length; i++) {
        const idx = cell.waterSamples[i];
        const assetEntity = world.entity().add(Tags.GroundAsset);
        const t = assetEntity.get(Tags.GroundAsset);
        const pos = c.environmentState.waterSamples[idx];
        t.x = pos[0];
        t.z = pos[1];
        t.cellEntity = e;
        if (random.chance(0.5)) {
          const child = addSampleData(
            container,
            itemsMap,
            assetEntity,
            c.environmentState.waterId,
            random
          );
          if (child) {
            // container.add(child);
            assetEntity.add(Tags.Object3D, child);
          }
        } else {
          assetEntity.add(Tags.WaterFishPlaceholderTag);
        }
        c.children.push(assetEntity);
      }

      // } else {
      //   c.children.length = 0;
      //   if (colorData) console.log(`no data for ${colorData.name}`);
      //   else console.log(`no color data for ${cell.colorIndex}`);
      // }

      for (let i = 0; i < cell.tokens.length; i++) {
        const idx = cell.tokens[i];
        const assetEntity = world
          .entity()
          .add(Tags.GroundAsset)
          .add(Tags.GroundAssetData)
          .add(Tags.GroundAssetToken);
        assetEntity.get(Tags.GroundAssetData).type = "token";

        const token = c.environmentState.tokens[idx];
        const tokenData = assetEntity.get(Tags.GroundAssetToken);
        tokenData.type = token.type;

        const t = assetEntity.get(Tags.GroundAsset);
        t.x = token.position[0];
        t.z = token.position[1];
        t.cellEntity = e;
        c.children.push(assetEntity);
      }

      // cell.patches.forEach((idx) => {
      //   const assetEntity = world.entity().add(Tags.GroundAsset);
      //   assetEntity.add(Tags.GroundAssetData);
      //   assetEntity.get(Tags.GroundAssetData).type = "patch";

      //   const patch = c.environmentState.patches[idx];
      //   // assetEntity.add(Tags.GLTFRefAsset);
      //   // const ref = assetEntity.get(Tags.GLTFRefAsset);
      //   // ref.position[0] = patch.position[0];
      //   // ref.position[1] = patch.position[1];
      //   // ref.name = patch.name;
      //   // ref.biome = c.environmentState.name;

      // const pos = patch.position;
      // const t = assetEntity.get(Tags.GroundAsset);
      // t.x = pos[0];
      // t.z = pos[1];
      // t.cellEntity = e;
      // c.children.push(assetEntity);
      // });
    }

    for (let i = 0; i < groundAssetEvents.added.length; i++) {
      const e = groundAssetEvents.added[i];
      const t = e.get(Tags.GroundAsset);
      const d = e.get(Tags.GroundAssetData);
      const c = t.cellEntity.get(Tags.EnvironmentCell);

      if (barrenGroundView.length > 0) {
        d.sizeFactor = 0;
      }
      // const box = new THREE.BoxHelper();
      // e.add(Tags.BoxHelper, {
      //   box,
      //   entity: world.entity().add(Tags.Object3D, box),
      // });

      if (d.type === "sprite") sprites.next(e);
    }

    // const camera = world.findTag(Tags.MainCamera);
    // const upX = camera.matrixWorldInverse.elements[4];
    // const upY = camera.matrixWorldInverse.elements[5];
    // const upZ = camera.matrixWorldInverse.elements[6];

    // const rightX = camera.matrixWorldInverse.elements[0];
    // const rightY = camera.matrixWorldInverse.elements[1];
    // const rightZ = camera.matrixWorldInverse.elements[2];

    // const camUpWorld = new THREE.Vector3(upX, upY, upZ);
    // const camRightWorld = new THREE.Vector3(rightX, rightY, rightZ);

    for (let i = 0; i < groundAssetAllView.length; i++) {
      const e = groundAssetAllView[i];
      const t = e.get(Tags.GroundAsset);
      const d = e.get(Tags.GroundAssetData);

      // can't frustum test patches as they might not be
      // loaded yet...
      if (d.type !== "patch") {
        const obj = e.get(Tags.Object3D);
        tmpBox.setFromObject(obj);
        if (d.type === "sprite") {
          patchSpriteBox3(tmpBox, obj);
        }

        const visible = frustum.intersectsBox(tmpBox);
        const curVisible = e.has(Tags.GroundAssetInsideFrustum);
        if (curVisible !== visible) {
          if (visible && !curVisible) {
            e.add(Tags.GroundAssetInsideFrustum);
          } else if (!visible && curVisible) {
            e.remove(Tags.GroundAssetInsideFrustum);
          }
        }
      }
    }

    if (finalBiomeEvents.changed) {
      if (finalBiomeEvents.added.length > 0) {
        groundAssetView.forEach((e) => {
          const d = e.get(Tags.GroundAssetData);
          if (d.type !== "token" && d.type !== "patch" && d.sizeFactor > 0) {
            const sample = e.get(Tags.GroundAsset);
            const delayOff = MathUtil.clamp01(
              tmp2D.set(sample.x, sample.z).length() / 50
            );
            const delay = delayOff * 1 + sysRandom.range(0, 0.5);
            const tweenEntity = tweenFromTo(
              world,
              d,
              "sizeFactor",
              d.sizeFactor,
              0,
              1,
              "sineOut",
              delay
            );
          }
        });
      } else if (finalBiomeEvents.removing.length > 0) {
        groundAssetView.forEach((e) => {
          const d = e.get(Tags.GroundAssetData);
          if (d.type !== "token" && d.type !== "patch" && d.sizeFactor > 0) {
            d.sizeFactor = 1;
          }
        });
      }
    }

    if (barrenGroundEvents.changed) {
      if (barrenGroundEvents.added.length > 0) {
        groundAssetView.forEach((e) => {
          e.get(Tags.GroundAssetData).sizeFactor = 0;
        });
      } else if (barrenGroundEvents.removing.length > 0) {
        groundAssetView.forEach((e) => {
          const d = e.get(Tags.GroundAssetData);
          if (d.type !== "token" && d.type !== "patch" && d.sizeFactor <= 0) {
            const sample = e.get(Tags.GroundAsset);
            const delayOff = MathUtil.clamp01(
              tmp2D.set(sample.x, sample.z).length() / 50
            );
            const delay = delayOff * 1 + sysRandom.range(0, 0.5);
            const tweenEntity = tweenFromTo(
              world,
              d,
              "sizeFactor",
              0,
              1,
              1,
              "sineOut",
              delay
            );
          }
        });
      }
    }
    for (let i = 0; i < groundAssetView.length; i++) {
      const e = groundAssetView[i];
      const d = e.get(Tags.GroundAssetData);
      if (d.type === "sprite") {
        sprites.update(e);
      }
      if (d.type !== "token" && d.type !== "patch") {
        const t = d.sizeFactor; // Math.sin(time) * 0.5 + 0.5;
        const instance = d.instance;
        if (instance && instance.material && instance.material.uniforms.spin) {
          instance.material.uniforms.spin.value = 1 - t;
        }
        instance.scale.copy(d.scale).multiplyScalar(t);
      }

      // only do this for non-patches at the moment
      // NOTE: This only really happens for tokens as
      // sprite/3D ground assets don't have Object3D on their entity
      // (a single ground asset might be multiple Object3Ds)
      if (d.type !== "patch" && e.has(Tags.Object3D)) {
        const obj = e.get(Tags.Object3D);
        obj.visible = e.has(Tags.GroundAssetInsideFrustum);
      }
    }
    for (let i = 0; i < groundAssetEvents.removing.length; i++) {
      const e = groundAssetEvents.removing[i];
      const d = e.get(Tags.GroundAssetData);
      if (d.type === "sprite") sprites.release(e);
    }
    for (let i = 0; i < cellEvents.removing.length; i++) {
      const e = cellEvents.removing[i];
      const c = e.get(Tags.EnvironmentCell);
      c.children.forEach((child) => {
        if (child.alive) {
          if (child.has(Tags.Object3D)) {
            const e = child.get(Tags.Object3D);
            detachObject(e);
          }
          child.kill();
        }
      });
      c.children.length = 0;
    }
  };
}

function chooseAssetClass(cell, random) {}
