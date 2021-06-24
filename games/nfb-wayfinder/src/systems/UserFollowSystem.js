import SimplexNoise from "simplex-noise";
import * as THREE from "three";
import * as Tags from "../tags";
import * as MathUtil from "../util/math";
import createTimeline from "../util/tween-ticker";
import Bezier from "bezier-easing";
import queryString from "../util/query-string";
// import CameraEditor from "../editor/CameraEditor";

window.zoomLevel = 1;

const noise = new SimplexNoise(0);

export default function UserFollowSystem(world) {
  const entity = world.entity("UserFollowEntity").add(Tags.UserFollow);

  const easeToTarget = Bezier(0.37, 0.08, 0, 1.01);
  const easeToPlayer = Bezier(0.39, 0.21, 0.05, 1.04);

  const cinematicTimeline = createTimeline();
  const currentTarget = new THREE.Vector3();
  const cinematicTween = {
    animatingToTarget: false,
    animatingToPlayer: false,
    positionStart: new THREE.Vector3(),
    positionEnd: new THREE.Vector3(),
    value: 0,
    zoom: 0,
  };
  const cinematicMoments = world.listen(Tags.CinematicCameraMoment);
  const camFocusOnTarget = world.view(Tags.CameraFocusOnTarget);
  const camFocusOnTargetEvent = world.listen(Tags.CameraFocusOnTarget);
  let first = true;

  const angle = MathUtil.degToRad(45 * -1);
  const r = 1;
  const offset = new THREE.Vector3(1, 1, 1);
  offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
  // const offset = new THREE.Vector3(
  //   Math.cos(angle) * r,
  //   r * 1.0,
  //   Math.sin(angle) * r
  // );

  const postOffset = new THREE.Vector3();

  // let zoom = 6.2;
  // let fov = 5;

  const cinematicTweenZoom = 1;

  let presets = [
    { zoom: 2.5, fov: 15, near: 30, far: 150 },
    { zoom: 2, fov: 20, near: 30, far: 100 },
    { zoom: 1.75, fov: 25, near: 20, far: 100 },
    { zoom: 1.33, fov: 30, near: 1, far: 1500 },
  ];

  let curPreset = presets[0];
  if (queryString.zoom) {
    window.addEventListener("keydown", (ev) => {
      const c = ev.key;
      const idx = parseInt(c, 10) - 1;
      if (idx >= 0 && idx < presets.length) {
        const userZoom = world.findTag(Tags.UserZoom);
        if (idx === 0) userZoom.distance = userZoom.defaultDistance;

        curPreset = presets[idx];
      }
    });
  }

  const zoomEntity = world.entity();

  const poemZoomView = world.view(Tags.UserInPoemArea);
  const poemCompletingView = world.view(Tags.UserCompletingPoem);
  const cameraStopper = world.entity();
  const frustum = new THREE.Frustum();
  const projScreenMatrix = new THREE.Matrix4();
  const cameraFrustumEntity = world
    .entity()
    .add(Tags.MainCameraFrustum, frustum);
  let currentUIZoom = 0;
  const cameraZoomOutRadius = 15;
  const cameraZoomOutRadiusSq = cameraZoomOutRadius * cameraZoomOutRadius;
  const appState = world.findTag(Tags.AppState);

  return function userFollowSystem(dt) {
    const userFollow = entity.get(Tags.UserFollow);
    const userZoom = world.findTag(Tags.UserZoom);
    const userZoomDistance = userZoom ? userZoom.distance : 10;

    const camera = world.findTag(Tags.MainCamera);
    const user = world.findEntity(Tags.UserTarget);
    const playerData = user.get(Tags.UserTarget);

    userFollow.shakeTime += dt * userFollow.shakeSpeed
    // userFollow.speedZoomDistance * playerData.boostAlpha

    // TODO: decide if we should pull out camera whenever user is near?
    // if (playerData.position.lengthSq() < cameraZoomOutRadiusSq) {
    //   zoomEntity.tagOn(Tags.CameraZoomOut);
    // } else {
    //   zoomEntity.tagOff(Tags.CameraZoomOut);
    // }

    if (playerData.forceApplied) {
      userFollow.speedZoomDistance = MathUtil.damp(
        userFollow.speedZoomDistance,
        userFollow.maxSpeedZoomDistance,
        userFollow.speedZoomSpringIn,
        dt
      );
    } else {
      userFollow.speedZoomDistance = MathUtil.damp(
        userFollow.speedZoomDistance,
        userFollow.minSpeedZoomDistance,
        userFollow.speedZoomSpringOut,
        dt
      );
    }

    if (first) {
      userFollow.currentDistance =
        userZoomDistance + userFollow.speedZoomDistance;
      first = false;
    }

    // cinematicMoments.added.forEach((e) => {
    //   const c = e.get(Tags.CinematicCameraMoment);
    // cinematicTween.value = 0;
    // if (c.copyStart) {
    //   playerData.position.set(c.target.x, 0, c.target.z);
    // }
    // cinematicTween.positionStart.copy(playerData.position);
    // cinematicTween.positionEnd.copy(c.target);
    // cinematicTween.animatingToTarget = true;
    // cameraStopper.add(Tags.CameraStopUserMovement);
    // cinematicTimeline.cancel();
    // cinematicTimeline
    //   .to(cinematicTween, {
    //     value: 1,
    //     duration: c.copyStart ? 2 : 2,
    //     ease: "sineOut",
    //   })
    //   .on("complete", (ev) => {
    //     if (!ev.cancelling) {
    //       cinematicTween.animatingToTarget = false;
    //       cinematicTween.animatingToPlayer = true;
    //       cinematicTween.positionStart.copy(playerData.position);
    //       cinematicTimeline.cancel();
    //       cinematicTimeline
    //         .to(cinematicTween, {
    //           value: 0,
    //           duration: 2,
    //           delay: 1,
    //           ease: "sineIn",
    //         })
    //         .on("complete", (ev) => {
    //           if (ev.cancelling) return;
    //           cameraStopper.remove(Tags.CameraStopUserMovement);
    //           cinematicTween.animatingToTarget = false;
    //           cinematicTween.animatingToPlayer = false;
    //           e.kill();
    //         });
    //     }
    //   });
    // });

    camFocusOnTargetEvent.added.forEach((e) => {
      const c = e.get(Tags.CameraFocusOnTarget);
      cinematicTween.value = 0;
      cinematicTween.positionStart.copy(playerData.position);
      cinematicTween.positionEnd.copy(c.target);
      cinematicTween.animatingToTarget = true;
      cinematicTimeline.cancel();
      cinematicTimeline
        .to(cinematicTween, {
          value: 1,
          duration: 2,
          ease: "sineInOut",
        })
        .on("complete", (ev) => {
          if (!ev.cancelling) {
            cinematicTween.animatingToTarget = false;
            cinematicTween.animatingToPlayer = false;
          }
        });
    });

    cinematicTimeline.tick(dt);

    // if (cinematicTween.animatingToTarget) {
    //   currentTarget
    //     .copy(cinematicTween.positionStart)
    //     .lerp(cinematicTween.positionEnd, cinematicTween.value);
    // } else if (cinematicTween.animatingToPlayer) {
    //   currentTarget
    //     .copy(cinematicTween.positionEnd)
    //     .lerp(playerData.position, 1 - cinematicTween.value);
    // } else {
    //   currentTarget.copy(playerData.position);
    // }

    if (camFocusOnTarget.length) {
      const t = camFocusOnTarget[0].get(Tags.CameraFocusOnTarget).target;
      currentTarget
        .copy(cinematicTween.positionStart)
        .lerp(cinematicTween.positionEnd, cinematicTween.value);
    } else {
      currentTarget.copy(playerData.position);
    }

    // cinematicTween.zoom = cinematicTween.value * cinematicTweenZoom;

    const cameraZoomOut = Boolean(world.findTag(Tags.CameraZoomOut));
    const uiZoom = cameraZoomOut ? 2 : 0;
    currentUIZoom = MathUtil.damp(currentUIZoom, uiZoom, 2, dt);
    userFollow.currentDistance = MathUtil.damp(
      userFollow.currentDistance,
      userZoomDistance +
        userFollow.speedZoomDistance +
        // cinematicTween.zoom +
        currentUIZoom +
        playerData.totalBoost * 0.1,
      userFollow.distanceSpring,
      dt
    );

    // console.log(offset, zoom, userFollow.currentDistance);
    camera.position.copy(currentTarget);
    camera.position.addScaledVector(
      offset,
      curPreset.zoom * userFollow.currentDistance
    );
    userFollow.currentTarget.copy(currentTarget);
    camera.lookAt(currentTarget);
    camera.position.add(postOffset);
    camera.fov = curPreset.fov;
    camera.near = curPreset.near;
    camera.far = curPreset.far;
    camera.matrixAutoUpdate = false;

    // cam shake
    const ampl = userFollow.shake
    const shakeTime = userFollow.shakeTime
    camera.position.x += noise.noise3D(shakeTime, camera.position.y, camera.position.z) * ampl;
    camera.position.y += noise.noise3D(camera.position.x, shakeTime, camera.position.z) * ampl;
    camera.position.z += noise.noise3D(camera.position.x, camera.position.y, shakeTime) * ampl;

    let cameraZoom = 1;
    // if (aspect > 1) cameraZoom *= aspect;
    // else cameraZoom = 1;

    const targetAspect = 1440 / 900;
    const targetZoomAtAspect = 0.9;
    const minZoom = 0.85;
    const maxZoom = 1.5;
    const currentAspect = appState.width / appState.height;
    const targetFactor = currentAspect / targetAspect;
    const constantZoomFactor = 0.9;
    cameraZoom =
      MathUtil.clamp(targetZoomAtAspect * targetFactor, minZoom, maxZoom) *
      constantZoomFactor;

    // aspect <= 0.7 = 0.8 level zoom
    // aspect <= 2 = 0.8

    camera.zoom = cameraZoom;
    camera.updateMatrix();
    camera.updateMatrixWorld();
    camera.updateProjectionMatrix();

    projScreenMatrix.multiplyMatrices(
      camera.projectionMatrix,
      camera.matrixWorldInverse
    );
    frustum.setFromProjectionMatrix(projScreenMatrix);
  };
}
