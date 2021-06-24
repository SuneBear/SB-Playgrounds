import * as THREE from "three";
import * as Tags from "../tags";
import CapsuleBufferGeometry from "../util/CapsuleBufferGeometry";
import * as MathUtil from "../util/math";
import * as ShaderManager from "../util/ShaderManager";
import quatFromNormal from "three-quaternion-from-normal";
import createTimeline from "../util/tween-ticker";
import Assets from "../util/Assets";
import { getEmptyTexture } from "../util/materials";

import { ShaderMaterial } from "three";
import { standingNextToOriginTree } from "../util/resetPlayerPos";

import CharacterModel from "./character/CharacterModel";
import PhysicsSpring from "./character/PhysicsSpring";
import ScarfMesh from "./character/ScarfMesh";
import { setEntityTweenFromTo, tweenTo } from "./AnimationSystem";

export default function CharacterSystem(world) {
  const renderer = world.findTag(Tags.Renderer);
  const userCharacter = world.entity("CharacterEntity").add(Tags.UserCharacter);

  const [blobShadowMap] = Assets.createGPUTextureTask(
    renderer,
    "image/data/soft-circle"
  );
  const [capeMap] = Assets.createGPUTextureTask(
    renderer,
    "image/data/cape-texture-landscape-1024",
    {
      generateMipmaps: false,
      minFilter: THREE.NearestFilter,
      wrapS: THREE.RepeatWrapping,
      wrapT: THREE.RepeatWrapping,
    }
  );

  const group = new THREE.Group();
  const model = CharacterModel(world, { capeMap, blobShadowMap });
  model.group.name = "character-model";
  group.name = "character-container";
  group.add(model.group);
  userCharacter.add(Tags.Object3D, group);

  let scarf;
  // const scarf = ScarfMesh(world);
  // group.add(scarf.group);
  // scarf.group.name = "character-scarf";

  const maxRadialDist = 12; // or 20?
  const snapThreshold = maxRadialDist * 2;
  const maxRadialDistSq = maxRadialDist * maxRadialDist;
  const spring = PhysicsSpring();
  const smoothTarget = new THREE.Vector3();
  let hasSmoothTarget = false;
  const distFromSmoothThreshold = 25;
  const distFromSmoothThresholdSq =
    distFromSmoothThreshold * distFromSmoothThreshold;

  const hatTipPoint = world.tag(Tags.HatTipPoint);
  const scarfAnchor = new THREE.Vector3();
  const animateInEvents = world.listen(Tags.AnimateInCharacter);
  const animateOutEvents = world.listen(Tags.AnimateOutCharacter);
  const animateTween = { value: 1 };

  return function characterSystem(dt) {
    const hideChar = world.findTag(Tags.HideCharacter);
    const isIntroSequence = world.findTag(Tags.OriginTreeIntroSequence);
    const userTarget = world.findTag(Tags.UserTarget);
    const input = world.findTag(Tags.InputState);
    const char = userCharacter.get(Tags.UserCharacter);
    const isCameraDirecting = Boolean(
      world.findTag(Tags.CameraStopUserMovement)
    );
    const allowInput = !Boolean(world.findTag(Tags.BlockUserMove));
    const canMove =
      !isIntroSequence &&
      !isCameraDirecting &&
      !Boolean(world.findTag(Tags.ModalStoppingUserMovement));

    let moveToOrigin = Boolean(world.findTag(Tags.MoveUserToOrigin));

    const snapThresholdSq = snapThreshold * snapThreshold;
    const distFromTargetSq = userTarget.position.distanceToSquared(
      char.position
    );

    let clearVelocity = hideChar;

    animateInEvents.added.forEach((e) => {
      moveToOrigin = true;
      clearVelocity = true;
      animateTween.value = 0;

      spring.target.copy(standingNextToOriginTree);
      spring.position.copy(spring.target);
      char.position.copy(spring.target);

      // remove after use
      e.remove(Tags.AnimateInCharacter);

      // create a new tween
      const tweenAnim = tweenTo(
        world,
        animateTween,
        "value",
        1,
        1,
        "quadOut",
        0
      );
      // the tween will stop user movement
      // but the tween will get auto-killed once its
      tweenAnim.add(Tags.BlockUserMove);
    });
    animateOutEvents.added.forEach((e) => {
      // moveToOrigin = true;
      // clearVelocity = true;
      // animateTween.value = 0;

      // spring.target.copy(standingNextToOriginTree);
      // spring.position.copy(spring.target);
      // char.position.copy(spring.target);

      // remove after use
      e.remove(Tags.AnimateOutCharacter);

      // create a new tween
      const tweenAnim = tweenTo(
        world,
        animateTween,
        "value",
        0,
        0.01,
        "quadIn",
        11
      );
      // the tween will stop user movement
      // but the tween will get auto-killed once its
      tweenAnim.add(Tags.BlockUserMove);
    });

    if (distFromTargetSq >= snapThresholdSq && !moveToOrigin) {
      char.position.copy(userTarget.position);
      spring.target.copy(userTarget.position);
      spring.position.copy(userTarget.position);
      clearVelocity = true;
    }

    if (clearVelocity) {
      char.velocity.set(0, 0);
      spring.velocity.set(0, 0, 0);
      spring.direction.set(1, 0, 0);
    }

    spring.lerpToTarget = false;

    if (moveToOrigin) {
      spring.target.copy(standingNextToOriginTree);
      spring.moveToTarget = true;
      spring.lerpToTarget = true;
    } else if (
      input.interacted &&
      userTarget.inputHitPlane &&
      canMove &&
      allowInput
    ) {
      // tmpVec3D.copy(userTarget.inputPositionOnPlane);

      // const distSq = tmpVec3D.distanceToSquared(userTarget.position);

      spring.moveToTarget = true;

      if (hasSmoothTarget) {
        // if we need to reset smoother
        const distFromSmoothSq = smoothTarget.distanceToSquared(
          userTarget.inputPositionOnPlane
        );
        if (distFromSmoothSq >= distFromSmoothThresholdSq) {
          hasSmoothTarget = false;
        }
      }

      if (!hasSmoothTarget) {
        hasSmoothTarget = true;
        smoothTarget.copy(userTarget.inputPositionOnPlane);
      } else {
        MathUtil.dampVector(
          smoothTarget,
          userTarget.inputPositionOnPlane,
          50,
          dt,
          smoothTarget
        );
      }

      spring.target.copy(smoothTarget).sub(userTarget.position);
      const distSq = spring.target.lengthSq();

      if (distSq >= maxRadialDistSq) {
        const dist = Math.sqrt(distSq);
        if (dist !== 0) {
          // normalize vector
          spring.target.divideScalar(dist);
        }
        spring.target.multiplyScalar(maxRadialDist).add(userTarget.position);
      } else {
        spring.target.copy(smoothTarget);
      }
    } else {
      spring.moveToTarget = false;
    }

    spring.update(dt);

    // take the fudged-physical units in PhysicsSpring and
    // scale them to a more friendly world unit for our game...
    // the fudge is thick here.
    const maxOutVel = 0.2;
    char.velocity
      .copy(spring.velocity)
      .multiplyScalar(maxOutVel / spring.maxVelocity);

    char.position.copy(spring.position);
    char.direction.copy(spring.direction);

    model.scale = animateTween.value;
    model.update(dt, char, userTarget, spring, moveToOrigin);
    model.getScarfAnchor(scarfAnchor);
    if (scarf) scarf.update(dt, scarfAnchor);
    model.getHatTipPoint(hatTipPoint);
    group.visible = !isIntroSequence && !hideChar;
  };
}
