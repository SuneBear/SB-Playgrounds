import * as MathUtil from "../util/math";
import * as Tags from "../tags";
import { Data, Types } from "../tags";
import * as THREE from "three";
import Random from "../util/Random";
import idleSpriteURL from "../assets/spritesheets/bird_still.png";
import flyingSpriteURL from "../assets/spritesheets/bird_fly.png";
import SpriteAnimation from "../util/SpriteAnimation";
import { insideWaterPolys } from "../util/water-util";
import idleSheetData from "../assets/spritesheets/bird_still.sheet";
import flyingSheetData from "../assets/spritesheets/bird_fly.sheet";
import { TextureLoader } from "three";
const NOOP = () => {};
const texLoader = new TextureLoader();
/*

A simple system that shows off the basic ECS approach.
Each interval, a square emits from the character and floats up,
until it dies away.

*/

// enum GroundBirdStates {
//   IDLE,
//   FLYING
// }

// Set up a new tag/data/value
// Usually this would be in "tags.js" but you can also just
// keep it entirely within your system if you want
class GroundBird extends Data {
  static data = {
    time: Types.Ref(0),
    size: Types.Ref(1.4),
    animateInDuration: Types.Ref(0.25),
    duration: Types.Ref(5),
    speed: Types.Ref(7),
    left: Types.Ref(true),
    state: Types.Ref("idle"), // idle || flying
    idleAnimation: Types.Ref(null),
    flyingAnimation: Types.Ref(null),
    velocity: Types.Vector3(0, 0, 0),
  };
}

// Systems are functions that accept a 'world' fragment
// make sure you name this function when you create a new system
export default async function GroundBirdSystem(world) {
  const tmpBox = new THREE.Box3();

  const geometry = new THREE.PlaneBufferGeometry(1, 1);

  const idleTexture = await loadTexture(idleSpriteURL);
  const flyingTexture = await loadTexture(flyingSpriteURL);
  const frustum = world.findTag(Tags.MainCameraFrustum);

  const random = Random();

  // query a view of the particles
  const view = world.view([Tags.Object3D, GroundBird]);

  // we can also listen for events
  // these aren't callbacks (which happen immediately) but deferred until
  // this tick, so that everything still happens in a linear way in order of system execution
  const events = world.listen(GroundBird);

  const spawnEvents = world.listen(Tags.AnimalSpawn);
  const maxBirds = 2;
  const activeEnvEvents = world.listen(Tags.ActiveEnvironmentState);

  // the return value of a system is a function that
  // is called on each tick
  return function groundBirdSystem(dt) {
    spawnEvents.added.forEach((e) => {
      const s = e.get(Tags.AnimalSpawn);
      if (
        view.length < maxBirds &&
        s.biome === "forest" &&
        s.animal === "bird" &&
        !s.lake
      ) {
        spawnOne(s.position);

        // finally 'consume' the event by killing it so that other systems
        // won't spawn an animal here
        e.kill();
      }
    });

    if (activeEnvEvents.changed) {
      // when environment changes, kill each bird
      view.forEach((e) => e.kill());
    }

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
      const data = e.get(GroundBird);

      data.time += dt;

      // detect if close to user
      // switch to flying state if close to user
      const distToUser = mesh.position.distanceTo(userPosition);
      if (distToUser < 4 && data.state == "idle") {
        e.add(Tags.AnimalSound, "birdFlap");
        data.state = "flying";
        mesh.material = data.flyingAnimation.getMaterial();
        mesh.material.uniforms.uRotation.value = MathUtil.degToRad(0);
        const left = data.left;
        mesh.material.uniforms.uLeft.value = left;
        data.velocity.x = left ? -0.5 : 0.5;
        data.velocity.y = 0.25;
        data.velocity.z = -0.5;
        data.velocity.normalize();
        data.size = 2;
      }

      // update current animation
      const currentAnimation =
        data.state == "idle" ? data.idleAnimation : data.flyingAnimation;
      const hasUpdated = currentAnimation.update(dt);

      // set scale
      data.time += dt;

      // size to animate it in
      const t = MathUtil.clamp01(data.time / data.animateInDuration);
      mesh.scale.setScalar(t * data.size);
      // mesh.scale.setScalar(data.size);

      // update position
      mesh.position.addScaledVector(data.velocity, dt * data.speed);

      if (data.time >= data.duration) {
        tmpBox.setFromObject(mesh);
        if (!frustum.intersectsBox(tmpBox)) {
          // kill the bird once it's out of frame and after living for a while
          e.kill();
        }
      }
    });

    // This is a list of entities that are waiting to be removed
    events.removing.forEach((e) => {
      // for example, you could dispose of things here
      // like geometry/textures if needed
    });
  };

  // Triggers a new entity in the world
  function spawnOne(position) {
    // You can use findTag to get singleton tags (i.e. we only expect 1 of this in the world)
    // const user = world.findTag(Tags.UserCharacter);
    // const position = user.position;

    // First check if we can 'steal' one from out of frame
    // for (let i = 0; i < view.length; i++) {
    //   const e = view[i];
    //   const mesh = e.get(Tags.Object3D);
    //   tmpBox.setFromObject(mesh);
    //   if (!frustum.intersectsBox(tmpBox)) {
    //     console.log("stealing");
    //     resetBird(e, position);
    //     return e;
    //   }
    // }

    // make idle anim
    const idleAnim = new SpriteAnimation(idleSheetData, null, {
      skipFrames: [67],
    });
    idleAnim.texture = idleTexture;
    idleAnim.makeMaterial();

    // make flying anim
    const flyingAnim = new SpriteAnimation(flyingSheetData, null);
    flyingAnim.texture = flyingTexture;
    flyingAnim.makeMaterial();

    const material = idleAnim.getMaterial();
    const spriteSizeW = idleAnim.currentFrameData.sourceSize.w;
    const spriteSizeH = idleAnim.currentFrameData.sourceSize.h;
    // const geometry = new THREE.PlaneBufferGeometry(1, 1/(spriteSizeW/spriteSizeH));
    // Usually you would use ObjectPool or similar instead of creating new meshes
    const mesh = new THREE.Mesh(geometry, material);

    // create the entity, this will just give us an inactive one from our entity pool
    const e = world.entity();

    // now add tags to it, Object3D will cause its value (mesh) to be added to the scene
    e.add(Tags.Object3D, mesh);
    e.add(GroundBird);
    e.add(Tags.Animal);

    const data = e.get(GroundBird);
    data.idleAnimation = idleAnim;
    data.flyingAnimation = flyingAnim;

    resetBird(e, position);
    return e;
  }

  function resetBird(e, position) {
    const left = random.boolean();
    const data = e.get(GroundBird);
    data.state = "idle";
    data.velocity.set(0, 0, 0);
    data.left = left;
    const idleAnim = data.idleAnimation;
    const flyingAnim = data.flyingAnimation;
    idleAnim.currentFrame = Math.floor(random.range(0, 20));
    flyingAnim.currentFrame = Math.floor(random.range(0, 20));
    flyingAnim.elapsed = 0;
    idleAnim.elapsed = 0;

    const mesh = e.get(Tags.Object3D);
    mesh.material = idleAnim.getMaterial();
    mesh.position.copy(position);
    mesh.position.y += 0.5;

    mesh.material.uniforms.uLeft.value = left;
  }

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
