import * as THREE from "three";
import * as Tags from "../../tags";
import CapsuleBufferGeometry from "../../util/CapsuleBufferGeometry";
import * as MathUtil from "../../util/math";
import * as ShaderManager from "../../util/ShaderManager";
import Line3D from "../../systems/writing/Line3D";
import Random from "../../util/Random";
import SimplexNoise from "simplex-noise";
const tmpVec3D = new THREE.Vector3();

function PhysicsSystem(opts = {}) {
  const {
    gravity = -9.81 * 0.1, // m / s^2 - with fudged world unit scaling
    mass = 0.05, // mass of all bodies for simpler code
  } = opts;

  return {
    update(dt, points) {
      for (let i = 0; i < points.length; i++) {
        updatePoint(dt, points[i]);
      }
    },
    updatePoint,
  };

  function updatePoint(dt, point) {
    const velocity = point.velocity;
    const position = point.position;
    const maxVel = point.maxVelocity;
    const speed = point.speed;
    const radius = point.radius;
    const Cd = 0.47; // Dimensionless
    const rho = 1.22; // kg / m^3
    const A = (Math.PI * radius * radius) / 10000; // m^2

    // clamp velocity
    velocity.x = MathUtil.clamp(velocity.x, -maxVel, maxVel);
    velocity.y = MathUtil.clamp(velocity.y, -maxVel, maxVel);
    velocity.z = MathUtil.clamp(velocity.z, -maxVel, maxVel);

    // clamp velocity
    // let friction = 0.95;
    // velocity.x *= friction;
    // velocity.y *= friction;
    // velocity.z *= friction;

    if (!point.pinned) {
      var vx = velocity.x;
      var vy = velocity.y;
      var vz = velocity.z;
      // var avx = Math.abs(vx);
      // var avy = Math.abs(vy);
      // var avz = Math.abs(vz);
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
      // Integrate to get velocity
      velocity.x += ax * dt;
      velocity.y += ay * dt;
      velocity.z += az * dt;
      // Integrate to get position
      position.x += velocity.x * dt * speed;
      position.y += velocity.y * dt * speed;
      position.z += velocity.z * dt * speed;
    }
  }
}

function PhysicsConstraint(pointA, pointB, opts = {}) {
  const { restingDistance = 1, stiffness = 1, strengths = [1, 1] } = opts;
  return {
    solve(dt = 1) {
      tmpVec3D.copy(pointA.position).sub(pointB.position);
      const dist = tmpVec3D.length();

      var restingRatio =
        dist === 0 ? restingDistance : (restingDistance - dist) / dist;

      let scalarP1, scalarP2;
      let p1mass = strengths[0];
      let p2mass = strengths[1];

      //handle zero mass a little differently
      if (p1mass == 0 && p2mass == 0) {
        scalarP1 = 0;
        scalarP2 = 0;
      } else if (p1mass == 0 && p2mass > 0) {
        scalarP1 = 0;
        scalarP2 = stiffness;
      } else if (p1mass > 0 && p2mass == 0) {
        scalarP1 = stiffness;
        scalarP2 = 0;
      } else {
        //invert mass quantities
        var im1 = 1.0 / p1mass;
        var im2 = 1.0 / p2mass;
        scalarP1 = (im1 / (im1 + im2)) * stiffness;
        scalarP2 = stiffness - scalarP1;
      }

      MathUtil.dampVector(
        pointB.position,
        pointA.position,
        1 + 15 * (1 - MathUtil.clamp01(dist / restingRatio)),
        dt,
        pointB.position
      );
      // pointA.velocity.addScaledVector(tmpVec3D, dt * scalarP1 * restingRatio);
      // pointB.velocity.addScaledVector(tmpVec3D, -dt * scalarP2 * restingRatio);
    },
  };
}

function PhysicsPoint(position, opts = {}) {
  const { radius = 20, maxVelocity = 15, speed = 1 } = opts;
  const velocity = new THREE.Vector3(0, 0, 0);
  let pinned = Boolean(opts.pinned);

  return {
    get pinned() {
      return pinned;
    },
    set pinned(v) {
      pinned = v;
    },
    radius,
    maxVelocity,
    speed,
    position,
    velocity,
  };
}

export default function ScarfMesh() {
  const group = new THREE.Group();
  const anchorPoint = new THREE.Vector3(0, 1.35, 0);

  const mass = 0.05;
  const radius = 50;
  const stiffness = 0.5;
  const maxVelocity = 40;
  const nodeCount = 6;
  const physics = PhysicsSystem({
    mass,
  });
  const points = MathUtil.linspace(nodeCount).map((t, i) => {
    const x = t;
    const y = 0;
    const z = 0;
    const position = new THREE.Vector3(x, y, z).add(anchorPoint);
    return PhysicsPoint(position, {
      radius,
      maxVelocity,
      pinned: i === 0,
    });
  });

  const constraints = [];
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    const t = i / points.length;
    const restingDistance = a.position.distanceTo(b.position);
    constraints.push(
      PhysicsConstraint(a, b, {
        stiffness,
        restingDistance,
      })
    );
  }

  const random = Random();
  const noise = new SimplexNoise(random.value);

  const line = new Line3D(world, {
    taper: false,
    thickness: 0.75,
  });
  line.material.uniforms.color.value.set("#f6eaae");
  group.add(line);

  let fps = 30;
  let fpsInterval = 1 / fps;
  let time = 0;
  let elapsed = 0;

  return {
    group,
    update(dt, anchor) {
      elapsed += dt;

      // set pinned point
      points[0].position.copy(anchor);

      time += dt;
      if (time >= fpsInterval) {
        time %= fpsInterval;
        for (let i = 0; i < 1; i++) {
          constraints.forEach((c) => c.solve(fpsInterval));
        }
      }

      points.forEach((p) => {
        const f = 1;
        const a = 1;
        const n =
          a * noise.noise3D(p.position.x * f, elapsed, p.position.z * f);
        p.velocity.y += n;
      });

      // integrate all points
      physics.update(dt, points);

      // update line with vectors
      line.updatePath(points, true, true);
    },
  };
}
