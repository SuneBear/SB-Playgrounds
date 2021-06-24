import * as Tags from "../tags";
import * as THREE from "three";
import * as MathUtil from "../util/math";
import ObjectPool from "../util/ObjectPool";
import Random from "../util/Random";
import Line3D from "./writing/Line3D";
import getPathFromSVG from "../util/getPathFromSVG";

export default function WindAtmosphereSystem(world) {
  const activeEnv = world.view(Tags.ActiveEnvironmentState);

  const random = Random();
  const pathDatas = getPaths().map((svg) => {
    const points = getPathFromSVG(svg).map((p) => {
      return new THREE.Vector3(p[0], 0, p[1]);
    });
    const curve = new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.5);
    return curve.getSpacedPoints(100).map((p) => p.toArray());
  });

  const pathLines = pathDatas.map((data) => {
    const mesh = new Line3D(world, {
      thickness: 0.2,
      bloom: 0,
      taper: false,
    });
    mesh.updatePath(data);
    // const mesh = new THREE.Mesh(
    //   geo,
    //   new THREE.MeshBasicMaterial({ color: "red" })
    // );
    mesh.userData._entity = null;
    mesh.userData._lineThickness = 1;
    return mesh;
  });

  // const geo = new THREE.BoxGeometry(1, 1, 1);
  // const pool = new ObjectPool({
  //   initialCapacity: 5,
  //   maxCapacity: 5,
  //   create() {

  //     return mesh;
  //   },
  // });

  let spawnTimer = 0;
  const newSpawnDelay = () => random.range(1, 2);
  let spawnDelay = newSpawnDelay();

  const tmp2DArr = [0, 0];

  const windLines = world.view(Tags.WindLine);

  return function processWind(dt) {
    const env = activeEnv.length
      ? activeEnv[0].get(Tags.EnvironmentState).name
      : null;
    if (!env || env !== "grasslands") {
      if (windLines.length > 0) {
        windLines.forEach((e) => {
          const line = e.get(Tags.Object3D);
          line.userData._entity = null;
          e.kill();
        });
      }
      return;
    }

    spawnTimer += dt;
    if (spawnTimer >= spawnDelay) {
      spawnTimer %= spawnDelay;
      spawnDelay = newSpawnDelay();
      const target = world.findTag(Tags.UserTarget);
      spawn(target.position);
    }

    windLines.forEach((e) => {
      const wind = e.get(Tags.WindLine);
      wind.time += dt;

      let anim = 0;
      if (wind.time <= wind.animateDuration) {
        anim = wind.time / wind.animateDuration;
      } else if (wind.time >= wind.duration - wind.animateDuration) {
        const el = Math.max(
          0,
          wind.time - (wind.duration - wind.animateDuration)
        );
        const t = el / wind.animateDuration;
        anim = 1 - t;
      } else {
        anim = 1;
      }

      const line = e.get(Tags.Object3D);
      line.material.uniforms.thickness.value =
        line.userData._lineThickness * anim;
      line.material.uniforms.time.value += dt;
      line.material.uniforms.draw.value = wind.time / wind.duration;

      const totalDur = wind.duration;
      if (wind.time >= totalDur) {
        e.kill();
        line.userData._entity = null;
      }
    });
  };

  function nextAvailable(e) {
    return !e.userData._entity;
  }

  function nextRandomAvailable() {
    const start = random.rangeFloor(0, pathLines.length);
    for (let i = 0; i < pathLines.length; i++) {
      const k = (i + start) % pathLines.length;
      if (!pathLines[k].userData._entity) return pathLines[k];
    }
    return null;
  }

  function spawn(target) {
    const mesh = nextRandomAvailable();
    if (!mesh) return;
    random.onCircle(random.range(5, 10), tmp2DArr);
    const x = target.x + tmp2DArr[0];
    const z = target.z + tmp2DArr[1];
    mesh.userData._entity = world.entity().add(Tags.Object3D, mesh);
    mesh.position.set(x, random.range(2, 4), z);
    mesh.scale.setScalar(random.range(1, 6));
    mesh.rotation.y = THREE.MathUtils.degToRad(45);
    mesh.material.uniforms.drawing.value = true;
    mesh.material.uniforms.opacity.value = 0.5;
    mesh.userData._lineThickness = random.range(0.2, 0.2);
    mesh.userData._entity.add(Tags.WindLine);
    const wind = mesh.userData._entity.get(Tags.WindLine);
    wind.duration = random.range(3, 3);
  }
}

function getPaths() {
  return [
    "M1 73C48 80 154.8 89.8 206 73C270 52 259 19 238 7C217 -5 173 -1.90735e-06 176 26C179 52 191 76 277 80C363 84 421 67 444 65C467 63 530 73 561 73",
    "M1 13C50 16.3333 101 23 178 18C255 13 268 -0.999999 338 1C408 3 444 18 508 18",
    // "M1 39C20 37.3333 64.6 35 91 39C124 44 226 49 246 44C266 39 280 16 263 6C246 -4 227 0.999995 228 14",
    "M1 18C40.3333 12 129 0.199994 169 0.999994C219 1.99999 346 18 399 18C452 18 512 0.999994 526 0.999994",
    "M1 5.99999C69.3333 2.33332 217.8 -2.80001 265 5.99999C324 17 421 -2.00003 462 5.99999",
  ];
}
