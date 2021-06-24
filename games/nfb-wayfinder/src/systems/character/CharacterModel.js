import * as THREE from "three";
import * as Tags from "../../tags";
import CapsuleBufferGeometry from "../../util/CapsuleBufferGeometry";
import * as MathUtil from "../../util/math";
import * as ShaderManager from "../../util/ShaderManager";

import CharacterHead from "./CharacterHead";
import CapeMesh from "./CapeMesh";
import CharacterLegs from "./CharacterLegs";

export default function CharacterModel(world, { capeMap, blobShadowMap }) {
  const renderLayers = world.findTag(Tags.RenderLayers);

  const char = world.findTag(Tags.UserCharacter);

  const group = new THREE.Group();
  const characterScale = 1.25;

  const container = new THREE.Group();
  group.add(container);

  const origin = new THREE.Vector3();
  const arrow = new THREE.ArrowHelper(new THREE.Vector3(), new THREE.Vector3());

  // group.add(sphere);

  const tmpDir = new THREE.Vector3(0, 0, 1);

  const cape = CapeMesh(world, { map: capeMap });
  const head = CharacterHead();
  const legs = CharacterLegs();

  const shadow = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: blobShadowMap,
      depthTest: false,
      depthWrite: false,
      // blending: THREE.MultiplyBlending,
      color: "hsl(0, 0%, 0%)",
      opacity: 0.15,
      transparent: true,
    })
  );
  shadow.scale.set(2, 1, 1).multiplyScalar(1);
  shadow.layers.disableAll();
  shadow.layers.enable(renderLayers.shadow);
  const shadowContainer = new THREE.Group();
  shadowContainer.add(shadow);
  group.add(shadowContainer);

  container.add(cape.group);
  container.add(head.group);
  container.add(legs.group);
  arrow.setDirection(tmpDir);

  const legOffset = 0.8;
  cape.group.position.y += legOffset;
  head.group.position.y += legOffset;
  legs.group.position.y = 0.155;

  const capeOriginPosY = cape.group.position.y
  const headOriginPosY = head.group.position.y
  const legsOriginPosY = legs.group.position.y

  container.scale.multiplyScalar(0.8); // 0.7
  // container.scale.y *= 1.4;
  // container.add(arrow);

  const camUpWorld = new THREE.Vector3();
  const camRightWorld = new THREE.Vector3();
  const camFrowardWorld = new THREE.Vector3();
  const camera = world.findTag(Tags.MainCamera);

  let lift = 0.5;
  let targetLift = 1;
  let time = 0;
  let float = 0;

  let capeAngle = null;
  let lastAngleTarget = null;

  return {
    scale: 1,
    getHatTipPoint(position) {
      return head.getHatTipPoint(position);
    },
    getScarfAnchor(position) {
      return head.getScarfAnchor(position);
    },
    group,
    update(dt, char, target, spring, moveToOrigin) {
      time += dt;
      const position = char.position;
      const velocity = char.velocity;
      const direction = char.direction;

      const velLength = velocity.length();
      const relVelLength = MathUtil.clamp01(velLength / 0.2);

      let capeAngleTarget = Math.atan2(direction.z, direction.x);
      if (capeAngle == null) {
        lastAngleTarget = capeAngleTarget;
        capeAngle = capeAngleTarget;
      }

      const lookRadiusThreshold = 15;
      const lookRadiusThresholdSq = lookRadiusThreshold * lookRadiusThreshold;
      if (moveToOrigin && position.lengthSq() <= lookRadiusThresholdSq) {
        const dx = -position.x;
        const dz = -position.z;
        capeAngleTarget = Math.atan2(dz, dx);
      }

      const distTurnThreshold = 0.5;
      const distTurnThresholdSq = distTurnThreshold * distTurnThreshold;
      const distToTargetSq = position.distanceToSquared(spring.target);
      let curAngleTarget = lastAngleTarget;
      if (distToTargetSq >= distTurnThresholdSq) {
        curAngleTarget = capeAngleTarget;
        lastAngleTarget = capeAngleTarget;
      }
      // curAngleTarget = capeAngleTarget;
      capeAngle = MathUtil.dampAngle(
        capeAngle,
        curAngleTarget,
        moveToOrigin ? 10 : 50,
        dt
      );
      // capeAngle = MathUtil.dampAngle(capeAngle, capeAngleTarget, 50, dt);
      // console.log(capeAngle, capeAngleTarget);

      tmpDir.set(Math.cos(capeAngle), 0, Math.sin(capeAngle));

      shadowContainer.position
        .set(0, 0, 0)
        .addScaledVector(tmpDir, relVelLength * -1);

      // cape.setLookAngle(capeAngle);
      // cape.setTilt(relVelLength);

      const upX = camera.matrixWorldInverse.elements[4];
      const upY = camera.matrixWorldInverse.elements[5];
      const upZ = camera.matrixWorldInverse.elements[6];

      const rightX = camera.matrixWorldInverse.elements[0];
      const rightY = camera.matrixWorldInverse.elements[1];
      const rightZ = camera.matrixWorldInverse.elements[2];
      camUpWorld.set(upX, upY, upZ);
      camRightWorld.set(rightX, rightY, rightZ);
      // camFrowardWorld.crossVectors(camRightWorld, camUpWorld);
      camera.getWorldDirection(camFrowardWorld);

      cape.update(
        dt,
        camera,
        -capeAngle,
        relVelLength,
        camUpWorld,
        camRightWorld,
        camFrowardWorld
      );
      head.update(
        dt,
        camera,
        -capeAngle,
        relVelLength,
        camUpWorld,
        camRightWorld,
        camFrowardWorld
      );
      legs.update(
        dt,
        camera,
        -capeAngle,
        relVelLength,
        camUpWorld,
        camRightWorld,
        camFrowardWorld
      );

      group.position.copy(position);

      // const dir = new THREE.Vector3(0, )
      arrow.setDirection(tmpDir);

      // if (target.forceApplied) {
      //   targetLift = 1;
      // } else {
      //   targetLift = 0.25;
      // }

      targetLift = MathUtil.lerp(0.1, 0.75, relVelLength);
      lift = MathUtil.damp(lift, targetLift, 3, dt);
      float = Math.sin(time * 2) * 0.05;
      const totalLift = lift + float;
      container.position.y = totalLift;
      const shadowSize = 0.9 * MathUtil.lerp(1, 1.1, relVelLength);
      shadowContainer.scale.setScalar(shadowSize);

      group.scale.setScalar(characterScale * this.scale);

      cape.group.position.y = capeOriginPosY + char.yOffset
      head.group.position.y = headOriginPosY + char.yOffset
      legs.group.position.y = legsOriginPosY + char.yOffset

      // const upX = camera.matrixWorldInverse.elements[4];
      // const upY = camera.matrixWorldInverse.elements[5];
      // const upZ = camera.matrixWorldInverse.elements[6];

      // const rightX = camera.matrixWorldInverse.elements[0];
      // const rightY = camera.matrixWorldInverse.elements[1];
      // const rightZ = camera.matrixWorldInverse.elements[2];
      // camUpWorld.set(upX, upY, upZ);
      // camRightWorld.set(rightX, rightY, rightZ);

      // const n = direction.dot(camRightWorld);
      // if (n < 0) {
      //   capeMap.offset.x = 1;
      //   capeMap.repeat.x = -1;
      // } else {
      //   capeMap.offset.x = 0;
      //   capeMap.repeat.x = 1;
      // }
    },
  };
}
