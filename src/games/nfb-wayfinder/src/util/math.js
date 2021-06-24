import { lerp, damp } from "canvas-sketch-util/math";
import * as THREE from "three";

export * from "canvas-sketch-util/math";
import { clamp01 } from "canvas-sketch-util/math";

const tmpUp = new THREE.Vector3();
const tmpRight = new THREE.Vector3();

const axis = new THREE.Vector3();
const norm = new THREE.Vector3();

export function dampVector(a, b, power, dt, output = a) {
  output.x = damp(a.x, b.x, power, dt);
  output.y = damp(a.y, b.y, power, dt);
  output.z = damp(a.z, b.z, power, dt);
  return output;
}

export function sign(f) {
  return f >= 0.0 ? 1 : -1;
}

export function moveTowardVector(a, b, speed, dt, output = a) {
  norm.copy(b).sub(a);
  const dist = norm.length();
  if (dist !== 0) norm.divideScalar(dist);
  const maxDelta = speed * dt;
  if (dist <= maxDelta) return output.copy(b);
  output.addScaledVector(norm, maxDelta);
  return output;
  // output.x = moveToward(a.x, b.x, speed, dt);
  // output.y = moveToward(a.y, b.y, speed, dt);
  // output.z = moveToward(a.z, b.z, speed, dt);
  // return output;
}

export function moveToward(current, target, speed, dt) {
  const maxDelta = speed * dt;
  if (Math.abs(target - current) <= maxDelta) return target;
  return current + sign(target - current) * maxDelta;
}

export function repeat(t, length) {
  return t - Math.floor(t / length) * length;
}

export function deltaAngle(current, target) {
  let num = repeat(target - current, Math.PI * 2);
  if (num > Math.PI) num -= Math.PI * 2;
  return num;
}

export function wrapAngle(angle) {
  let n = repeat(angle, Math.PI * 2);
  if (n > Math.PI) n -= Math.PI * 2;
  return n;
}

export function lerpAngle(a, b, t) {
  let delta = repeat(b - a, Math.PI * 2);
  if (delta > Math.PI) delta -= Math.PI * 2;
  return a + delta * clamp01(t);
}

export function dampAngle(a, b, lambda, dt) {
  const delta = deltaAngle(a, b);
  const t = 1 - Math.exp(-lambda * dt);
  return a + delta * t;
}

export function getDistSq2D(a, b) {
  const dx = b.x - a.x;
  const dy = b.z - a.z;
  return dx * dx + dy * dy;
}

export function quaternionFromNormal(normal, quaternion) {
  quaternion = quaternion || new THREE.Quaternion();
  // vector is assumed to be normalized
  if (normal.y > 0.99999) {
    quaternion.set(0, 0, 0, 1);
  } else if (normal.y < -0.99999) {
    quaternion.set(1, 0, 0, 0);
  } else {
    axis.set(normal.z, 0, -normal.x).normalize();
    var radians = Math.acos(normal.y);
    quaternion.setFromAxisAngle(axis, radians);
  }
  return quaternion;
}

export function sphericalToCartesian(
  latitude,
  longitude,
  out = new THREE.Vector3()
) {
  //flips the Y axis
  latitude = Math.PI / 2 - latitude;

  //distribute to sphere
  out.set(
    Math.sin(latitude) * Math.sin(longitude),
    Math.cos(latitude),
    Math.sin(latitude) * Math.cos(longitude)
  );

  return out;
}

export function getScreenSpaceCameraUp(camera, vec = new THREE.Vector3()) {
  const upX = camera.matrixWorldInverse.elements[4];
  const upY = camera.matrixWorldInverse.elements[5];
  const upZ = camera.matrixWorldInverse.elements[6];
  vec.set(upX, upY, upZ);
  return vec;
}

export function getScreenSpaceCameraRight(camera, vec = new THREE.Vector3()) {
  const rightX = camera.matrixWorldInverse.elements[0];
  const rightY = camera.matrixWorldInverse.elements[1];
  const rightZ = camera.matrixWorldInverse.elements[2];
  vec.set(rightX, rightY, rightZ);
  return vec;
}

export function addScreenSpaceUV(camera, position, u, v) {
  const up = getScreenSpaceCameraUp(camera, tmpUp);
  const right = getScreenSpaceCameraRight(camera, tmpRight);
  position.addScaledVector(right, u);
  position.addScaledVector(up, v);
  return position;
}

export function map(value, low1, high1, low2, high2) {
  return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}