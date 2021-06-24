import * as MathUtil from "../../util/math";
import * as Tags from "../../tags";
import { Data, Types } from "../../tags";
import * as THREE from "three";
import Random from "../../util/Random";

import { insideWaterPolys } from "../../util/water-util";

import { TextureLoader } from "three";
import { mapRange, clamp } from "canvas-sketch-util/math";

import { createSprite, setSpriteFlip } from "../../util/EditorWayfinderSprite";

const VA = new THREE.Vector3();

const NOOP = () => {};
const texLoader = new TextureLoader();

const tintColor = new THREE.Color("#ffffff");

/*

A simple system that shows off the basic ECS approach.
Each interval, a square emits from the character and floats up,
until it dies away.

*/

// enum JumpingRabbitStates {
//   IDLE,
//   FLYING
// }

// Set up a new tag/data/value
// Usually this would be in "tags.js" but you can also just
// keep it entirely within your system if you want
class JumpingRabbit extends Data {
  static data = {
    time: Types.Ref(0),
    size: Types.Ref(2.5),
    animateInDuration: Types.Ref(0.25),
    duration: Types.Ref(10),
    speed: Types.Ref(7),
    left: Types.Ref(true),
    newLeft: Types.Ref(null),
    state: Types.Ref("idle"), // idle || running
    animation: Types.Ref(null),
    jumpSpeed: Types.Ref(1),
  };
}

// Systems are functions that accept a 'world' fragment
// make sure you name this function when you create a new system
export default async function JumpingRabbitSystem(world) {
  const tmpBox = new THREE.Box3();
  const tmpBox2 = new THREE.Box3();

  const geometry = new THREE.PlaneBufferGeometry(1, 1);

  // const texture = await loadTexture(spriteURL);
  const frustum = world.findTag(Tags.MainCameraFrustum);

  const random = Random();

  // query a view of the particles
  const view = world.view([Tags.Object3D, JumpingRabbit]);

  // world ground assets
  const groundAssets = world.view([Tags.GroundAsset, Tags.GroundAssetData]);

  // we can also listen for events
  // these aren't callbacks (which happen immediately) but deferred until
  // this tick, so that everything still happens in a linear way in order of system execution
  // const events = world.listen(JumpingRabbit);

  const spawnEvents = world.listen(Tags.AnimalSpawn);
  const maxEntity = 10;

  const radiusThresh = 10;

  // spawnOne(new THREE.Vector3(-5, 0, -5));

  // the return value of a system is a function that
  // is called on each tick
  return function jumpingRabbitSystem(dt) {
    spawnEvents.added.forEach((e) => {
      const s = e.get(Tags.AnimalSpawn);
      if (
        view.length < maxEntity &&
        s.biome === "tundra" &&
        s.animal === "jumpingrabbit" &&
        !s.lake
      ) {
        let canSpawn = true;
        groundAssets.forEach((e, idx) => {
          const asset = e.get(Tags.GroundAsset);

          VA.x = asset.x;
          VA.z = asset.z;

          const dist = VA.distanceTo(s.position);
          if (dist < 5) {
            canSpawn = false;
          }
        });

        if (random.chance(0.4)) {
          spawnOne(s.position);
        }

        // finally 'consume' the event by killing it so that other systems
        // won't spawn an animal here
        e.kill();
      }
    });

    // console.log(view[0])
    // anim.update(dt)

    const user = world.findTag(Tags.UserCharacter);
    const userPosition = user.position;
    // A list of matching entities that have been added since last frame
    // events.added.forEach((e) => {
    //   // for example, you could 'init' a mesh now that you know
    //   // it's about to be rendered
    //   console.log("Box initialized");
    // });

    // Update all currenly active entities
    // a view is an array reference into a list of
    // Entities that match your query, and they are updated
    // once before each tick of this system
    view.forEach((e) => {
      const mesh = e.get(Tags.Object3D);
      const data = e.get(JumpingRabbit);
      const anim = e.get(Tags.SpriteAnimation);

      data.time += dt;

      const isJumpClip = anim.frame >= 18 && anim.frame < 35;
      anim.speed = isJumpClip ? data.jumpSpeed : 1;

      // switch to jumping state if close to user ?
      const distToUser = mesh.position.distanceTo(userPosition);
      let jumpDir = userPosition.x - mesh.position.x > 0 ? 1 : -1;

      // reverse direction because the rabbit is about to hit an asset?
      groundAssets.forEach((e, idx) => {
        const asset = e.get(Tags.GroundAsset);
        const assetMesh = e.get(Tags.Object3D);

        if (assetMesh.geometry && assetMesh.geometry.boundingSphere) {
          VA.x = assetMesh.matrixWorld.elements[12];
          VA.z = assetMesh.matrixWorld.elements[14];

          const dist = VA.distanceTo(mesh.position);
          let assetRadius = assetMesh.geometry
            ? assetMesh.geometry.boundingSphere.radius * 2
            : 4;
          if (dist < assetRadius) {
            jumpDir *= -1;
          }
        }

        // if (userPosition.distanceTo(VA) < 2) {
        //   console.log('uh oh')
        // }
      });

      // the new left position for when the rabbit 'lands' from a hop
      data.newLeft = jumpDir == 1 ? false : true;

      // waiting for jump
      if (distToUser < radiusThresh && data.state == "idle") {
        console.log("start running away");
        data.state = "jumping";
        // we can set the jump points immediately to make it snappier
        anim.loopStart = 18;
        anim.loopEnd = 35;
        anim.frame = anim.loopStart;
        anim.dirty = true;
      }

      // if we are currently in jumping state, maybe go back to idle?
      if (data.state === "jumping" && distToUser > radiusThresh) {
        data.state = "idle";
      }

      // size to animate it in
      const t = MathUtil.clamp01(data.time / data.animateInDuration);
      mesh.scale.setScalar(t * data.size);
      mesh.scale.y *= 62 / 128;

      if (data.time >= data.duration) {
        tmpBox.setFromObject(mesh);
        if (!frustum.intersectsBox(tmpBox)) {
          // kill the bird once it's out of frame and after living for a while
          e.kill();
        }
      }
    });

    // This is a list of entities that are waiting to be removed
    // events.removing.forEach((e) => {
    //   // for example, you could dispose of things here
    //   // like geometry/textures if needed
    // });
  };

  // Triggers a new entity in the world
  function spawnOne(position) {
    const sprite = createSprite(world, new THREE.Texture());
    sprite.position.set(position.x, 0, position.z);
    const e = world
      .entity()
      .add(Tags.Object3D, sprite)
      .add(Tags.ShaderUniformTime, {
        uniform: sprite.material.uniforms.time,
      })
      .add(Tags.ShadowCaster, { sprite: true })
      .add(JumpingRabbit);

    // randomly flip the sprite
    const rabbit = e.get(JumpingRabbit);
    rabbit.left = random.boolean();
    setSpriteFlip(sprite, rabbit.left);

    // Scale for all fish sprites
    const scl = 4;
    sprite.scale.x = scl;
    sprite.scale.y *= 62 / 128;

    // jump speed
    rabbit.jumpSpeed = random.range(3, 4.5);

    // Add sprite animation to it
    e.add(Tags.SpriteAnimation);
    const anim = e.get(Tags.SpriteAnimation);
    anim.looping = true;
    anim.loopStart = 0;
    anim.loopEnd = 18;

    const mesh = e.get(Tags.Object3D);
    mesh.material.uniforms.tintColor.value.r = tintColor.r;
    mesh.material.uniforms.tintColor.value.g = tintColor.g;
    mesh.material.uniforms.tintColor.value.b = tintColor.b;
    mesh.material.needsUpdate = true;

    anim.onLoopEnd = (e) => {
      const mesh = e.get(Tags.Object3D);
      const animState = e.get(Tags.SpriteAnimation);
      const rabbitState = e.get(JumpingRabbit);
      const isJumpClip = animState.frame >= 18 && animState.frame < 35;
      if (isJumpClip) {
        // if we are in a 'hopping' clip, make sure to move
        mesh.position.x += rabbitState.left
          ? rabbitState.size * 0.43
          : -rabbitState.size * 0.43;
      }

      // determine if next clip should be another jump or idle
      if (rabbitState.state === "jumping") {
        animState.loopStart = 18;
        animState.loopEnd = 35;
      } else if (rabbitState.state === "idle") {
        animState.loopStart = 0;
        animState.loopEnd = 18;
      }
      animState.frame = animState.loopStart;
      animState.dirty = true;

      // also at this point turn the rabbit if we haven't already
      if (rabbitState.left !== rabbitState.newLeft) {
        rabbitState.left = rabbitState.newLeft;
        setSpriteFlip(mesh, rabbitState.left);
        mesh.position.x += rabbitState.left
          ? rabbitState.size * 0.43
          : -rabbitState.size * 0.43;
      }
    };

    // Lazily load sprite sheet based on when it's first added to scene
    e.add(Tags.SpriteAnimationLazyLoadSheet);
    const lazy = e.get(Tags.SpriteAnimationLazyLoadSheet);
    lazy.id = "spritesheets/jumpingrabbit";
  }
}
