import SimplexNoise from "simplex-noise";

import * as Tags from "../../tags";
import { Data, Types } from "../../tags";
import * as THREE from "three";
import Random from "../../util/Random";
import SpriteAnimation from "../../util/SpriteAnimation";

import flyingSpriteURL from "../../assets/spritesheets/butterfly.png";
import flyingSheetData from "../../assets/spritesheets/butterfly.sheet";
import { TextureLoader } from "three";
import { mapRange } from "canvas-sketch-util/math";
import * as MathUtil from "../../util/math";

import { createSprite, setSpriteFlip } from "../../util/EditorWayfinderSprite";

const NOOP = () => {};
const texLoader = new TextureLoader();

const V3 = new THREE.Vector3();
const V3A = new THREE.Vector3();
const V3B = new THREE.Vector3();

let tintColor = new THREE.Color("hsl(50, 100%, 100%)");
/*

A simple system that shows off the basic ECS approach.
Each interval, a square emits from the character and floats up,
until it dies away.

*/

// enum ButterflyStates {
//   IDLE,
//   FLYING
// }

// class

// Set up a new tag/data/value
// Usually this would be in "tags.js" but you can also just
// keep it entirely within your system if you want
class Butterfly extends Data {
  static data = {
    time: Types.Ref(0),
    animateInDuration: Types.Ref(0.25),

    // kill after N seconds if still out of frame
    duration: Types.Ref(5),
    outOfScreenElapsed: Types.Ref(0),
    outOfScreenLimit: Types.Ref(5),

    size: Types.Ref(0.65),
    state: Types.Ref("flying"), // idle || flying
    flyingAnimation: Types.Ref(null),
    velocity: Types.Vector3(0, 0, 0),

    // flip?
    left: Types.Ref(false),

    // origin position
    restPosition: Types.Vector3(0, 0, 0),

    // target
    tgtPosition: Types.Vector3(0, 0, 0),
    tgtAngle: Types.Ref(0),
    tgtSpeed: Types.Ref(0),
    tgtAngleRadius: Types.Ref(0),

    // flee
    fleeThreshold: Types.Ref(0),
    followSpeed: Types.Ref(0),

    inRadiusElapsed: Types.Ref(0),

    // can get annoyed
    canGetAnnoyed: Types.Ref(false),
    isAnnoyed: Types.Ref(false),
    annoyedElapsed: Types.Ref(0),
  };
}

// Systems are functions that accept a 'world' fragment
// make sure you name this function when you create a new system
export default async function ButterflySystem(world) {
  const tmpBox = new THREE.Box3();

  const geometry = new THREE.PlaneBufferGeometry(1, 1);

  const flyingTexture = await loadTexture(flyingSpriteURL);

  const random = Random();
  const noise = new SimplexNoise(random.value);

  // query a view of the particles
  const view = world.view([Tags.Object3D, Butterfly]);

  // we can also listen for events
  // these aren't callbacks (which happen immediately) but deferred until
  // this tick, so that everything still happens in a linear way in order of system execution
  const events = world.listen(Butterfly);

  const pos = new THREE.Vector3(-10, 0, -10);

  const spawnEvents = world.listen(Tags.AnimalSpawn);
  const maxButterflies = 25;

  const audioEntity = world.entity();
  const activeEnvEvents = world.listen(Tags.ActiveEnvironmentState);

  // the return value of a system is a function that
  // is called on each tick
  return (dt) => {
    if (activeEnvEvents.changed) {
      view.forEach((e) => e.kill());
    }

    spawnEvents.added.forEach((e) => {
      const s = e.get(Tags.AnimalSpawn);
      if (
        view.length < maxButterflies &&
        s.biome === "grasslands" &&
        s.animal === "butterfly" &&
        !s.lake
      ) {
        spawn(s.position);
        // finally 'consume' the event by killing it so that other systems
        // won't spawn an animal here
        e.kill();
      }
    });

    const frustum = world.findTag(Tags.MainCameraFrustum);

    // console.log(view[0])
    // anim.update(dt)

    const user = world.findTag(Tags.UserCharacter);
    const userPosition = user.position;

    // A list of matching entities that have been added since last frame
    // events.added.forEach((e) => {
    //   // for example, you could 'init' a mesh now that you know
    //   // it's about to be rendered
    //   // console.log("Box initialized");
    // });

    // Update all currenly active entities
    // a view is an array reference into a list of
    // Entities that match your query, and they are updated
    // once before each tick of this system
    const restPosThreshold = 4;
    const restPosThresholdSq = restPosThreshold * restPosThreshold;
    let userNearButterflies = false;

    view.forEach((e) => {
      const mesh = e.get(Tags.Object3D);
      const data = e.get(Butterfly);

      data.time += dt;

      const distToUser = mesh.position.distanceTo(userPosition);
      const distUserToRestposSq =
        data.restPosition.distanceToSquared(userPosition);
      if (distToUser <= restPosThreshold) {
        userNearButterflies = true;
      }

      if (distUserToRestposSq <= restPosThresholdSq) {
        data.inRadiusElapsed += dt;
      } else {
        data.inRadiusElapsed *= 0.5;
      }

      if (
        data.inRadiusElapsed >= 1 &&
        data.canGetAnnoyed &&
        !data.isAnnoyed &&
        distUserToRestposSq <= restPosThresholdSq
      ) {
        data.isAnnoyed = true;
      }

      if (data.isAnnoyed && distUserToRestposSq > restPosThresholdSq) {
        data.annoyedElapsed += dt;
        if (data.annoyedElapsed > 2) {
          data.isAnnoyed = false;
          data.annoyedElapsed = 0;
        }
      }

      // update current animation
      const fleethresh = data.fleeThreshold;
      let animSpeed = mapRange(distToUser / fleethresh, 0, fleethresh, 5, 1);
      animSpeed = Math.max(1, animSpeed);

      data.angle += data.angleSpeed * dt;

      data.tgtPosition.x =
        data.restPosition.x + Math.cos(data.angle) * data.angleRadius;
      data.tgtPosition.z =
        data.restPosition.z + Math.sin(data.angle) * data.angleRadius;
      // mesh.position.x += pertub * .05

      if (data.isAnnoyed) {
        data.tgtPosition.x =
          userPosition.x + Math.cos(data.angle) * data.angleRadius;
        data.tgtPosition.z =
          userPosition.z + Math.sin(data.angle) * data.angleRadius;
      }

      // set scale
      // size to animate it in
      const t = MathUtil.clamp01(data.time / data.animateInDuration);
      mesh.scale.setScalar(t * data.size);

      // ----- follow target
      V3.copy(data.tgtPosition);
      V3.sub(mesh.position);
      //
      // V3.normalize();
      // V3.multiplyScalar(0.1 * data.followSpeed);

      const v3len = Math.min(6, V3.length());
      V3.normalize();
      V3.multiplyScalar(v3len * 0.01 * data.followSpeed);
      // if (data.isAnnoyed) {
      //   V3.multiplyScalar(0.01 * data.followSpeed);
      // } else {
      // }

      // ----- flee character
      const thresh = data.fleeThreshold;
      let force = mapRange(distToUser / thresh, 0, thresh, 0.15, 0);
      force = Math.max(0, Math.min(0.08, force));
      V3A.copy(mesh.position);
      V3A.sub(userPosition);
      V3A.normalize();
      V3A.multiplyScalar(force);
      V3.add(V3A);

      // update position
      mesh.position.add(V3);
      mesh.position.y = 1 + Math.sin(data.time * data.angleSpeed) * 0.4;

      setSpriteFlip(mesh, data.left);

      // if (data.state == 'flying') {
      if (data.time >= data.duration) {
        tmpBox.setFromObject(mesh);
        if (!frustum.intersectsBox(tmpBox)) {
          data.outOfScreenElapsed += dt;
          if (data.outOfScreenElapsed > data.outOfScreenLimit) {
            // kill the bird once it's out of frame
            e.kill();
          }
        }
      }
      // }
    });

    if (userNearButterflies) {
      if (!audioEntity.has(Tags.AnimalSound))
        audioEntity.add(Tags.AnimalSound, "butterfly");
    } else {
      audioEntity.tagOff(Tags.AnimalSound);
    }
    // This is a list of entities that are waiting to be removed
    // events.removing.forEach((e) => {
    //   // for example, you could dispose of things here
    //   // like geometry/textures if needed
    // });
  };

  function spawn(position) {
    const nb = random.rangeFloor(3, 8);
    const hueDeg = random.pick([0, 30, 50, 330]);
    const hue = hueDeg / 360;
    const baseSat = hueDeg === 330 ? 0.5 : 0.75;
    const baseLight = 0.5;

    for (let i = 0; i < nb; i++) {
      const sprite = createSprite(world, new THREE.Texture());
      sprite.position.set(position.x, 0, position.z);
      const e = world
        .entity()
        .add(Tags.Object3D, sprite)
        .add(Tags.ShaderUniformTime, {
          uniform: sprite.material.uniforms.time,
        })
        .add(Tags.ShadowCaster, { sprite: true })
        .add(Tags.Animal)
        .add(Butterfly);

      //
      // data
      //
      const butterfly = e.get(Butterfly);
      butterfly.left = i % 2 == 0;
      butterfly.state = "flying";
      setSpriteFlip(sprite, butterfly.left);

      const angle = random.range(0, Math.PI * 2);
      butterfly.angle = angle;

      butterfly.angleSpeed = random.range(-2, 2);
      butterfly.angleRadius = random.range(0.3, 1);

      // restPosition
      const radius = random.range(0.8, 1.2);
      butterfly.restPosition.y = 1;
      butterfly.restPosition.x -= random.range(-radius, radius);
      butterfly.restPosition.z -= random.range(-radius, radius);
      butterfly.restPosition.add(position);
      butterfly.tgtPosition.x = 0;
      butterfly.tgtPosition.y = 1;
      butterfly.tgtPosition.z = 0;
      butterfly.tgtPosition.add(position);

      // flee
      butterfly.fleeThreshold = random.range(1.5, 2);
      butterfly.followSpeed = random.range(1, 2);

      // scale
      const scl = random.range(0.4, 0.65);
      butterfly.size = scl;
      sprite.scale.x = scl;
      sprite.scale.y = scl;

      // Add sprite animation to it
      e.add(Tags.SpriteAnimation);
      const anim = e.get(Tags.SpriteAnimation);
      anim.looping = true;

      // tint
      const mesh = e.get(Tags.Object3D);
      const hueVariation = random.range(-20, 20) / 360;
      const lVariation = random.range(0, 0.1);

      tintColor.setHSL(
        MathUtil.mod(hue + hueVariation, 1),
        baseSat,
        baseLight + lVariation
      );
      mesh.material.uniforms.tintColor.value.copy(tintColor);
      // mesh.material.needsUpdate = true;

      // can get annoyed
      butterfly.canGetAnnoyed = random.chance(0.5);

      // Lazily load sprite sheet based on when it's first added to scene
      e.add(Tags.SpriteAnimationLazyLoadSheet);
      const lazy = e.get(Tags.SpriteAnimationLazyLoadSheet);
      lazy.id = "spritesheets/butterfly";
    }
  }

  function resetEntity(e) {}

  async function loadTexture(url) {
    return new Promise((resolve, reject) => {
      texLoader.load(
        url,
        // ok
        (texture) => {
          resolve(texture);
        },
        // progress
        NOOP,
        // ko
        (evt) => {
          reject(evt);
        }
      );
    });
  }
}
