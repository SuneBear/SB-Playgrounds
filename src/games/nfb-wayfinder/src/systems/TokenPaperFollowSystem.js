import * as Tags from "../tags";
import * as THREE from "three";
import { InvertedTokenURLs } from "../util/tokens";
import Assets from "../util/Assets";
import * as MathUtil from "../util/math";
import Random from "../util/Random";
import SimplexNoise from "simplex-noise";
import * as ShaderManager from "../util/ShaderManager";
import { tweenTo } from "./AnimationSystem";

export default function TokenPaperFollowSystem(world) {
  const cardSavedEvents = world.listen(Tags.HaikuCardSaved);
  const collectedEvents = world.listen(Tags.HaikuInInventory);
  const waitingForPaperView = world.view(Tags.WaitingForTokenPaper);

  const floatingTokens = world.view([Tags.Object3D, Tags.FloatingToken]);
  const renderer = world.findTag(Tags.Renderer);
  const planeGeo = new THREE.PlaneGeometry(1, 1, 4, 4);
  const tmpPos3D = new THREE.Vector3();
  const tmpUserPos2D = new THREE.Vector2();
  const tmpPos2DB = new THREE.Vector2();
  const tmpOutArray3D = [0, 0, 0];
  const springDistanceThreshold = 5;
  const collisionDistanceThreshold = 2;
  const collisionDistanceThresholdSq =
    collisionDistanceThreshold * collisionDistanceThreshold;
  const random = Random();
  const noise = new SimplexNoise(random.value);

  const floatingPaperMapPromise = Assets.createGPUTexture(
    renderer,
    "image/data/floating-paper"
  );
  const floatingPaperLinesPromise = Assets.createGPUTexture(
    renderer,
    "image/data/floating-paper-lines"
  );

  const springDistanceThresholdSq =
    springDistanceThreshold * springDistanceThreshold;

  const tmpCenterPos2D = new THREE.Vector2(0, 0);
  const distFromCenter = 20;
  const distFromCenterSq = distFromCenter * distFromCenter;
  const envStateEvents = world.listen([
    Tags.EnvironmentState,
    Tags.ActiveEnvironmentState,
  ]);

  let globalScaleTween = { value: 1 };
  const finalBiomeEvents = world.listen(Tags.FinalBiomeResolution);

  const onOutroEvent = world.listen([
    Tags.EndGameState,
    Tags.ResetToCameraDrift,
  ]);

  return function tokenPaperSystem(dt) {
    const userTarget = world.findTag(Tags.UserTarget);
    const userPos = world.findTag(Tags.UserCharacter).position;
    tmpUserPos2D.set(userPos.x, userPos.z);

    if (finalBiomeEvents.added.length > 0) {
      tweenTo(world, globalScaleTween, "value", 0, 1, "sineOut", 2);
    }

    if (onOutroEvent.added.length > 0) {
      floatingTokens.forEach((e) => e.kill());
    }

    if (envStateEvents.changed) {
      floatingTokens.forEach((e) => {
        if (e.has(Tags.FloatingTokenShouldTargetTree)) {
          e.tagOff(Tags.FloatingTokenShouldTargetTree);
          e.tagOff(Tags.FloatingTokenTargetUser);
        }
      });
    }

    collectedEvents.added.forEach((e) => {
      world.entity().add(Tags.WaitingForTokenPaper);
    });

    cardSavedEvents.added.forEach(() => {
      Promise.all([floatingPaperMapPromise, floatingPaperLinesPromise]).then(
        ([bgMap, fgMap]) => {
          waitingForPaperView.forEach((e) => {
            e.remove(Tags.WaitingForTokenPaper);
            // const d = e.get(Tags.FinishedPoem);
            const icon = ""; //d.type;
            // const stanza = d.stanzaIndex;
            const url = InvertedTokenURLs[icon];
            const id = Assets.urlToID(url);

            const child = e.add(Tags.FloatingToken);
            const t = child.get(Tags.FloatingToken);
            child.tagOn(Tags.FloatingTokenTargetUser);
            t.type = icon;
            t.map = fgMap;
            const mesh = createPaperSprite(child, bgMap, t);
            mesh.position.copy(userPos);
            t.position2D.set(mesh.position.x, mesh.position.z);
            t.offsetHeight = random.range(1, 3);
            t.offset3D.fromArray(random.insideSphere(0.1, tmpOutArray3D));

            t.rotationAxis.fromArray(random.insideSphere(1, tmpOutArray3D));
            t.rotationSpeed = 1;
            t.scale = 0.45;
            t.speed = random.range(0.5, 1.5);
            t.rotationAngleOffset = random.range(-1, 1) * Math.PI * 2;
          });
        }
      );
    });

    var Cd = 0.47; // Dimensionless
    var rho = 1.22; // kg / m^3
    var radius = 15;
    var A = (Math.PI * radius * radius) / 10000; // m^2
    var ag = 9.81; // m / s^2
    var mass = 0.1;
    var restitution = -0.7;
    var maxVel = 7;
    const canTargetTree =
      world.findTag(Tags.WaitingForBiomeResolution) ||
      world.findTag(Tags.ShowBiomeResolution);
    floatingTokens.forEach((e) => {
      const d = e.get(Tags.FloatingToken);
      let targetUser =
        e.has(Tags.FloatingTokenTargetUser) &&
        !e.has(Tags.FloatingTokenShouldTargetTree);
      const mesh = e.get(Tags.Object3D);
      d.time += dt;

      // const friction = 0.99;

      if (
        targetUser &&
        d.started &&
        canTargetTree &&
        !e.has(Tags.FloatingTokenShouldTargetTree)
      ) {
        const lenSq = tmpUserPos2D.lengthSq();
        if (lenSq <= distFromCenterSq) {
          e.tagOn(Tags.FloatingTokenShouldTargetTree);
        }
      }

      tmpCenterPos2D.set(0, 0);
      const targetPos = targetUser ? tmpUserPos2D : tmpCenterPos2D;

      const distSq = d.position2D.distanceToSquared(targetPos);

      const pull = noise.noise4D(
        d.position2D.x,
        d.position2D.y,
        d.time,
        d.rotationAngleOffset
      );

      tmpPos2DB.copy(targetPos).sub(d.position2D);
      const RK = Math.sqrt(tmpPos2DB.dot(tmpPos2DB));
      const dist = Math.sqrt(distSq);

      const restingDistance = targetUser
        ? MathUtil.clamp(dist, 1, 2)
        : MathUtil.clamp(dist, 1, 2);
      const restingRatio =
        RK === 0 ? restingDistance : (restingDistance - RK) / RK;
      const p1mass = 1;
      const p2mass = 1;
      const im1 = 1.0 / p1mass;
      const im2 = 1.0 / p2mass;
      const stiffness = 0.075 + pull * 0.01;
      const scalarP1 = 0;
      const scalarP2 = stiffness;

      // d.velocity2D.addScaledVector(tmpPos2DB, scalarP1 * restingRatio);
      d.velocity2D.addScaledVector(
        tmpPos2DB,
        -scalarP2 * restingRatio * (targetUser ? d.speed : 1)
      );

      const windAngle = d.time * 0.1; //MathUtil.degToRad(45);
      const ft = 0.5;
      const fpos = 0.25;
      const windAmp = 0.1;
      const windRadius =
        windAmp *
        noise.noise3D(
          d.position2D.x * fpos,
          d.position2D.y * fpos,
          d.time * ft
        );
      d.velocity2D.x += Math.cos(windAngle) * windRadius;
      d.velocity2D.y += Math.sin(windAngle) * windRadius;

      floatingTokens.forEach((other) => {
        if (other === e) return;
        const d2 = other.get(Tags.FloatingToken);
        const distSq = d.position2D.distanceToSquared(d2.position2D);
        if (distSq <= collisionDistanceThresholdSq) {
          const dist = Math.sqrt(distSq);
          const alpha = 1 - MathUtil.clamp01(dist / collisionDistanceThreshold);
          // N dot pos
          tmpPos2DB
            .copy(d2.position2D)
            .sub(d.position2D)
            .normalize()
            .multiplyScalar(alpha);

          // tmpPos2DB.copy(d2.velocity2D).normalize();
          // const D = tmpPos2DB.dot(d.position2D);
          // tmpPos2DB.multiplyScalar(-2 * D);
          d.velocity2D.addScaledVector(tmpPos2DB, -0.2);
        }
      });

      const curMax = targetUser ? maxVel : maxVel * 2;
      d.velocity2D.x = MathUtil.clamp(d.velocity2D.x, -curMax, curMax);
      d.velocity2D.y = MathUtil.clamp(d.velocity2D.y, -curMax, curMax);

      var vx = d.velocity2D.x;
      var vy = d.velocity2D.y;
      var Fx = (-0.5 * Cd * A * rho * vx * vx * vx) / Math.abs(vx);
      var Fy = (-0.5 * Cd * A * rho * vy * vy * vy) / Math.abs(vy);
      Fx = isNaN(Fx) ? 0 : Fx;
      Fy = isNaN(Fy) ? 0 : Fy;
      // Calculate acceleration ( F = ma )
      var ax = Fx / mass;
      var ay = Fy / mass;
      // ay += ag;
      // Integrate to get velocity
      d.velocity2D.x += ax * dt;
      d.velocity2D.y += ay * dt;

      // Integrate to get position
      const speed = 0.75;
      d.position2D.x += d.velocity2D.x * dt * speed;
      d.position2D.y += d.velocity2D.y * dt * speed;

      // d.acceleration2D.addScaledVector(d.velocity2D, -friction);
      // tmpPos2DB.copy(d.acceleration2D).multiplyScalar(0.5 * (dt * dt));
      // tmpPos2DB.addScaledVector(d.velocity2D, dt);
      // d.position2D.add(tmpPos2DB);
      // d.velocity2D.addScaledVector(d.acceleration2D, dt);

      const curSpeed =
        1 + MathUtil.clamp01(d.velocity2D.length() / (maxVel / 4));
      const tf = 0.1;

      if (!targetUser) {
        d.animateToTreeTime += dt;
        const curTime = Math.max(0, d.animateToTreeTime - d.animateToTreeDelay);
        const alpha = MathUtil.clamp01(curTime / d.animateToTreeDuration);
        d.offsetY = alpha * 2;
      } else {
        d.offsetY = 0;
      }

      //0.5 * noise.noise2D(d.position2D.x * tf, d.position2D.y * tf);
      mesh.position.set(
        d.position2D.x,
        d.offsetHeight + d.offsetY,
        d.position2D.y
      );
      mesh.material.uniforms.time.value += dt * curSpeed;
      mesh.material.uniforms.timeOffset.value = d.rotationAngleOffset;
      mesh.position.addScaledVector(d.offset3D, 1);

      tmpPos2DB.copy(d.velocity2D).normalize();
      tmpPos2DB.set(-tmpPos2DB.y, tmpPos2DB.x);

      mesh.rotateOnWorldAxis(d.rotationAxis, curSpeed * d.rotationSpeed * dt);

      const f = 0.1;
      const a = 1;
      const xoff =
        a *
        noise.noise4D(
          mesh.position.x * f,
          mesh.position.y * f,
          mesh.position.z * f,
          1
        );
      const yoff =
        a *
        noise.noise4D(
          mesh.position.x * f,
          mesh.position.y * f,
          mesh.position.z * f,
          d.rotationAngleOffset
        );
      tmpPos3D.set(tmpPos2DB.x, 0, tmpPos2DB.y);
      // mesh.position.addScaledVector(tmpPos3D, xoff);
      // const scl = MathUtil.lerp(
      //   0.25,
      //   1,
      //   Math.sin(time * 0.5 + d.rotationAngleOffset) * 0.5 + 0.5
      // );
      const delay = 0.0;
      const curTime = Math.max(0, d.time - delay);
      if (curTime >= 0 && !d.started) {
        d.started = true;
        d.position2D.copy(tmpUserPos2D);
        d.velocity2D.set(0, 0);
      }
      const scl = MathUtil.clamp01(curTime / 2);
      mesh.scale.setScalar(
        Math.max(1e-5, d.scale * scl * globalScaleTween.value)
      );
      mesh.visible = scl > 1e-5;
      mesh.position.y += yoff;
      // d.position2D.add(d.velocity2D);
      // d.velocity2D.multiplyScalar(0.99);
      // tmpPos2DB.set(mesh.position.x, mesh.position.z);
      // if (
      //   tmpUserPos2D.distanceToSquared(tmpPos2DB) >= springDistanceThresholdSq
      // ) {
      //   tmpPos3D.copy(userPos);
      //   tmpPos3D.y = mesh.position.y;
      //   dampVector(mesh.position, tmpPos3D, 1, dt, mesh.position);
      // }
    });
  };

  function createPaperSprite(entity, bgMap, data) {
    const bloom = 0.1;
    const base = 1.0;
    const planeMat = ShaderManager.create({
      name: "TokenPaper",
      uniforms: {
        color: {
          value: new THREE.Color(base + bloom, base + bloom, base + bloom),
        },
        map: { value: data.map },
        backgroundMap: { value: bgMap },
        mapScale: { value: 1.25 },
        time: { value: 0 },
        opacity: { value: 1 },
        timeOffset: { value: 1 },
      },
      side: THREE.DoubleSide,
      blending: THREE.CustomBlending,
      blendEquation: THREE.AddEquation,
      blendSrc: THREE.OneFactor,
      blendDst: THREE.OneMinusSrcAlphaFactor,

      transparent: true,
      vertexShader: /*glsl*/ `
        varying vec2 vUv;
        uniform float mapScale;
        uniform float timeOffset;
        uniform float time;

        mat3 rotation3dY(float angle) {
        	float s = sin(angle);
        	float c = cos(angle);

        	return mat3(
        		c, 0.0, -s,
        		0.0, 1.0, 0.0,
        		s, 0.0, c
        	);
        }

        void main () {
          vec2 nuv = uv * 2.0 - 1.0;
          nuv *= mapScale;
          vUv = nuv * 0.5 + 0.5;
          vec3 transformed = position.xyz;
          float angle = sin(time + timeOffset + position.x);
          transformed *= rotation3dY(angle);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
        }
      `,
      fragmentShader: /*glsl*/ `
        varying vec2 vUv;
        uniform sampler2D map;
        uniform sampler2D backgroundMap;
        uniform float opacity;
        uniform vec3 color;

        vec4 blend(vec4 background, vec4 foreground) {
            return (foreground.rgba * foreground.a) + background.rgba * (1.0 - foreground.a);
        }

        void main () {
          vec3 curColor = vec3(color);

          vec4 outColor = texture2D(backgroundMap, vUv) * vec4(color, 1.0);
          // vec4 outColor = vec4(color, 1.0);
          vec4 fgColor = texture2D(map, vUv);
          
          // outColor.rgb *= 1.0 - fgColor.a;
          // outColor = blend(outColor, fgColor);
          gl_FragColor = vec4(outColor);
          gl_FragColor.a *= opacity;
          // if (gl_FragColor.a <= 0.1) discard;
        }
      `,
    });
    const mesh = new THREE.Mesh(planeGeo, planeMat);
    mesh.scale.setScalar(1);
    entity.add(Tags.Object3D, mesh);
    return mesh;
  }
}
