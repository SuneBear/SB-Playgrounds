import * as Tags from "../tags";
import * as THREE from "three";
import ObjectPool from "../util/ObjectPool";
import { detachObject } from "../util/three-util";
import FastPoissonDiskSampling from "fast-2d-poisson-disk-sampling";
import animate from "../util/ease-animate";
import {
  createMeshMaterial,
  createSpriteMaterial,
  getEmptyTexture,
  getSpriteGeometry,
} from "../util/materials";
import { setMeshToSprite, createSprite } from "../util/EditorWayfinderSprite";
import { loadTexture } from "../util/load";
import { tweenFromTo } from "./AnimationSystem";
import Random from "../util/Random";
import Assets from "../util/Assets";
import rightNow from "right-now";
import { linear, sineOut } from "eases";
import { insideWaterPolys } from "../util/water-util";
import queryString from "../util/query-string";
import { shareAtlasTexture } from "../util/three-util";
import SpriteManager from "../util/SpriteManager";

export default function HaikuFloraSystem(world) {
  const haikuInventoryView = world.view(Tags.HaikuInInventory);

  const renderer = world.findTag(Tags.Renderer);

  const random = Random();
  const spriteOpt = { sprite: true };
  const container = new THREE.Group();
  container.name = "haiku-flora";
  world.entity().add(Tags.Object3D, container);

  let spriteSheet;
  let types;
  SpriteManager("spritesheets/ground-flowers", renderer).then((sheet) => {
    spriteSheet = sheet;
    types = {
      forest: ["flower-05", "flower-04", "flower-01"].map((f) =>
        spriteSheet.frames.find((frame) => frame.name === f)
      ),
      grasslands: ["grasslands1", "grasslands2", "grasslands3"].map((f) =>
        spriteSheet.frames.find((frame) => frame.name === f)
      ),
      tundra: ["tundra1", "tundra3", "tundra2"].map((f) =>
        spriteSheet.frames.find((frame) => frame.name === f)
      ),
      grasslandsWater: spriteSheet.frames.filter((frame) =>
        /lily/i.test(frame.name)
      ),
    };
  });

  const scales = {
    forest: 1,
    grasslands: 1,
    tundra: 1,
  };

  const tmpPos = new THREE.Vector3();
  const tmpArr2D = [0, 0];

  // const textures = ids.map((id) => {
  //   const [tex] = Assets.createGPUTextureTask(renderer, id);
  //   return tex;
  // });

  const char = world.findTag(Tags.UserCharacter);
  const assetView = world.view(Tags.SpawnedFlora);
  let lastPosition = new THREE.Vector3();
  let hasLastPosition = false;

  const pool = new ObjectPool({
    maxCapacity: 100,
    create() {
      // const sprite = createSprite(world, getEmptyTexture(), 1);
      const sprite = new THREE.Mesh(
        getSpriteGeometry(),
        createSpriteMaterial(world)
      );
      sprite.material.userData.flipX = random.boolean();
      setMeshToSprite(world, sprite, 1);
      sprite.userData._entity = null;
      // sprite.scale.y = 0;
      return sprite;
    },
  });

  let time = 0;
  const getNewDelay = () => random.range(0.1, 0.2);
  let delay = getNewDelay();
  let readyToSpawn = false;
  let hasMovedFarEnough = false;
  const threshold = 1;
  const thresholdSq = threshold * threshold;
  const activeEnv = world.view(Tags.ActiveEnvironmentState);

  const papers = world.view([Tags.FloatingToken, Tags.FloatingTokenTargetUser]);
  const centerLength = 10;
  const centerLengthSq = centerLength * centerLength;

  const finalResolution = world.listen(Tags.FinalBiomeResolution);
  const finalResolutionView = world.view(Tags.FinalBiomeResolution);
  const tmpVec2D = new THREE.Vector2();
  const radius = 3;
  const size = 25;
  // const samples = new FastPoissonDiskSampling(
  //   {
  //     shape: [size, size],
  //     tries: 10,
  //     radius,
  //   },
  //   random.value
  // );
  let doFill = true;

  return (dt) => {
    const activeLine = world.findTag(Tags.WrittenStanzaLineActive);
    const state = activeEnv.length
      ? activeEnv[0].get(Tags.EnvironmentState)
      : null;

    if (!state) return;

    const isResolving = finalResolutionView.length > 0;

    let target;
    let targetIndex;
    if (papers.length && !isResolving) {
      target = random.pick(papers).get(Tags.FloatingToken);
    }

    if (finalResolution.added.length > 0) {
      if (doFill) {
        doFill = false;
        // const p = samples.fill();
        pool.maxCapacity = Infinity;

        for (let i = 0; i < 150; i++) {
          const angle =
            (-60 * Math.PI) / 180 +
            random.range(0, (300 * Math.PI) / 180) +
            random.gaussian(0, (1 * Math.PI) / 180);
          const u = Math.cos(angle);
          const v = Math.sin(angle);
          const rd = 6 + Math.abs(random.gaussian(0, 3));
          const x = u * rd;
          const y = v * rd;

          const len = Math.sqrt(x * x + y * y);
          // if (len > size * 0.5) return;
          // if (len > size * 0.4 && random.gaussian() > 0) return;

          const delay = 3.5 + (len / (size / 2)) * 2 + random.range(0, 1);
          spawn(tmpVec2D.set(x, y), "grasslands", false, false, delay, 0);

          // const m = new THREE.Mesh(
          //   new THREE.BoxGeometry(1, 1, 1),
          //   new THREE.MeshBasicMaterial({ color: "red" })
          // );
          // m.position.set(x, 0, y);
          // world.entity().add(Tags.Object3D, m);
        }
      }
    }

    if (target && haikuInventoryView.length > 0 && !activeLine) {
      time += dt;

      if (time >= delay) {
        time %= delay;
        delay = getNewDelay();
        readyToSpawn = true;
      }

      if (hasLastPosition) {
        let dx = target.position2D.x - lastPosition.x;
        let dz = target.position2D.y - lastPosition.z;
        let dstSq = dx * dx + dz * dz;
        if (dstSq >= thresholdSq) {
          hasMovedFarEnough = true;
        }
      }

      if (
        readyToSpawn &&
        (hasMovedFarEnough || !hasLastPosition) &&
        target.position2D.lengthSq() > centerLengthSq
      ) {
        target.position2D.toArray(tmpArr2D);
        const insideWater = state ? insideWaterPolys(state, tmpArr2D) : false;
        hasMovedFarEnough = false;
        readyToSpawn = false;
        // const count =
        //   insideWater || state.name === "grasslands"
        //     ? 1
        //     : random.rangeFloor(1, 5);

        const count = papers.length;
        for (let i = 0; i < count; i++)
          spawn(target.position2D, state.name, insideWater);

        lastPosition.x = target.position2D.x;
        lastPosition.y = 0;
        lastPosition.z = target.position2D.y;
        hasLastPosition = true;
      }
    }

    const biomeScale = 1;

    for (let i = 0; i < assetView.length; i++) {
      const e = assetView[i];
      const flora = e.get(Tags.SpawnedFlora);
      flora.time += dt;
      const curTime = Math.max(0, flora.time - flora.delay);
      const t = animate(
        flora.time,
        flora.duration,
        flora.delay,
        flora.animateDuration,
        sineOut
      );
      const obj = e.get(Tags.Object3D);
      const height = flora.height * t;
      obj.scale.y = height * biomeScale;
      obj.scale.x = height * flora.aspect * biomeScale;
      obj.visible = obj.scale.x >= 1e-5;
      if (isFinite(flora.duration) && curTime >= flora.duration) {
        detachObject(obj);
        e.kill();
        obj.userData._entity = null;
        pool.release(obj);
      }
    }
  };

  // function killOldest

  function spawn(pos, stateName, inWater, autoKill = true, delay = 0, rad = 1) {
    // const tex = random.pick(textures);
    // if (haikuInventoryView.length === 1) {
    // return;
    // }

    if (!types) return; // not yet loaded
    if (inWater && stateName !== "grasslands") return;

    let mesh = pool.next();

    if (!mesh) {
      return;
      // killOldest;
    }

    // const x = pos.x;
    // const z = pos.z;
    mesh.userData._entity = world.entity();
    // mesh.position.set(x, 0, z);

    const len = Math.abs(random.gaussian(0, 1));
    // tmpPos.copy(char.position).addScaledVector(char.direction, -1 * len);
    tmpPos.set(pos.x, 0, pos.y);

    random.onCircle(random.gaussian(2, 0.35) * rad, tmpArr2D);
    mesh.position.x = tmpArr2D[0] + tmpPos.x;
    mesh.position.z = tmpArr2D[1] + tmpPos.z;
    mesh.position.y = inWater ? 0.05 : 0;
    // mesh.material.uniforms.flipX.value = random.boolean();

    container.add(mesh);

    mesh.userData._entity
      .add(Tags.Object3D, mesh)
      .add(Tags.SpawnedFlora)
      .add(Tags.ShaderUniformTime, {
        uniform: mesh.material.uniforms.time,
      });

    if (!inWater) mesh.userData._entity.add(Tags.ShadowCaster, spriteOpt);

    const flora = mesh.userData._entity.get(Tags.SpawnedFlora);
    const scalar = inWater ? 0.35 : stateName === "grasslands" ? 1.1 : 1;
    const height = Math.min(1.25, random.gaussian(0.85, 0.5)) * scalar;
    // mesh.material.uniforms.map.value = tex;
    mesh.visible = false;

    // const aspect = tex.image.width / tex.image.height;
    flora.height = height;
    // flora.aspect = aspect;

    let frame;
    if (stateName === "grasslands" && inWater) {
      frame = random.pick(inWater ? types.grasslandsWater : types[stateName]);
    } else {
      const typeArray = types[stateName];
      const N = random.rangeFloor(Math.min(typeArray.length, papers.length));
      frame = typeArray[N];
    }

    mesh.material.uniforms.map.value = frame.texture;
    shareAtlasTexture(renderer, spriteSheet.atlases[0], frame.texture);
    mesh.material.uniforms.offset.value.copy(frame.offset);
    mesh.material.uniforms.repeat.value.copy(frame.repeat);
    const aspect = frame.width / frame.height;

    flora.aspect = aspect;
    flora.delay = delay;
    flora.duration = autoKill ? random.range(2, 5) : Infinity;
    flora.spawnTime = rightNow();
  }
}
