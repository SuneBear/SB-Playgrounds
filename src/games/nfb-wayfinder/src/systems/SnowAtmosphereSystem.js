import * as Tags from "../tags";
import * as THREE from "three";
import Random from "../util/Random";
import ObjectPool from "../util/ObjectPool";
import { tweenTo } from "./AnimationSystem";

export default function SnowAtmosphereSystem(world) {
  const dummyGeometry = new THREE.IcosahedronGeometry(1, 0);

  const pool = new ObjectPool({
    maxCapacity: 50,
    initialCapacity: 50,
    create() {
      const mesh = new THREE.Mesh(
        dummyGeometry,
        new THREE.MeshBasicMaterial({
          name: "snow",
          // transparent: true,
          // opacity: 0.5,
        })
      );
      // mesh.matrixAutoUpdate = false;
      mesh.userData._entity = null;
      mesh.frustumCulled = false;
      mesh.visible = false;
      return mesh;
    },
    release(m) {},
  });

  let time = 0;
  let duration = 0.1;
  const random = Random();
  const randomPos = new THREE.Vector3();
  const tmp2D = [0, 0];
  const userTarget = world.findTag(Tags.UserTarget);
  const flakes = world.view([Tags.Snowflake, Tags.Object3D]);
  const env = world.view([Tags.EnvironmentState, Tags.ActiveEnvironmentState]);
  let globalScaleTween = { value: 1 };
  const finished = world.listen(Tags.FinalBiomeResolution);

  return function SnowAtmosphereSystemDT(dt) {
    const name = env.length ? env[0].get(Tags.EnvironmentState).name : null;
    if (name !== "tundra") return;

    if (finished.changed && finished.added.length > 0) {
      tweenTo(world, globalScaleTween, "value", 0, 2, "sineOut");
    } else if (finished.changed && finished.removing.length > 0) {
      tweenTo(world, globalScaleTween, "value", 1, 2, "sineOut");
    }

    time += dt;
    if (time >= duration) {
      time %= duration;
      randomPos.copy(userTarget.position);
      random.insideCircle(20, tmp2D);
      randomPos.x += tmp2D[0];
      randomPos.z += tmp2D[1];
      randomPos.y += random.range(4, 20);
      if (globalScaleTween.value > 0) spawn(randomPos);
    }

    flakes.forEach((e) => {
      const snow = e.get(Tags.Snowflake);
      snow.velocity.x = Math.sin(snow.time * 2) * 0.5;
      snow.velocity.z = Math.sin(snow.time * 1) * 0.25;
      snow.position.addScaledVector(snow.velocity, dt * 1);

      const obj = e.get(Tags.Object3D);
      obj.visible = true;
      obj.position.copy(snow.position);

      snow.time += dt;

      const t = animate(
        snow.time,
        snow.duration,
        snow.animateDuration,
        snow.delay
      );

      const s = snow.size * t * globalScaleTween.value;
      obj.scale.setScalar(s);
      const a = 1;
      const bloom = 0.75;
      obj.material.color.setRGB(a + bloom, a + bloom, a + bloom);

      if (snow.time >= snow.duration || snow.position.y < 0) {
        pool.release(obj);
        obj.userData._entity = null;
        e.kill();
      }
    });
  };

  function spawn(position) {
    const m = pool.next();
    if (!m) return;
    m.userData._entity = world
      .entity()
      .add(Tags.Snowflake)
      .add(Tags.Object3D, m);
    const snow = m.userData._entity.get(Tags.Snowflake);
    m.scale.setScalar(0.05);
    snow.size = 0.05;

    snow.position.copy(position);
    snow.velocity.set(0, -1, 0);
    m.visible = false;
  }

  function animate(time, duration, animateDuration, ease = linear) {
    let anim = 0;
    if (time <= animateDuration) {
      anim = time / animateDuration;
    } else if (time >= duration - animateDuration) {
      const el = Math.max(0, time - (duration - animateDuration));
      const t = el / animateDuration;
      anim = 1 - t;
    } else {
      anim = 1;
    }
    // anim = ease(anim);
    return anim;
  }
}
