import * as Tags from "../../tags";
import { Data, Types } from "../../tags";
import * as THREE from "three";
import { TextureLoader } from "three";
import Random from "../../util/Random";
import sleepSpriteURL from "../../assets/spritesheets/owl_sleep.png";
import wakeupSpriteURL from "../../assets/spritesheets/owl_wakeup.png";
import * as MathUtil from "../../util/math";
import SpriteAnimation from "../../util/SpriteAnimation";
import sleepSheetData from "../../assets/spritesheets/owl_sleep.sheet.json";
import wakeupSheetData from "../../assets/spritesheets/owl_wakeup.sheet.json";

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
class Owl extends Data {
  static data = {
    // constant time increase
    time: Types.Ref(0),
    // animate from zero to 1.0 initially
    animateInDuration: Types.Ref(0.25),
    // how big to make it
    size: Types.Ref(1),

    left: Types.Ref(false),

    state: Types.Ref("sleep"), // idle || flying
    currentAnimation: Types.Ref(null),
    sleepAnimation: Types.Ref(null),
    wakeupAnimation: Types.Ref(null),
  };
}

// Systems are functions that accept a 'world' fragment
// make sure you name this function when you create a new system
export default async function OwlSystem(world) {
  const wakeupTexture = await loadTexture(wakeupSpriteURL);
  const sleepTexture = await loadTexture(sleepSpriteURL);

  const geometry = new THREE.PlaneBufferGeometry(1, 1);

  const random = Random();

  // query a view of the particles
  const view = world.view([Tags.Object3D, Owl]);

  // we can also listen for events
  // these aren't callbacks (which happen immediately) but deferred until
  // this tick, so that everything still happens in a linear way in order of system execution
  const events = world.listen(Owl);

  // listen for events on sprite-hit trigger (@Matt TODO: make this not specific to audio triggers...)
  const tmpBox = new THREE.Box3();

  let gameTime = 0;
  let lastBirdTime = null;
  let maxOnScreen = 20; // no more than N active entities

  const spawnEvents = world.listen(Tags.AnimalSpawn);
  const pos = new THREE.Vector3(-5, 1, -5);
  // spawn(null, pos);

  // the return value of a system is a function that
  // is called on each tick
  return function owlSystem(dt) {
    const camera = world.findTag(Tags.MainCamera);
    const frustum = world.findTag(Tags.MainCameraFrustum);
    const user = world.findTag(Tags.UserCharacter);

    const userPosition = user.position;

    spawnEvents.added.forEach((e) => {
      const s = e.get(Tags.AnimalSpawn);
      if (
        view.length < maxOnScreen &&
        s.animal === "owl" &&
        !s.lake
      ) {
        spawn(camera, s.position);
        // // finally 'consume' the event by killing it so that other systems
        // // won't spawn an animal here
        e.kill();
      }
    });

    // small thing here - it's a bit visually distracting to have
    // birds spawn at the same moment that the user is resolving / writing
    // so we can ignore spawn when some tags are present
    const ignoreSpawn = Boolean(
      world.findTag(Tags.ShowBiomeResolution) ||
        world.findTag(Tags.WrittenStanzaLineActive) ||
        world.findTag(Tags.HaikuAddingToInventory)
    );

    gameTime += dt;

    // Here we update all spawned entities
    // This way we can have multiple birds on screen at once with different
    // values (i.e. different frames of their animation)
    view.forEach((e) => {
      const d = e.get(Owl);

      const mesh = e.get(Tags.Object3D);

      const distToUser = mesh.position.distanceTo(userPosition);
      if (distToUser < 14 && d.state == "sleep") {
        d.state = "wakeup";
        d.currentAnimation = d.wakeupAnimation;
        d.currentAnimation.stop()
        d.currentAnimation.play()
        mesh.material = d.currentAnimation.getMaterial();
      }
      else if (distToUser > 4 && d.state == "wakeup" && d.currentAnimation.currentFrame > 47) {
        d.state = "sleep";
        d.currentAnimation = d.sleepAnimation;
        d.currentAnimation.stop()
        d.currentAnimation.play()
        mesh.material = d.currentAnimation.getMaterial();
      }

      d.currentAnimation.update(dt);
      d.time += dt;

      // size to animate it in
      const t = MathUtil.clamp01(d.time / d.animateInDuration);
      mesh.scale.setScalar(t * d.size);

      const material = mesh.material;
      material.uniforms.uLeft.value = d.left;
      material.uniforms.uRotation.value = MathUtil.degToRad(0);
    });
  };

  // Triggers a new entity in the world
  function spawn(camera, position) {
    // make anims
    const sleepAnim = new SpriteAnimation(sleepSheetData, null);
    sleepAnim.texture = sleepTexture;
    sleepAnim.makeMaterial();

    const wakeupAnim = new SpriteAnimation(wakeupSheetData, null);
    wakeupAnim.texture = wakeupTexture;
    wakeupAnim.loop = false
    wakeupAnim.makeMaterial();

    const mesh = new THREE.Mesh(geometry, sleepAnim.getMaterial());
    mesh.position.copy(position);
    mesh.position.y += 0.5;

    // create the entity, this will just give us an inactive one from our entity pool
    const e = world.entity();

    // now add tags to it, Object3D will cause its value (mesh) to be added to the scene
    e.add(Tags.Object3D, mesh);

    // can give each particle a different speed
    const speed = 7; //random.range(6, 8);

    e.add(Owl);

    const d = e.get(Owl);
    d.state = "sleep";
    const left = random.boolean();
    d.sleepAnimation = sleepAnim;
    d.wakeupAnimation = wakeupAnim;

    d.currentAnimation = sleepAnim;

    d.left = left;
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
