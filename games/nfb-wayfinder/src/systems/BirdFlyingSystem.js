import * as Tags from "../tags";
import { Data, Types } from "../tags";
import * as THREE from "three";
import { TextureLoader } from "three";
import Random from "../util/Random";
import flyingSpriteURL from "../assets/spritesheets/bird_fly.png";
import * as MathUtil from "../util/math";
import SpriteAnimation from "../util/SpriteAnimation";

import flyingSheetData from "../assets/spritesheets/bird_fly.sheet";

const NOOP = () => {};
const texLoader = new TextureLoader();

/*

A simple system that shows off the basic ECS approach.
Each interval, a square emits from the character and floats up,
until it dies away.

*/

// Set up a new tag/data/value
// Usually this would be in "tags.js" but you can also just
// keep it entirely within your system if you want
class FlyingBird extends Data {
  static data = {
    // constant time increase
    time: Types.Ref(0),
    // animate from zero to 1.0 initially
    animateInDuration: Types.Ref(0.25),
    // how big to make it
    size: Types.Ref(0.6),
    animation: Types.Ref(null),
    left: Types.Ref(false),
    speed: Types.Ref(1),
    velocity: Types.Vector3(),
  };
}

// Systems are functions that accept a 'world' fragment
// make sure you name this function when you create a new system
export default async function BirdFlyingSystem(world) {
  // const lat = MathUtil.degToRad(45);
  // const long = MathUtil.degToRad(90);

  // const velocityLeft = new THREE.Vector3(-0.25, 0, -0.25);
  // const velocityRight = new THREE.Vector3(0.25, 0, -0.25);
  // const velocityLeft = MathUtil.sphericalToCartesian(lat, long);
  // const velocityRight = velocityLeft;

  // const velocityRight = new THREE.Vector3(0.25, 0, -0.25);

  const flyingTexture = await loadTexture(flyingSpriteURL);

  // const material = anim.getMaterial()
  // const spriteSizeW = anim.currentFrameData.sourceSize.w
  // const spriteSizeH = anim.currentFrameData.sourceSize.h
  const geometry = new THREE.PlaneBufferGeometry(1, 1);

  const random = Random();

  // query a view of the particles
  const view = world.view([Tags.Object3D, FlyingBird]);

  // we can also listen for events
  // these aren't callbacks (which happen immediately) but deferred until
  // this tick, so that everything still happens in a linear way in order of system execution
  const events = world.listen(FlyingBird);

  // listen for events on sprite-hit trigger (@Matt TODO: make this not specific to audio triggers...)
  const treeEvents = world.listen([Tags.Object3D, Tags.UserHitAudioTrigger]);
  const tmpPos3 = new THREE.Vector3();
  const tmpBox = new THREE.Box3();

  let gameTime = 0;
  let lastBirdTime = null;
  let birdThrottle = 2; // no more than 1 bird every N seconds
  let maxBirdsOnScreen = 4; // no more than N active entities

  // the return value of a system is a function that
  // is called on each tick
  return function birdFlyingSystem(dt) {
    const camera = world.findTag(Tags.MainCamera);
    const frustum = world.findTag(Tags.MainCameraFrustum);

    // small thing here - it's a bit visually distracting to have
    // birds spawn at the same moment that the user is resolving / writing
    // so we can ignore spawn when some tags are present
    const ignoreSpawn = Boolean(
      world.findTag(Tags.ShowBiomeResolution) ||
        world.findTag(Tags.WrittenStanzaLineActive) ||
        world.findTag(Tags.HaikuAddingToInventory)
    );

    gameTime += dt;

    // Here we spawn new entities
    treeEvents.added.forEach((e) => {
      if (ignoreSpawn) return;

      const type = e.get(Tags.UserHitAudioTrigger).type;
      const moreToSpawn = view.length < maxBirdsOnScreen;
      const spawnThrottle =
        lastBirdTime == null || gameTime - lastBirdTime >= birdThrottle;
      if (
        type === "tree" &&
        random.chance(0.5) &&
        moreToSpawn &&
        spawnThrottle
      ) {
        const obj = e.get(Tags.Object3D);

        tmpPos3.copy(obj.position);

        // part way up the tree?
        const offset = Math.min(obj.scale.y, random.range(4, 5));
        tmpPos3.y += offset;
        spawn(camera, tmpPos3);
        lastBirdTime = gameTime;
      }
    });

    // Here we update all spawned entities
    // This way we can have multiple birds on screen at once with different
    // values (i.e. different frames of their animation)
    view.forEach((e) => {
      const d = e.get(FlyingBird);
      const speed = d.speed;

      const mesh = e.get(Tags.Object3D);
      const material = mesh.material;
      d.animation.update(dt);
      d.time += dt;

      // size to animate it in
      const t = MathUtil.clamp01(d.time / d.animateInDuration);
      mesh.scale.setScalar(t * d.size);

      // always update this mesh position?
      mesh.position.addScaledVector(d.velocity, dt * speed);

      material.uniforms.uLeft.value = d.left;
      material.uniforms.uRotation.value = MathUtil.degToRad(0);

      tmpBox.setFromObject(mesh);
      if (!frustum.intersectsBox(tmpBox)) {
        // kill the bird once it's out of frame
        e.kill();
      }
    });
  };

  // Triggers a new entity in the world
  function spawn(camera, position) {
    const flyingAnim = new SpriteAnimation(flyingSheetData, null);
    flyingAnim.texture = flyingTexture;
    flyingAnim.makeMaterial();

    const material = flyingAnim.getMaterial();
    const mesh = new THREE.Mesh(geometry, flyingAnim.getMaterial());
    mesh.position.copy(position);

    // create the entity, this will just give us an inactive one from our entity pool
    const e = world.entity();

    // now add tags to it, Object3D will cause its value (mesh) to be added to the scene
    e.add(Tags.Object3D, mesh);
    e.add(Tags.AnimalSound, "birdChirp");

    // can give each particle a different speed
    const speed = 7; //random.range(6, 8);

    e.add(FlyingBird);

    const d = e.get(FlyingBird);
    const left = random.boolean();

    d.animation = flyingAnim;
    d.velocity.set(left ? -0.5 : 0.5, 0.25, -0.5).normalize();

    // uncomment to visualize the flight direction in world space
    // const helper = new THREE.ArrowHelper(
    //   d.velocity,
    //   new THREE.Vector3(),
    //   4,
    //   "red",
    //   2,
    //   1
    // );
    // helper.position.copy(position);
    // world.entity().add(Tags.Object3D, helper);

    d.left = left;
    d.size = 2;
    d.speed = speed;
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
