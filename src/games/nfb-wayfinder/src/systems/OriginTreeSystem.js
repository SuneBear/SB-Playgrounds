import * as Tags from "../tags";
import * as THREE from "three";
import * as MathUtil from "../util/math";
import Random from "../util/Random";
import Assets from "../util/Assets";
import * as ShaderManager from "../util/ShaderManager";
import { newArray } from "../util/array";
import queryString from "../util/query-string";
import { setPlayerPos } from "../util/resetPlayerPos";

function PhysicsBody() {
  this.position = new THREE.Vector3(0, 0, 0);
  this.velocity = new THREE.Vector3(0, 0, 0);
  this.lastPosition = new THREE.Vector3(0, 0, 0);
  this.speed = 1;
  this.scale = 1;
  this.timeScale = 1;
  this.currentRotation = new THREE.Quaternion(0, 0, 0, 0);
  this.spinRotation = new THREE.Quaternion(0, 0, 0, 0);
  // this.targetRotation = new THREE.Quaternion(0, 0, 0, 0);
  this.flatRotation = new THREE.Quaternion(0, 0, 0, 0);
  this.rotationAxis = new THREE.Vector3(0, 0, 0);
  this.rotationSpeed = 1;
  this.rotationAngleOffset = 0;
}

export default function OriginTreeSystem(world) {
  const random = Random();
  const tmpArray2 = [0, 0];
  const tmpVec3 = new THREE.Vector3(0, 0, 0);
  const tmpReflect3 = new THREE.Vector3(0, 0, 0);
  const tmpArr3 = [0, 0, 0];
  const renderer = world.findTag(Tags.Renderer);
  const anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const [leaf] = Assets.createGPUTextureTask(renderer, "image/ui/ico_about", {
    anisotropy,
  });
  const tmpQuat = new THREE.Quaternion(0, 0, 0, 1);
  const floorRotation = new THREE.Quaternion(0, 0, 0, 1);
  floorRotation.setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0));
  const N = 1000;
  const parentGroup = new THREE.Group();
  const velocityThreshold = 0.05;
  const newCooldownDelay = () => random.range(0.1, 0.3);
  let hitCooldownDelay = newCooldownDelay();
  let hitCooldownTime = 0;

  const geometry = new THREE.PlaneBufferGeometry(1, 1, 4, 4);
  // geometry.rotateX(-Math.PI / 2);
  const instancedBufferGeom = new THREE.InstancedBufferGeometry();
  instancedBufferGeom.instanceCount = N;
  instancedBufferGeom.setAttribute(
    "position",
    geometry.getAttribute("position")
  );
  instancedBufferGeom.setAttribute("normal", geometry.getAttribute("normal"));
  instancedBufferGeom.setAttribute("uv", geometry.getAttribute("uv"));
  instancedBufferGeom.setIndex(geometry.getIndex());

  /*
  Per-instance stats:
  - Position3D
  - Quaternion4D
  - Color
  - Scale 1f
  - 3 + 4 + 3 + 1
  - 11 floats per instance
  Dynamic: position3, quaternion4
  - 7K floats need updating per frame

  Static: color3, scale1f
  */

  const buf_position = new Float32Array(3 * N);
  const buf_rotation = new Float32Array(4 * N);
  const buf_color = new Float32Array(3 * N);
  const buf_scaleAndTimeOffset = new Float32Array(2 * N);
  const tmpQuaternion = new THREE.Quaternion();

  const minY = 0.1;
  const spriteRadius = 0.1;
  const color = new THREE.Color();
  const baseColor = new THREE.Color("hsl(40, 100%, 50%)");
  const bodies = newArray(N).map((_, i) => {
    color
      .copy(baseColor)
      .offsetHSL(
        random.range(-1, 1) * (5 / 360),
        random.range(-1, 0) * (5 / 100),
        random.range(-1, 1) * (10 / 100)
      );
    color.r = MathUtil.clamp(color.r, 0, 1);
    color.g = MathUtil.clamp(color.g, 0, 1);
    color.b = MathUtil.clamp(color.b, 0, 1);
    const curTime = random.range(0, N);
    // const material = createMaterial({
    //   minY,
    //   spriteRadius,
    //   map: leaf,
    //   time: curTime,
    //   timeOffset: curTime,
    //   // blending: THREE.CustomBlending,
    //   // blendEquation: THREE.AddEquation,
    //   // blendSrc: THREE.OneFactor,
    //   // blendDst: THREE.OneMinusSrcAlphaFactor,
    //   color,
    //   side: THREE.DoubleSide,
    //   // transparent: true,
    // });
    const r = 7;
    const [x, z] = random.onCircle(random.gaussian(r, 2), tmpArray2);
    // const [x, y, z] = random.insideSphere(r, tmpArr3);
    // const mesh = new THREE.Mesh(geometry, material);
    // parentGroup.add(mesh);
    // mesh.frustumCulled = false;
    // mesh.matrixAutoUpdate = false;
    // const e = world
    //   .entity()
    //   .add(Tags.Object3D, mesh)
    //   .add(Tags.GroundPhysicsBody);
    // const body = e.get(Tags.GroundPhysicsBody);
    const body = new PhysicsBody();
    body.timeScale = random.range(1, 1);
    body.position.set(x, random.range(0, 4), z);
    body.rotationAxis.fromArray(random.insideSphere(1, tmpArr3));
    body.rotationAngleOffset = random.range(-1, 1) * Math.PI * 2;
    body.rotationSpeed = random.range(0.1, 1);
    const euler = new THREE.Euler(0, 0, 0);
    euler.x = -Math.PI / 2 + random.range(-1, 1) * 0.1;
    euler.z = random.range(-1, 1) * Math.PI * 2;
    tmpQuaternion.setFromEuler(euler);
    body.spinRotation.copy(tmpQuaternion);
    body.flatRotation.copy(tmpQuaternion);
    // body.targetRotation.copy(tmpQuaternion);
    body.currentRotation.copy(tmpQuaternion);
    body.speed = random.range(0.5, 1.5);
    body.scale = Math.abs(random.gaussian(0.75, 0.1));

    body.velocity
      .copy(body.position)
      .normalize()
      .multiplyScalar(random.gaussian(1, 1 / 4));
    // mesh.userData.entity = e;
    // mesh.visible = false;

    buf_color[i * 3 + 0] = color.r;
    buf_color[i * 3 + 1] = color.g;
    buf_color[i * 3 + 2] = color.b;
    buf_scaleAndTimeOffset[i * 2 + 0] = body.scale;
    buf_scaleAndTimeOffset[i * 2 + 1] = curTime;

    return {
      // mesh,
      body,
    };
  });

  instancedBufferGeom.setAttribute(
    "instanceColor",
    new THREE.InstancedBufferAttribute(buf_color, 3)
  );
  const instancePosition = new THREE.InstancedBufferAttribute(buf_position, 3);
  instancedBufferGeom.setAttribute("instancePosition", instancePosition);
  const instanceRotation = new THREE.InstancedBufferAttribute(buf_rotation, 4);
  instancedBufferGeom.setAttribute("instanceRotation", instanceRotation);
  instancedBufferGeom.setAttribute(
    "instanceScaleAndTime",
    new THREE.InstancedBufferAttribute(buf_scaleAndTimeOffset, 2)
  );

  const material = createMaterial({
    minY,
    spriteRadius,
    map: leaf,
    time: 0,
    timeOffset: 0,
    side: THREE.DoubleSide,
  });

  const instanceMesh = new THREE.Mesh(instancedBufferGeom, material);
  parentGroup.add(instanceMesh);
  parentGroup.name = "origin-tree-leaves";
  instanceMesh.frustumCulled = false;

  var Cd = 0.47; // Dimensionless
  var rho = 1.22; // kg / m^3
  var radius = 15;
  var A = (Math.PI * radius * radius) / 10000; // m^2
  var gravity = -9.81 * 0.1; // m / s^2
  var mass = 0.05;
  var restitution = -0.7;
  var maxVel = 4;
  const kickStrength = new THREE.Vector3(1, 1, 1);
  const EPSILON = 0.000001;
  const visibleDistanceMin = 40;
  const visibleDistanceMax = 45;
  // const visibleDistanceSq = visibleDistance * visibleDistance;
  // const bodies = world.view([Tags.Object3D, Tags.GroundPhysicsBody]);

  const parentEntity = world.entity();
  parentEntity.add(Tags.Object3D, parentGroup);
  const hitSoundEntity = world.entity();

  let fadeTime = 0;
  let fadeDuration = 2;

  return function originTreeSystem(dt) {
    if (!world.findTag(Tags.AppState).ready) return;
    const isStopping = world.findTag(Tags.CameraStopUserMovement);

    let hasHitAudio = false;
    if (hitSoundEntity.has(Tags.UserHitAudioTrigger)) {
      hasHitAudio = true;
      hitCooldownTime += dt;
      if (hitCooldownTime >= hitCooldownDelay) {
        hasHitAudio = false;
        hitCooldownTime %= hitCooldownDelay;
        hitCooldownDelay = newCooldownDelay();
        hitSoundEntity.remove(Tags.UserHitAudioTrigger);
      }
    }

    const user = world.findTag(Tags.UserCharacter);
    const userTarget = world.findTag(Tags.UserTarget);
    const userPos = user.position;
    const userVel = user.velocity;

    const userVelLengthSq = userVel.lengthSq();
    const userVelLength = Math.sqrt(userVelLengthSq);
    const hitDist = 2;
    const hitDistSq = hitDist * hitDist;

    const userDist = userTarget.position.length();
    const visibleSize =
      1 -
      MathUtil.clamp01(
        MathUtil.smoothstep(visibleDistanceMin, visibleDistanceMax, userDist)
      );

    let isVisible = true;
    if (userDist >= visibleDistanceMax) {
      if (parentEntity.has(Tags.Object3D)) parentEntity.remove(Tags.Object3D);
      isVisible = false;
    } else {
      if (!parentEntity.has(Tags.Object3D))
        parentEntity.add(Tags.Object3D, parentGroup);
    }

    let audibleHits = 0;

    let resolving = world.findTag(Tags.FinalBiomeResolution);
    if (resolving) {
      fadeTime += dt;
      material.uniforms.fadeAway.value = -2 + fadeTime;
    } else {
      material.uniforms.fadeAway.value = 0;
    }

    for (let i = 0; isVisible && i < bodies.length; i++) {
      const e = bodies[i];
      const d = e.body;

      // apply user forces
      if (!isStopping && userVelLengthSq > EPSILON) {
        const distSq = d.position.distanceToSquared(userPos);
        if (distSq <= hitDistSq) {
          if (userVelLength > velocityThreshold && !hasHitAudio) {
            audibleHits++;
          }
          const dist = Math.sqrt(distSq);
          const alpha = 1 - MathUtil.clamp01(dist / hitDist);
          d.velocity.x += userVel.x * kickStrength.x;
          d.velocity.z += userVel.z * kickStrength.z;

          if (d.position.y - spriteRadius <= minY + EPSILON) {
            d.position.y = minY + EPSILON + spriteRadius;
          }
          const invLerp = MathUtil.clamp01(
            MathUtil.inverseLerp(minY, 1, d.position.y - spriteRadius)
          );
          const heightStr = 1 - invLerp;
          d.velocity.y +=
            random.range(0, 1) * kickStrength.y * userVelLength * heightStr;

          tmpVec3.fromArray(random.insideSphere(1, tmpArr3));
          d.velocity.addScaledVector(tmpVec3, random.range(0.5, 1));
        }
      }

      // clamp velocity
      d.velocity.x = MathUtil.clamp(d.velocity.x, -maxVel, maxVel);
      d.velocity.y = MathUtil.clamp(d.velocity.y, -maxVel, maxVel);
      d.velocity.z = MathUtil.clamp(d.velocity.z, -maxVel, maxVel);

      // now test against floor bounce
      let hit = false;
      if (d.position.y - spriteRadius < minY) {
        hit = true;
        d.position.y = minY + spriteRadius + EPSILON;
      }

      if (hit) {
        // bounce against ground
        const len2 = d.velocity.lengthSq();
        if (len2 > EPSILON) {
          // only bounce if moving enough
          const m = Math.sqrt(len2);
          // scale reflection by magnitude
          tmpReflect3.set(1, -1, 1);
          const friction = 0.25;
          tmpReflect3.multiplyScalar(m * friction);

          // normalize the velocity
          if (m !== 0) {
            d.velocity.divideScalar(m);
          }
          // bounce velocity back
          d.velocity.multiply(tmpReflect3);
        }
      }

      var vx = d.velocity.x;
      var vy = d.velocity.y;
      var vz = d.velocity.z;
      var Fx = (-0.5 * Cd * A * rho * vx * vx * vx) / Math.abs(vx);
      var Fy = (-0.5 * Cd * A * rho * vy * vy * vy) / Math.abs(vy);
      var Fz = (-0.5 * Cd * A * rho * vz * vz * vz) / Math.abs(vz);
      Fx = isNaN(Fx) ? 0 : Fx;
      Fy = isNaN(Fy) ? 0 : Fy;
      Fz = isNaN(Fz) ? 0 : Fz;
      // Calculate acceleration ( F = ma )
      var ax = Fx / mass;
      var ay = Fy / mass;
      var az = Fz / mass;
      ay += gravity;
      // Integrate to get velocity
      d.velocity.x += ax * dt;
      d.velocity.y += ay * dt;
      d.velocity.z += az * dt;

      // Integrate to get position
      const speed = d.speed;
      d.position.x += d.velocity.x * dt * speed;
      d.position.y += d.velocity.y * dt * speed;
      d.position.z += d.velocity.z * dt * speed;

      const curSpeed = MathUtil.clamp(d.velocity.length() / 0.1, 0, 7.5);

      // 1 = on floor, 0 = off floor
      const floorProximity =
        1 -
        MathUtil.clamp01(
          MathUtil.inverseLerp(minY, 0.5, d.position.y - spriteRadius)
        );

      // apply world rotation to current
      tmpQuat.setFromAxisAngle(d.rotationAxis, curSpeed * d.rotationSpeed * dt);
      d.spinRotation.premultiply(tmpQuat);
      d.spinRotation.slerp(d.flatRotation, floorProximity * 0.5);
      d.currentRotation.copy(d.spinRotation);

      buf_position[i * 3 + 0] = d.position.x;
      buf_position[i * 3 + 1] = d.position.y;
      buf_position[i * 3 + 2] = d.position.z;

      buf_rotation[i * 4 + 0] = d.currentRotation.x;
      buf_rotation[i * 4 + 1] = d.currentRotation.y;
      buf_rotation[i * 4 + 2] = d.currentRotation.z;
      buf_rotation[i * 4 + 3] = d.currentRotation.w;
    }

    if (isVisible) {
      instanceRotation.needsUpdate = true;
      instancePosition.needsUpdate = true;

      material.uniforms.time.value += dt;
      material.uniforms.globalScale.value = visibleSize;
    }

    instanceMesh.visible = isVisible;

    if (audibleHits > 5) {
      hasHitAudio = true;
      if (!hitSoundEntity.has(Tags.UserHitAudioTrigger)) {
        hitSoundEntity.add(Tags.UserHitAudioTrigger);
        const audioData = hitSoundEntity.get(Tags.UserHitAudioTrigger);
        audioData.type = "leaf";
      }
      // console.log("audio hits", audibleHits);
    }
  };

  function createMaterial(opts = {}) {
    const {
      map,
      color = "white",
      opacity = 1,
      timeOffset = 0,
      time = 0,
      minY,
      spriteRadius,
    } = opts;
    opts = { ...opts };
    delete opts.time;
    delete opts.opacity;
    delete opts.color;
    delete opts.map;
    delete opts.spriteRadius;
    delete opts.minY;
    delete opts.timeOffset;
    return ShaderManager.create({
      name: "origin-tree-leaves",
      uniforms: {
        color: {
          value: new THREE.Color(color),
        },
        map: { value: map },
        time: { value: time },
        globalScale: { value: 1 },
        opacity: { value: opacity },
        straighten: { value: 0 },
        minY: { value: minY },
        spriteRadius: { value: spriteRadius },
        fadeAway: { value: 0 },
        timeOffset: { value: timeOffset },
      },
      ...opts,
      // blending: THREE.CustomBlending,
      // blendEquation: THREE.AddEquation,
      // blendSrc: THREE.OneFactor,
      // blendDst: THREE.OneMinusSrcAlphaFactor,
      vertexShader: /*glsl*/ `
        attribute vec3 instancePosition;
        attribute vec4 instanceRotation;
        attribute vec3 instanceColor;
        attribute vec2 instanceScaleAndTime;
        varying vec2 vUv;
        varying vec3 vNormal;
        uniform float mapScale;
        // uniform float timeOffset;
        uniform float time;
        // uniform float straighten;
        varying float vStraighten;
        uniform float globalScale;
        uniform float spriteRadius;
        uniform float minY;
        uniform float fadeAway;
        varying vec3 vColor;

        mat3 rotation3dY(float angle) {
        	float s = sin(angle);
        	float c = cos(angle);

        	return mat3(
        		c, 0.0, -s,
        		0.0, 1.0, 0.0,
        		s, 0.0, c
        	);
        }

        float invLerp (float minV, float maxV, float t) {
          return (t - minV) / (maxV - minV);
        }

        vec3 rotate_vector( vec4 quat, vec3 vec ) {
          return vec + 2.0 * cross( cross( vec, quat.xyz ) + quat.w * vec, quat.xyz );
        }

        float ease (float t) {
          return 1.0 - pow(2.0, -10.0 * t);
        }

        // http://www.geeks3d.com/20141201/how-to-rotate-a-vertex-by-a-quaternion-in-glsl/,
        vec3 applyTRS( vec3 position, vec3 translation, vec4 quaternion, vec3 scale ) {
        	position *= scale;
        	position += 2.0 * cross( quaternion.xyz, cross( quaternion.xyz, position ) + quaternion.w * position );
        	return position + translation;
        }

        void main () {
          vUv = uv;
          vec3 transformed = position.xyz;
          
          vColor = instanceColor;
          vec3 worldCenter = (modelMatrix * vec4(vec3(instancePosition), 1.0)).xyz;

          float straighten = 1.0 - clamp(invLerp(minY, 1.0, worldCenter.y - spriteRadius), 0.0, 1.0);
          vStraighten = straighten;

          float timeOffset = instanceScaleAndTime.y;
          float angle = 3.14 * sin(time + timeOffset + position.x);
          transformed *= rotation3dY(angle * (1.0 - straighten));

          vec3 transformedNormal = normal;
          vec4 invQuat = vec4(-instanceRotation.xyz, instanceRotation.w);
          float nAngle = (3.14 / -1.0 + 3.14 * sin(position.x)) * (1.0 - straighten);
          transformedNormal = normalize(transformedNormal * rotation3dY(nAngle));
          transformedNormal = normalize(rotate_vector(invQuat, transformedNormal));
          transformedNormal = normalize(normalMatrix * transformedNormal);

          vNormal = transformedNormal;

          float dFromCenter = 1.0 - length(instancePosition.xz) / 20.0;
          float disappear = 1.0 - min(1.0, ease(max(fadeAway - dFromCenter * 2.0, 0.0) / (4.0)));
          transformed = applyTRS(transformed, instancePosition, instanceRotation, vec3(disappear * globalScale * instanceScaleAndTime.x));

          gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
        }
      `,
      fragmentShader: /*glsl*/ `
        varying vec2 vUv;
        varying float vStraighten;
        varying vec3 vNormal;
        varying vec3 vColor;
        uniform sampler2D map;
        uniform float opacity;
        // uniform vec3 color;
        void main () {
          gl_FragColor = vec4(vColor, opacity) * texture2D(map, vUv);
          // gl_FragColor.rgb *= 1.0 - (1.0 - (vNormal.y * 0.5 + 0.5)) * 0.25;
          // gl_FragColor.rgb += (1.0 - (vNormal.y * 0.5 + 0.5)) * 1.0 * (1.0 - vStraighten);
          float grad = (1.0 - (vNormal.y * 0.5 + 0.5));
          gl_FragColor.rgb += (1.0 - vStraighten) * 0.25 + grad * 0.5;
          if (!gl_FrontFacing) gl_FragColor.rgb *= 0.5;

          // gl_FragColor = vec4(vec3((1.0-(vNormal.y * 0.5 + 0.5))), 1.0);
          // gl_FragColor = vec4(vec3(vNormal.y * 0.5 + 0.5), 1.0);
          if (gl_FragColor.a < 0.5) discard;
        }
      `,
    });
  }
}
