import * as THREE from "three";
import * as Tags from "../tags";
import * as MathUtil from "../util/math";
import Random from "../util/Random";
import { standingNextToOriginTree } from "../util/resetPlayerPos";

export default function UserMoveSystem(world) {
  const normalizedMousePosition = new THREE.Vector2();
  const raycaster = new THREE.Raycaster();
  const mousePlane = new THREE.Plane(new THREE.Vector3(-0, -1, -0), -0);
  const mousePlaneTarget = new THREE.Vector3();
  const tmpPos3D = new THREE.Vector3();
  const random = Random();

  const mouseDirection = new THREE.Vector3();
  const moveDirection = new THREE.Vector3();

  let speed = 0.0;
  let minSpeed = 0.0;
  let maxSpeed = 3;

  let boost = 0;
  let minBoost = 0;
  let maxBoost = 4.5;

  const speedFactor = 1;
  const speedPower = 4;

  let mouseDirectionAngle;
  let moveDirectionAngle;
  let driftSpeed = 0.5;
  let driftAngle = MathUtil.degToRad(random.pick([1, 3, 5, 7]) * 45);

  const tmpCenter = [0, 0];
  const tmpUserPos = [0, 0];
  const tmpNewUserPos = [0, 0];
  const tmpReflect = [0, 0];
  const maxDist = 100;
  const maxWorldSize = 512 * 0.95;

  const userTargetEntity = world
    .entity("UserTargetEntity")
    .add(Tags.UserTarget);

  const InputState = world.query(Tags.InputState);
  const MainCamera = world.query(Tags.MainCamera);
  const UserTarget = world.query(Tags.UserTarget);
  const boosts = world.view(Tags.MovementBoost);
  const clearInputPressTags = world.view(Tags.ClearInputPress);
  let wasForceApplied = null;

  return function userMoveSystem(dt) {
    let isInputBlocked = Boolean(world.findTag(Tags.BlockUserMove));
    let isCameraDirecting = Boolean(world.findTag(Tags.CameraStopUserMovement));
    let isTransitioning =
      Boolean(world.findTag(Tags.TransitionToNextBiome)) ||
      Boolean(world.findTag(Tags.ShowBiomeResolution));

    // if (isCameraDirecting && !isTransitioning) return;

    const input = world.findTag(InputState);
    const camera = world.findTag(MainCamera);
    const user = world.findEntity(UserTarget);

    const userData = user.get(Tags.UserTarget);

    const userTargetPos = userData.position;

    normalizedMousePosition.set(
      input.positionNormalized.x * 2 - 1,
      -input.positionNormalized.y * 2 + 1
    );
    raycaster.setFromCamera(normalizedMousePosition, camera);

    const clearPress = clearInputPressTags.length > 0;
    const hit = clearPress
      ? false
      : raycaster.ray.intersectPlane(mousePlane, mousePlaneTarget);
    // if (isTransitioning) {
    //   mousePlaneTarget.copy(standingNextToOriginTree);
    // }

    let speedMultiplier = 1;
    let allowInput = isTransitioning || (input.interacted && !isInputBlocked);

    if (hit && allowInput) {
      tmpPos3D.set(userTargetPos.x, 0, userTargetPos.z);

      const userPlayer = world.findTag(Tags.UserCharacter);
      if (userPlayer) {
        // mouseDirection.copy(userPlayer.target).sub(tmpPos3D).normalize();
        // const dist = maxDist;
        // const dist = Math.min(
        //   maxDist,
        //   Math.max(
        //     userPlayer.position.distanceTo(mousePlaneTarget),
        //     userTargetPos.distanceTo(mousePlaneTarget)
        //   )
        // );
        // if (dist < 3) speedMultiplier = Math.pow(dist / 3, 1 / 10);
        // mouseDirection.copy(mousePlaneTarget).sub(tmpPos3D).normalize();
        // mouseDirectionAngle = Math.atan2(mouseDirection.z, mouseDirection.x);
        // if (moveDirectionAngle == null)
        //   moveDirectionAngle = mouseDirectionAngle;
      }

      mouseDirection.copy(mousePlaneTarget).sub(tmpPos3D);
      const len = mouseDirection.length();
      if (len !== 0) mouseDirection.divideScalar(len);
      const smooth = MathUtil.clamp01(Math.pow(len / 4, 1 / 25));
      speedMultiplier *= smooth;
      mouseDirectionAngle = Math.atan2(mouseDirection.z, mouseDirection.x);
      if (moveDirectionAngle == null) moveDirectionAngle = mouseDirectionAngle;
    }

    if (moveDirectionAngle != null && mouseDirectionAngle != null) {
      moveDirectionAngle = MathUtil.dampAngle(
        moveDirectionAngle,
        mouseDirectionAngle,
        7,
        dt
      );
      moveDirection.set(
        Math.cos(moveDirectionAngle),
        0,
        Math.sin(moveDirectionAngle)
      );
    }

    const uiActive = Boolean(world.findTag(Tags.IsGameUIActive));
    const canMove =
      !clearPress &&
      !isCameraDirecting &&
      allowInput &&
      !uiActive &&
      !Boolean(world.findTag(Tags.OriginTreeIntroSequence)) &&
      !Boolean(world.findTag(Tags.ModalStoppingUserMovement));
    let forceApplied = false;
    if ((input.pressed || isTransitioning) && canMove) {
      forceApplied = true;
      speed = MathUtil.damp(speed, maxSpeed, 5, dt);
      boost = MathUtil.damp(boost, maxBoost, 2, dt);
    } else {
      speed = MathUtil.damp(speed, minSpeed, 2, dt);
      boost = MathUtil.damp(boost, minBoost, 5, dt);
    }

    if (forceApplied !== wasForceApplied) {
      if (forceApplied) userTargetEntity.tagOn(Tags.UserForceApplied);
      else userTargetEntity.tagOff(Tags.UserForceApplied);
      wasForceApplied = forceApplied;
    }
    speed *= speedMultiplier;
    boost *= speedMultiplier;
    let boostScale = 0.25;
    let totalSpeed = speed + boost;
    // let totalSpeed = speed * (1 - boostScale) + boost * boostScale;

    let outside = false;
    let totalBoost = 0;
    const boostFactor = 1;
    boosts.forEach((e) => {
      const curBoost = e.get(Tags.MovementBoost);
      totalBoost += curBoost.value;
      curBoost.value = MathUtil.damp(
        curBoost.value,
        0.0001,
        curBoost.frictionPower,
        dt
      );

      curBoost.elapsed += dt;
      if (curBoost.elapsed >= curBoost.duration) {
        e.kill();
      }
    });
    let directionIncrease =
      dt * totalSpeed * speedFactor + totalBoost * boostFactor * dt;

    if (canMove) {
      userTargetPos.addScaledVector(moveDirection, directionIncrease);
    }

    const drift = world.findTag(Tags.GameLandingCameraDrift);
    let newDriftSpeed = driftSpeed;
    if (input.interacted && allowInput) {
      const u = input.positionNormalized.x * 2 - 1;
      const v = input.positionNormalized.y * 2 - 1;
      const dist = MathUtil.clamp01(Math.sqrt(u * u + v * v));
      newDriftSpeed = MathUtil.lerp(0.1, 0.75, Math.pow(dist, 0.5));
    }
    if (drift && drift.fixed != null) {
      newDriftSpeed = drift.fixed;
    }

    const newDriftAngle =
      moveDirectionAngle != null ? moveDirectionAngle : driftAngle;
    driftAngle = MathUtil.dampAngle(driftAngle, newDriftAngle, 3, dt);
    driftSpeed = MathUtil.dampAngle(driftSpeed, newDriftSpeed, 5, dt);

    if (drift) {
      // tmpPos3D.set(u, 0, v).normalize();
      tmpPos3D.set(Math.cos(driftAngle), 0, Math.sin(driftAngle));
      // const moveAngle = MathUtil.degToRad(u * 180);
      userTargetPos.addScaledVector(tmpPos3D, dt * driftSpeed);
      // userTargetPos.x += Math.cos(moveAngle) * dt;
      // userTargetPos.z += Math.sin(moveAngle) * dt;
    }

    userTargetPos.x = MathUtil.clamp(
      -maxWorldSize / 2,
      maxWorldSize / 2,
      userTargetPos.x
    );
    userTargetPos.z = MathUtil.clamp(
      -maxWorldSize / 2,
      maxWorldSize / 2,
      userTargetPos.z
    );
    // userTargetPos.y = 0.15;

    userData.forceApplied = forceApplied;
    userData.direction.copy(moveDirection);
    userData.totalBoost = totalBoost;
    userData.speedAlpha = MathUtil.inverseLerp(minSpeed, maxSpeed, speed);
    userData.boostAlpha = MathUtil.inverseLerp(minBoost, maxBoost, boost);
    userData.totalSpeedAlpha = MathUtil.inverseLerp(
      minSpeed + minBoost,
      maxSpeed + maxBoost,
      totalSpeed
    );
    userData.inputHitPlane = hit;
    if (hit) userData.inputPositionOnPlane.copy(mousePlaneTarget);

    if (user.has(Tags.Object3D)) {
      const object = user.get(Tags.Object3D);
      object.position.copy(userTargetPos);
    }
  };
}
