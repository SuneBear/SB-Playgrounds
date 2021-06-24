import * as Tags from "../tags";
import * as THREE from "three";
import * as ShaderManager from "../util/ShaderManager";
import ObjectPool from "../util/ObjectPool";
import Random from "../util/Random";
import * as MathUtil from "../util/math";
import { setEntityTweenFromTo } from "./AnimationSystem";
import { loadTexture } from "../util/load";
import { detachObject } from "../util/three-util";

export default function ProceduralSpawningDots(world) {
  const meshes = world.view([Tags.Object3D, Tags.GroundSpawningDot]);
  const triggerEvents = world.listen(Tags.PoemLineTriggerActivated);
  const random = Random(175079320123);

  const group = new THREE.Group();
  world.entity().add(Tags.Object3D, group);

  const bases = [
    new THREE.TetrahedronBufferGeometry(1, 0),
    new THREE.TetrahedronBufferGeometry(1, 1),
  ];
  const tmpVec = new THREE.Vector3();

  const geometries = new Array(3).fill(0).map((_, i) => {
    const geometry = new THREE.BufferGeometry();
    const baseGeometry = bases[i % bases.length];
    const positions = baseGeometry.attributes.position;
    const newPositions = new THREE.Float32BufferAttribute(
      new Float32Array(positions.array.length),
      3
    );
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);
      tmpVec.set(x, y, z);
      const n = tmpVec.clone().normalize();
      const v = tmpVec.clone().addScaledVector(n, random.gaussian(0, 1 / 8));
      newPositions.setX(i, v.x);
      newPositions.setY(i, v.y);
      newPositions.setZ(i, v.z);
    }
    geometry.setAttribute("position", newPositions);
    geometry.setIndex(baseGeometry.getIndex());
    return geometry;
  });
  // baseGeometry.dispose();

  const pool = new ObjectPool({
    maxCapacity: 35,
    initialCapacity: 35,
    create() {
      const material = ShaderManager.create({
        name: "SpawningDots",
        extensions: {
          derivatives: true,
        },
        fragmentShader: /*glsl*/ `
          varying vec2 vUv;
          uniform sampler2D map;
          uniform vec3 color;
          uniform float opacity;
          float aastep(float threshold, float value) {
            float change = fwidth(value) * 0.5;
            float lo = threshold - change;
            float hi = threshold + change;
            return clamp((value - lo) / (hi - lo), 0.0, 1.0);
          }
    
          void main () {
            // float a = aastep(0.5, texture2D(map, vUv).a);
            
            gl_FragColor.rgb = color;
            // if (!gl_FrontFacing) gl_FragColor.rgb *= 0.75;
            gl_FragColor.a = 1.0;
            // gl_FragColor.rgb *= opacity * a;
            // gl_FragColor.a = opacity * a;
            // if (gl_FragColor.a < 0.1) discard;
          }
        `,
        vertexShader: /*glsl*/ `
          varying vec2 vUv;
          void main () {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position.xyz, 1.0);
          }
        `,
        uniforms: {
          opacity: { value: 1 },
          color: { value: new THREE.Color() },
        },
        // depthTest: false,
        // depthWrite: false,
        // side: THREE.DoubleSide,
        // transparent: true,
        blending: THREE.AdditiveBlending,
      });
      const mesh = new THREE.Mesh(random.pick(geometries), material);
      const e = world.entity();
      e.add(Tags.GroundSpawningDot);

      e.add(Tags.TargetKeyTween, {
        active: false,
        duration: 2,
        ease: "sineOut",
        pauseOnModal: true,
        target: mesh.userData,
        killEntityOnFinish: false,
        assignFromOnStart: true,
        key: "tween",
      });

      mesh.userData.entity = e;
      mesh.userData.tween = 0;
      mesh.userData.size = 0.1;
      mesh.userData.speed = 0;
      mesh.userData.alpha = 1;
      mesh.userData.velocity = new THREE.Vector3();
      mesh.userData.rotationAxis = new THREE.Vector3();
      mesh.userData.rotationSpeed = 1;
      mesh.userData.rotationAngleOffset = 0;
      mesh.frustumCulled = false;
      mesh.name = "spawning-dots";
      mesh.matrixAutoUpdate = false;
      return mesh;
    },
  });

  const distThreshold = 1;
  const distThresholdSq = distThreshold * distThreshold;
  const tmpDir = new THREE.Vector3();
  const tmpPos3D = new THREE.Vector3();
  const tmp2D = [0, 0];
  const tmp3D = [0, 0, 0];
  const tmpQuatArray = [0, 0, 0, 0];
  const tmpColor = new THREE.Color();
  const target = world.findTag(Tags.UserTarget);
  const char = world.findTag(Tags.UserCharacter);
  // const nearestCell = world
  //   .findEntity(Tags.NearestEnvironmentCell)
  //   .getTag(Tags.NearestEnvironmentCell);

  let elapsed = 0;
  let minDelay = 0.1;
  let maxDelay = 0.3;
  let curDelay = minDelay;

  const initialSpawns = 5;
  for (let i = 0; i < initialSpawns; i++) {
    spawn(null, target.position, char.direction);
  }
  const env = world.view([Tags.EnvironmentState, Tags.ActiveEnvironmentState]);

  return function spawningDotsSystem(dt) {
    const name = env.length ? env[0].get(Tags.EnvironmentState).name : null;
    if (name === "tundra") return;

    const position = char.position;
    // const canMove = !Boolean(world.findTag(Tags.ModalStoppingUserMovement));
    // if (!canMove) return;

    forward(dt);

    // triggerEvents.added.forEach((e) => {
    //   const t = e.get(Tags.PoemLineTrigger);
    //   const yOffset = t.parent.get(Tags.PoemLine).yOffset;
    //   tmpPos3D.copy(t.position);
    //   tmpPos3D.y += yOffset;
    //   spawn(tmpPos3D, dir, true);
    // });

    for (let i = 0; i < meshes.length; i++) {
      const e = meshes[i];
      const tween = e.get(Tags.TargetKeyTween);
      const mesh = e.get(Tags.Object3D);
      const s = mesh.userData.tween * mesh.userData.size;
      mesh.scale.setScalar(s);
      const a = mesh.userData.tween * mesh.userData.alpha;
      const bloom = 0.75;
      mesh.material.uniforms.color.value.setRGB(
        a + bloom,
        a + bloom,
        a + bloom
      );
      mesh.material.uniforms.opacity.value = a;
      mesh.position.addScaledVector(
        mesh.userData.velocity,
        dt * mesh.userData.speed
      );
      mesh.rotateOnWorldAxis(
        mesh.userData.rotationAxis,
        mesh.userData.rotationSpeed * dt
      );
      mesh.visible = mesh.userData.tween > 1e-5;
      if (mesh.visible) {
        mesh.updateMatrix();
      }
      // mesh.userData.rotationSpeed
      if (tween.finished && mesh.userData.appearing) {
        mesh.userData.appearing = false;
        mesh.userData.killing = true;
        setAnimateTo(mesh, 0, mesh.userData.holdDelay);
      }
      if (tween.finished && mesh.userData.killing && !mesh.userData.appearing) {
        mesh.userData.killing = false;
        mesh.userData.appearing = false;
        mesh.userData.entity.remove(Tags.Object3D);
        detachObject(mesh);
        pool.release(mesh);
      }
    }
  };

  function forward(dt = 0) {
    elapsed += dt;
    if (elapsed >= curDelay) {
      elapsed %= curDelay;
      curDelay = random.range(minDelay, maxDelay);

      let cell;
      // const cell = nearestCell.value;
      // let valid = cell;
      spawn(cell, target.position, char.direction);
    }
  }

  function spawn(cell, position, direction, explode) {
    const n = explode ? random.rangeFloor(1, 5) : 1;
    for (let i = 0; i < n; i++) spawnOne(cell, position, direction, explode);
  }

  function spawnOne(cell, position, direction, explode) {
    const mesh = pool.next();
    if (mesh) {
      mesh.visible = false;
      group.add(mesh);
      mesh.userData.entity.add(Tags.Object3D, mesh);
      mesh.position.copy(position);
      if (explode) {
      } else {
        // tmpDir.copy(direction).negate();
        // tmpDir.y *= 0;
        // mesh.position.addScaledVector(tmpDir, random.range(5, 10));
      }
      let r = random.gaussian(1, 6);
      if (random.gaussian(0, 1) > 0) r += random.gaussian(0, 4);
      if (random.gaussian(0, 1) > 1) r += random.gaussian(0, 8);

      random.insideCircle(
        random.gaussian(4, 2) +
          random.range(5, 10) +
          random.gaussian(0, 2) +
          1 * r * random.gaussian(0, 2),
        tmp2D
      );
      mesh.position.x += tmp2D[0];
      mesh.position.z += tmp2D[1];
      mesh.quaternion.fromArray(random.quaternion(tmpQuatArray));
      mesh.userData.holdDelay = random.range(0.0, 1);
      mesh.position.y = random.range(0.5, 6);
      // if (!explode) mesh.position.y += random.range(2, 2);
      mesh.userData.appearing = true;
      mesh.userData.killing = false;
      mesh.userData.size = random.range(0.05, 0.1);
      // mesh.userData.size = 0.15 + 1 * Math.abs(random.gaussian(0, 0.3 / 4));

      // MathUtil.clamp(
      //   Math.abs(random.gaussian(0.1, 0.1)),
      //   0.025,
      //   0.09
      // );
      mesh.userData.speed = MathUtil.clamp(
        Math.abs(random.gaussian(0.5, 0.2)),
        0.25,
        1
      );
      mesh.userData.tween = 0;
      mesh.userData.velocity.set(0, 1, 0);
      mesh.quaternion.fromArray(random.quaternion(tmpQuatArray));
      mesh.userData.rotationAxis.fromArray(random.insideSphere(1, tmp3D));
      mesh.userData.rotationSpeed = 4;
      mesh.userData.rotationAngleOffset = random.range(-1, 1) * Math.PI * 2;
      mesh.userData.alpha = random.range(0.5, 1);
      if (explode) {
        random.insideCircle(1, tmp2D);
        tmpDir.x = tmp2D[0];
        tmpDir.y = random.range(0, 0.0);
        tmpDir.z = tmp2D[1];
        tmpDir.addScaledVector(direction, random.range(0, 1));
        tmpDir.normalize();
      } else {
        tmpDir.copy(direction);
        tmpDir.y += random.range(0, 0.5);
        tmpDir.normalize();
      }

      mesh.userData.velocity.copy(tmpDir);
      setAnimateTo(mesh, 1, explode ? 0 : random.range(0, 1));
    }
  }

  function setAnimateTo(mesh, to, delay) {
    const t = mesh.userData.entity.get(Tags.TargetKeyTween);
    t.to = to;
    t.delay = delay || 0;
    t.elapsed = 0;
    t.finished = false;
    t.started = false;
    t.active = true;
  }
}
