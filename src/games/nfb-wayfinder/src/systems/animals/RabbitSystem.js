import * as Tags from "../../tags";
import { Data, Types } from "../../tags";
import * as THREE from "three";
import { TextureLoader } from "three";
import Random from "../../util/Random";
import spriteURL from "../../assets/spritesheets/rabbit.png";
import * as MathUtil from "../../util/math";
import SpriteAnimation from "../../util/SpriteAnimation";

import sheetData from "../../assets/spritesheets/rabbit.sheet.json";

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
class Rabbit extends Data {
  static data = {
    // constant time increase
    time: Types.Ref(0),
    // animate from zero to 1.0 initially
    animateInDuration: Types.Ref(0.25),
    // how big to make it
    size: Types.Ref(1.2),
    animation: Types.Ref(null),
    left: Types.Ref(false),
    speed: Types.Ref(1),
    velocity: Types.Vector3(),

    state: Types.Ref(""),
  };
}

// Systems are functions that accept a 'world' fragment
// make sure you name this function when you create a new system
export default async function rabbitSystem(world) {
  const texture = await loadTexture(spriteURL);

  const geometry = new THREE.PlaneBufferGeometry(1, 1);

  const random = Random();

  // query a view of the particles
  const view = world.view([Tags.Object3D, Rabbit]);

  // we can also listen for events
  // these aren't callbacks (which happen immediately) but deferred until
  // this tick, so that everything still happens in a linear way in order of system execution
  const events = world.listen(Rabbit);

  // listen for events on sprite-hit trigger (@Matt TODO: make this not specific to audio triggers...)
  const tmpBox = new THREE.Box3();

  let gameTime = 0;
  let lastBirdTime = null;
  let maxOnScreen = 20; // no more than N active entities

  const spawnEvents = world.listen(Tags.AnimalSpawn);
  const pos = new THREE.Vector3(-8, 1, -6);
  // spawn(null, pos);

  // the return value of a system is a function that
  // is called on each tick
  return function RabbitSystem(dt) {
    const camera = world.findTag(Tags.MainCamera);
    const frustum = world.findTag(Tags.MainCameraFrustum);

    spawnEvents.added.forEach((e) => {
      const s = e.get(Tags.AnimalSpawn);
      if (
        view.length < maxOnScreen &&
        s.biome === "grasslands" &&
        s.animal === "rabbit" &&
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
      const d = e.get(Rabbit);
      const speed = d.speed;

      const mesh = e.get(Tags.Object3D);
      const material = mesh.material;
      d.animation.update(dt);
      d.time += dt;

      // size to animate it in
      const t = MathUtil.clamp01(d.time / d.animateInDuration);
      mesh.scale.setScalar(t * d.size);

      material.uniforms.uLeft.value = d.left;
      material.uniforms.uRotation.value = MathUtil.degToRad(0);
    });
  };

  // Triggers a new entity in the world
  function spawn(camera, position) {
    const anim = new SpriteAnimation(sheetData, null);
    anim.texture = texture;
    anim.makeMaterial();

    const material = anim.getMaterial();
    const mesh = new THREE.Mesh(geometry, anim.getMaterial());
    mesh.position.copy(position);
    mesh.position.y += 0.5;

    // create the entity, this will just give us an inactive one from our entity pool
    const e = world.entity();

    // now add tags to it, Object3D will cause its value (mesh) to be added to the scene
    e.add(Tags.Object3D, mesh);

    // can give each particle a different speed
    const speed = 7; //random.range(6, 8);

    e.add(Rabbit);

    const d = e.get(Rabbit);
    const left = random.boolean();

    d.animation = anim;
    d.velocity.set(left ? -0.1 : 0.1, 0, -0.1).normalize();

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
