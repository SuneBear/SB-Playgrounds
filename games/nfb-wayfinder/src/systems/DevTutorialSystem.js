import * as Tags from "../tags";
import { Data, Types } from "../tags";
import * as THREE from "three";
import Random from "../util/Random";

/*

A simple system that shows off the basic ECS approach.
Each interval, a square emits from the character and floats up,
until it dies away.

*/

// Set up a new tag/data/value
// Usually this would be in "tags.js" but you can also just
// keep it entirely within your system if you want
class MyFloatingBox extends Data {
  static data = {
    speed: Types.Ref(1),
  };
}

// Systems are functions that accept a 'world' fragment
// make sure you name this function when you create a new system
export default function DevTutorialSystem(world) {
  let time = 0;
  let delay = 1;

  const material = new THREE.MeshBasicMaterial();
  const geometry = new THREE.BoxGeometry(1, 1, 1);

  const random = Random();

  // query a view of the particles
  const view = world.view([Tags.Object3D, MyFloatingBox]);

  // we can also listen for events
  // these aren't callbacks (which happen immediately) but deferred until
  // this tick, so that everything still happens in a linear way in order of system execution
  const events = world.listen(MyFloatingBox);

  // the return value of a system is a function that
  // is called on each tick
  return (dt) => {
    // Do something every N ms
    time += dt;
    if (time >= delay) {
      time %= delay;
      // trigger a new entity
      spawn();
    }

    // A list of matching entities that have been added since last frame
    events.added.forEach((e) => {
      // for example, you could 'init' a mesh now that you know
      // it's about to be rendered
      console.log("Box initialized");
    });

    // Update all currenly active entities
    // a view is an array reference into a list of
    // Entities that match your query, and they are updated
    // once before each tick of this system
    view.forEach((e) => {
      const mesh = e.get(Tags.Object3D);
      const body = e.get(MyFloatingBox);
      mesh.position.y += body.speed * dt;

      // kill the entity if it's too high,
      // once it's fully processed (after this frame)
      // it will be removed from the view
      if (mesh.position.y > 5) {
        e.kill();
      }
    });

    // This is a list of entities that are waiting to be removed
    events.removing.forEach((e) => {
      // for example, you could dispose of things here
      // like geometry/textures if needed
      console.log("Removing box");
    });
  };

  // Triggers a new entity in the world
  function spawn() {
    // You can use findTag to get singleton tags (i.e. we only expect 1 of this in the world)
    const user = world.findTag(Tags.UserCharacter);
    const position = user.position;

    // Usually you would use ObjectPool or similar instead of creating new meshes
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    mesh.quaternion.fromArray(random.quaternion());

    // create the entity, this will just give us an inactive one from our entity pool
    const e = world.entity();

    // now add tags to it, Object3D will cause its value (mesh) to be added to the scene
    e.add(Tags.Object3D, mesh);

    // let's give each particle a different speed
    const speed = random.range(1, 2);

    e.add(MyFloatingBox, { speed });

    /*
    ^^ note: Also usually I avoid the { } pattern as it creates a new object (i.e. GC thrashing)
       you often will see this instead:

          e.add(MyFlatingBoxTag); // make sure tag exists
          const data = e.get(MyFloatingBox); // get the tag data
          data.speed = speed; // assign your data

       This is better as it will create zero new allocations.
    */
  }
}
