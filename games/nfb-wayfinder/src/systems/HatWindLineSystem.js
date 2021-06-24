import * as Tags from "../tags";
import * as THREE from "three";
import * as MathUtil from "../util/math";
import Line3D from "./writing/Line3D";
import ObjectPool from "../util/ObjectPool";
import Random from "../util/Random";

class Sample {
  constructor() {
    this.position = [0, 0, 0];
    this.velocity = [0, 0, 0];
    this.index = 0;
  }
  reset() {
    this.index = 0;
    this.position[0] = 0;
    this.position[1] = 0;
    this.position[2] = 0;
    this.velocity[0] = 0;
    this.velocity[1] = 0;
    this.velocity[2] = 0;
  }
}

export default function HatWindLineSystem(world) {
  const samplePool = new ObjectPool({
    name: "HatWindLineSamples",
    initialCapacity: 120,
    create() {
      return new Sample();
    },
    renew(s) {
      s.reset();
      return s;
    },
  });

  const pool = new ObjectPool({
    name: "HatWindLines",
    initialCapacity: 3,
    create() {
      const m = new Line3D(world, {
        taper: true,
        thickness: 0.1,
        bloom: 0,
      });
      m.userData.path = [];
      m.userData.lastPosition = new THREE.Vector3();
      m.userData.velocity = new THREE.Vector3();
      m.userData.hasLastPosition = false;
      m.userData.entity = null;
      m.userData.time = 0;
      m.userData.delay = 0.25;
      m.userData.duration = 1;
      // m.material.uniforms.smoothen.value = true;
      m.name = "hat-tip-line";
      return m;
    },
    renew(m) {
      const entity = world.entity();
      entity.add(Tags.Object3D, m).add(Tags.HatTipWindLineTag);
      m.userData.entity = entity;
      m.userData.time = 0;
      m.userData.delay = 0.25;
      m.userData.duration = 1;
      m.userData.velocity.set(0, 0, 0);
      m.position.set(0, 0, 0);
      return m;
    },
    release(m) {
      if (m.userData.entity) {
        m.userData.entity.kill();
        m.userData.entity = null;
      }
      m.userData.hasLastPosition = false;
      m.userData.path.length = 0;
    },
  });

  const hatTipView = world.view(Tags.HatTipPoint);
  const windLineView = world.view(Tags.HatTipWindLineTag);
  const activeLineView = world.view(Tags.WrittenStanzaLineActive);

  let currentLine = null;
  let drawing = false;
  let turnSum = 0;
  let lastAngle = null;

  let windTime = 0;

  const random = Random();
  const newDrawDuration = () => random.range(0.5, 1);
  const newDelayDuration = () => random.range(0.1, 0.1);
  let drawDuration = newDrawDuration();
  let timeDelay = newDelayDuration();
  let timer = 0;
  const zero3 = [0, 0, 0];

  const maxSamples = 50;
  let angleEnergyRollingAverage = 0;
  let lastPlanePosition = null;

  const currentEnvView = world.view(Tags.ActiveEnvironmentState);

  return function hatWindLineSystem(dt) {
    windTime += dt;
    const user = world.findTag(Tags.UserCharacter);
    const target = world.findTag(Tags.UserTarget);
    const angle = Math.atan2(user.direction.z, user.direction.x);
    const userVelLength = user.velocity.length();

    if (lastAngle != null) {
      const sumTheta = Math.abs(MathUtil.deltaAngle(angle, lastAngle));
      const sum = MathUtil.radToDeg(sumTheta);

      const N = 5;
      angleEnergyRollingAverage -= angleEnergyRollingAverage / N;
      angleEnergyRollingAverage += sum / N;

      if (drawing && angleEnergyRollingAverage < 1) {
        if (timer >= drawDuration / 2) {
          drawing = false;
          drawDuration = newDrawDuration();
          currentLine = null;
          timer = 0;
        }
      } else if (
        !drawing &&
        angleEnergyRollingAverage > 4 &&
        target.forceApplied &&
        activeLineView.length === 0
      ) {
        timer = 0;
        drawing = true;
      }
    }

    lastAngle = angle;

    if (drawing) {
      timer += dt;
      if (timer >= drawDuration) {
        timer %= drawDuration;
        currentLine = false;
        drawing = false;
        drawDuration = newDrawDuration();
        angleEnergyRollingAverage = 0;
      }
    }

    if (hatTipView.length > 0 && drawing) {
      const tip = hatTipView[0].get(Tags.HatTipPoint);
      if (!currentLine) {
        currentLine = pool.next();
        const currentEnv =
          currentEnvView.length > 0
            ? currentEnvView[0].get(Tags.EnvironmentState).name
            : null;
        currentLine.userData.entity.add(Tags.HatTipWindLineSound, currentEnv);
      }

      const dist = 0.1;
      const distSq = dist * dist;
      const d = currentLine.userData;
      if (
        !d.hasLastPosition ||
        d.lastPosition.distanceToSquared(tip) >= distSq
      ) {
        d.hasLastPosition = true;
        if (d.path.length <= 0) d.velocity.copy(user.velocity);

        // const sample = new Sample(); //TODO pool
        const sample = samplePool.next();
        tip.toArray(sample.position);
        user.velocity.toArray(sample.velocity);
        if (d.path.length > 0) {
          sample.index = d.path[d.path.length - 1].index + 1;
        }

        if (d.path.length > maxSamples) {
          const oldSample = d.path.shift();
          samplePool.release(oldSample);
        }
        d.path.push(sample);
        if (d.path.length > 4) currentLine.updatePath(d.path, true);
        d.lastPosition.copy(tip);
      }
      currentLine.visible = d.path.length > 4;
    }

    windLineView.forEach((e) => {
      const m = e.get(Tags.Object3D);
      if (currentLine !== m) {
        m.userData.time += dt;
      }
      const curTime = Math.max(0, m.userData.time - m.userData.delay);
      const alpha = 1 - curTime / m.userData.duration;
      m.material.uniforms.opacity.value = alpha * 0.5;
      if (curTime >= m.userData.duration) {
        m.userData.path.forEach((sample) => samplePool.release(sample));
        // m.userData.path.length = 0;
        // m.visible = false;
        pool.release(m);
      } else {
        const scl = 0.25;
        const gravity = -0.1;
        // m.position.x += m.userData.velocity.x * scl;
        // m.position.y += gravity * dt;
        // m.position.z += m.userData.velocity.z * scl;

        const spd = 10;
        m.userData.path.forEach((p, i, lst) => {
          const alpha = lst.length <= 1 ? 0.0 : i / (lst.length - 1);
          p.position[0] += p.velocity[0] * dt * spd * alpha;
          p.position[2] += p.velocity[2] * dt * spd * alpha;
          // p.velocity[0] *= 0.98;
          // p.velocity[2] *= 0.98;
          // MathUtil.dampVector(p.velocity, zero3, 10, dt, p.velocity);

          // p.position[1] += 0.1 * dt * Math.sin(p.index * 0.25 + windTime * 5);
          p.position[1] += dt * -0.5;
        });
        m.updatePath(m.userData.path, true);
      }
    });
  };
}
