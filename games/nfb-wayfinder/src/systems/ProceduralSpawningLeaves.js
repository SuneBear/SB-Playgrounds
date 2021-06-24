import * as Tags from "../tags";
import * as THREE from "three";
import ObjectPool from "../util/ObjectPool";
import Random from "../util/Random";
import * as MathUtil from "../util/math";
import * as ShaderManager from "../util/ShaderManager";
import { setEntityTweenFromTo } from "./AnimationSystem";
import brushUrl from "../assets/textures/brush-stroke-sdf.png";
import { loadTexture } from "../util/load";
import Assets from "../util/Assets";

export default async function ProceduralSpawningLeaves(world) {
  // const brushMap = await loadTexture(brushUrl, {
  //   minFilter: THREE.LinearFilter,
  //   generateMipmaps: false,
  // });

  const group = new THREE.Group();
  world.entity().add(Tags.Object3D, group);

  const brushIds = {
    forest: "image/data/ground-spawn-forest",
    grasslands: "image/data/ground-spawn-grasslands",
    tundra: "image/data/ground-spawn-tundra",
  };
  const renderer = world.findTag(Tags.Renderer);

  let currentBrushId;
  const brushMap = new THREE.Texture();

  const meshes = world.view([Tags.Object3D, Tags.GroundSpawningLeaf]);
  const triggerEvents = world.listen(Tags.PoemLineTriggerActivated);

  const geometry = new THREE.PlaneGeometry(1, 1, 5, 5);
  geometry.vertices.forEach((v) => {
    const t = v.x * 2 * 0.5 + 0.5;
    // const side = Math.sign(v.x);
    // v.x *= Math.sin(t * Math.PI) * 1;
    v.z = Math.sin(t * Math.PI) * 0.2;
    // v.x = Math.sin(t * Math.PI) * side * 0.5;
  });
  // geometry.scale(6, 6, 6);
  //new THREE.TetrahedronGeometry(1, 0);
  const pool = new ObjectPool({
    maxCapacity: 50,
    initialCapacity: 50,
    create() {
      const mesh = new THREE.Mesh(
        geometry,
        ShaderManager.create({
          name: "SpawningLeaves",
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
              float a = aastep(0.5, texture2D(map, vUv).a);
              gl_FragColor.rgb = color;
              if (!gl_FrontFacing) gl_FragColor.rgb *= 0.75;
              gl_FragColor.a = 1.0;
              // gl_FragColor.rgb *= opacity * a;
              gl_FragColor.a = opacity * a;
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
            map: { value: brushMap },
            opacity: { value: 1 },
            color: { value: new THREE.Color() },
          },
          // depthTest: false,
          // depthWrite: false,
          side: THREE.DoubleSide,
          transparent: true,
          // blending: THREE.CustomBlending,
          // blendEquation: THREE.AddEquation,
          // blendSrc: THREE.OneFactor,
          // blendDst: THREE.OneMinusSrcAlphaFactor,
          // blending: THREE.AdditiveBlending,
        })
      );
      const e = world.entity();
      e.add(Tags.GroundSpawningLeaf);

      e.add(Tags.TargetKeyTween, {
        active: false,
        duration: 1,
        ease: "expoOut",
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
      mesh.name = "spawning-leaves";
      mesh.frustumCulled = false;
      mesh.matrixAutoUpdate = false;
      return mesh;
    },
  });

  let lastPosition = new THREE.Vector3();
  let useFlowerColors = false;
  // const flowerHueBases = [16, 48, 210, 245, 282, 324];
  const flowerHueBases = [216];
  const distThreshold = 0.5;
  const distThresholdSq = distThreshold * distThreshold;
  const tmpDir = new THREE.Vector3();
  const tmpPos3D = new THREE.Vector3();
  const tmp2D = [0, 0];
  const tmp3D = [0, 0, 0];
  const tmpQuatArray = [0, 0, 0, 0];
  const random = Random();
  const envData = world.findTag(Tags.EnvironmentState);
  const tmpColor = new THREE.Color();
  // const nearestCell = world
  //   .findEntity(Tags.NearestEnvironmentCell)
  //   .getTag(Tags.NearestEnvironmentCell);

  const char = world.findTag(Tags.UserCharacter);
  const target = world.findTag(Tags.UserTarget);
  const environment = world.view([
    Tags.ActiveEnvironmentState,
    Tags.EnvironmentState,
  ]);
  let elapsed = 0;
  let minDelay = 0.1;
  let maxDelay = 0.3;
  let curDelay = minDelay;

  const tbloom = 0.5;
  const fixedColors = {
    tundra: new THREE.Color(
      206 / 255 + tbloom,
      215 / 255 + tbloom,
      219 / 255 + tbloom
    ),
  };
  let lastEnv = null;
  let fixedColor = null;

  return function spawningLeavesSystem(dt) {
    const position = char.position;
    const dir = char.direction;
    const canMove = !Boolean(world.findTag(Tags.ModalStoppingUserMovement));
    if (!canMove) return;
    // const worldSize = 1;

    let newEnv = null;
    if (environment.length > 0) {
      const state = environment[0].get(Tags.EnvironmentState);
      newEnv = state.name;
    }

    let worldSize = newEnv === "tundra" ? 0.75 : 1;

    if (newEnv !== lastEnv) {
      let newId = brushIds[newEnv];
      // useFlowerColors = state.name === "tundra";
      if (currentBrushId !== newId) {
        currentBrushId = newId;
        // dynamically swap LUT maps as needed
        Assets.loadGPUTexture(renderer, brushMap, currentBrushId);
      }

      fixedColor = fixedColors[newEnv];

      lastEnv = newEnv;
    }

    // const world1TweenTag = world.findTag(Tags.WorldTweens);
    // if (world1TweenTag) {
    //   worldSize = world1TweenTag[1];
    // }
    // const worldSize = 1 - world.findTag(Tags.WorldTween0);

    // elapsed += dt;
    // if (elapsed >= curDelay) {
    //   elapsed %= curDelay;
    //   curDelay = random.range(minDelay, maxDelay);

    //   const cell = nearestCell.value;
    //   let valid = cell && cell.spawnLeaves;
    //   if (valid) spawn(cell, position, dir);
    // }

    const underPlayer = world.findTag(Tags.EnvironmentUnderPlayerState);
    const canSpawn = underPlayer ? !underPlayer.water : true;

    if (
      canSpawn &&
      environment.length &&
      (!lastPosition ||
        position.distanceToSquared(lastPosition) >= distThresholdSq)
    ) {
      if (!lastPosition) lastPosition = new THREE.Vector3();

      // const cell = nearestCell.value;
      const envState = environment[0].get(Tags.EnvironmentState);
      const cell = envState.grid.getCellAt(position.x, position.z);
      if (cell) spawn(envState, cell, position, dir);

      lastPosition.copy(position);
    }

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
      const s = mesh.userData.tween * mesh.userData.size * worldSize;
      mesh.visible = mesh.userData.tween > 1e-5;
      if (mesh.visible) {
        mesh.scale.setScalar(s);
        const a = mesh.userData.tween * mesh.userData.alpha;
        // mesh.material.uniforms.color.value.setRGB(a, a, a);
        mesh.material.uniforms.opacity.value = a;
        mesh.position.addScaledVector(
          mesh.userData.velocity,
          dt * mesh.userData.speed
        );
        mesh.rotateOnWorldAxis(
          mesh.userData.rotationAxis,
          mesh.userData.rotationSpeed * dt
        );
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
        group.remove(mesh);
        mesh.userData.entity.remove(Tags.Object3D);
        pool.release(mesh);
      }
    }
  };

  function spawn(envState, cell, position, direction, explode) {
    const n = explode ? random.rangeFloor(1, 5) : 2;
    for (let i = 0; i < n; i++)
      spawnOne(envState, cell, position, direction, explode);
  }

  function spawnOne(envState, cell, position, direction, explode) {
    let curColor;
    if (fixedColor) {
      curColor = fixedColor;
    } else if (useFlowerColors) {
      curColor = tmpColor.setHSL(
        random.pick(flowerHueBases) / 360,
        random.range(0.45, 0.75),
        random.range(0.45, 0.65)
      );
    } else {
      const obj = envState.colors[cell.colorIndex % envState.colors.length];
      curColor = obj ? obj.color : null;
    }
    if (!curColor) return;

    const mesh = pool.next();
    if (mesh) {
      mesh.visible = false;
      group.add(mesh);
      mesh.userData.entity.add(Tags.Object3D, mesh);
      mesh.position.copy(position);
      // if (explode) {
      // } else {
      //   tmpDir.copy(direction).negate();
      //   tmpDir.y *= 0;
      //   mesh.position.addScaledVector(tmpDir, random.range(0, 10));
      // }
      // let r = random.gaussian(1, 3);
      // if (random.gaussian(0, 1) > 0) r += random.gaussian(0, 4);
      // if (random.gaussian(0, 1) > 1) r += random.gaussian(0, 8);

      let r = random.gaussian(1, 6);
      if (random.gaussian(0, 1) > 0) r += random.gaussian(0, 4);
      if (random.gaussian(0, 1) > 1) r += random.gaussian(0, 8);

      random.insideCircle(
        random.range(1, 1) +
          random.gaussian(0, 2) +
          1 * r * random.gaussian(0, 2),
        tmp2D
      );
      mesh.position.x += tmp2D[0];
      mesh.position.z += tmp2D[1];

      if (cell) {
        mesh.material.uniforms.color.value
          .set(curColor)
          .offsetHSL(
            (random.range(-1, 1) * 20) / 360,
            random.range(0, 0.25),
            random.range(0, 0.25)
          );
      } else {
        // mesh.material.uniforms.color.value.setRGB(1, 1, 1);
      }
      mesh.quaternion.fromArray(random.quaternion(tmpQuatArray));
      if (!explode) {
        // random.insideCircle(
        //   random.gaussian(0, 2) + 0.1 * r * random.gaussian(0, 2),
        //   tmp2D
        // );
        // mesh.position.x += tmp2D[0];
        // mesh.position.z += tmp2D[1];
        // random.insideCircle(10, tmp2D);
        // mesh.position.x += tmp2D[0];
        // mesh.position.z += tmp2D[1];
      }
      mesh.userData.holdDelay = random.range(0.0, 2);
      if (!explode) mesh.position.y = Math.abs(random.gaussian(0.25, 1));
      mesh.userData.appearing = true;
      mesh.userData.killing = false;
      mesh.userData.size =
        (0.15 + 2 * Math.abs(random.gaussian(0, 0.3 / 4))) * 1.1;
      // mesh.userData.size = 0.15 + 2 * Math.abs(random.gaussian(0, 0.3 / 4));

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
      mesh.userData.alpha = 1; //random.range(0.5, 1);
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
      setAnimateTo(mesh, 1, explode ? 0 : random.range(0, 0.0));
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
