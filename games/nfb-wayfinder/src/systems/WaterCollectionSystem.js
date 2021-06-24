/*
Skim the water to get water bubbles on your cape/character
Then you can collect a token

Carry snow flakes behind you into melting areas
*/
import * as MathUtil from "../util/math";
import * as Tags from "../tags";
import * as THREE from "three";
import ObjectPool from "../util/ObjectPool";
import Random from "../util/Random";

export default function WaterCollectionSystem(world) {
  const underPlayer = world.findTag(Tags.EnvironmentUnderPlayerState);
  const waterCarryEntity = world.entity();

  const random = Random();
  const sphere0 = new THREE.SphereBufferGeometry(1, 8, 8);
  const sphere1 = new THREE.SphereBufferGeometry(1, 8, 8);
  sphere1.scale(1, 0.75, 1);

  const baseColor = new THREE.Color("#3ea7e0");
  const material = new THREE.MeshBasicMaterial({
    // blending: THREE.AdditiveBlending,
  });
  const waterMesh = new THREE.Mesh(sphere0, material);
  const pool = new ObjectPool({
    maxCapacity: 100,
    initialCapacity: 50,
    create() {
      const m = waterMesh.clone();
      m.geometry = random.boolean() ? sphere0 : sphere1;
      m.material = material.clone();
      m.userData.velocity = new THREE.Vector3();
      m.material.color.copy(baseColor);
      m.material.color.offsetHSL(
        random.range(-1, 1) * 0.0,
        random.range(-1, 1) * 0.0,
        random.range(-1, 1) * 0.1
      );
      m.material.color.multiplyScalar(random.range(0.2, 1));
      const bloom = 1;
      m.material.color.r += bloom;
      m.material.color.g += bloom;
      m.material.color.b += bloom;
      m.userData.time = 0;
      m.userData.scale = 1;
      m.userData.duration = 1;
      m.userData.delay = 1;
      m.userData.speed = 1;
      m.visible = false;
      return m;
    },
    renew(m) {
      m.visible = true;
    },
    release(m) {},
  });

  const newSpawnDelay = () => random.range(0.1, 0.2);
  let spawnDelay = newSpawnDelay();
  let spawnTime = random.range(0, spawnDelay);

  const tmpArr2D = [0, 0];
  const tmpArr4D = [0, 0, 0, 0];

  const activeMeshes = world.view(Tags.WaterFollowParticle);
  const newCooldownDelay = () => random.range(1, 2);
  let hitCooldownDelay = newCooldownDelay();
  let hitCooldownTime = 0;
  const activeEnv = world.view([
    Tags.EnvironmentState,
    Tags.ActiveEnvironmentState,
  ]);
  const hitSoundEntity = world.entity();

  const particleEmitters = world.view(Tags.ParticleEmit);
  let lastPos = null;
  const soundThreshold = 2;
  const soundThresholdSq = soundThreshold * soundThreshold;

  return function waterCollectSystem(dt) {
    if (
      underPlayer.water &&
      !waterCarryEntity.has(Tags.UserCarryingTokenCollectionFeature)
    ) {
      waterCarryEntity.add(Tags.UserCarryingTokenCollectionFeature);
    }

    const userCharData = world.findTag(Tags.UserCharacter);
    const userVelocity = userCharData.velocity;
    const userPos = userCharData.position;
    const hasMovedFarEnough =
      !lastPos || userPos.distanceToSquared(lastPos) >= soundThresholdSq;

    if (hitSoundEntity.has(Tags.UserHitAudioTrigger)) {
      hitCooldownTime += dt;
      if (hitCooldownTime >= hitCooldownDelay) {
        hitCooldownTime %= hitCooldownDelay;
        hitCooldownDelay = newCooldownDelay();
        hitSoundEntity.remove(Tags.UserHitAudioTrigger);
      }
    }

    const showWater = underPlayer.water;
    const showEffect = particleEmitters.length > 0;
    if (showWater) {
      spawnTime += dt;
      if (spawnTime >= spawnDelay) {
        spawnTime %= spawnDelay;
        spawnDelay = newSpawnDelay();
        const n = random.rangeFloor(1, 5);
        for (let i = 0; i < n; i++) {
          if (!spawnOne(userPos, userVelocity)) break;
        }
      }

      if (
        hasMovedFarEnough &&
        showWater &&
        !hitSoundEntity.has(Tags.UserHitAudioTrigger)
      ) {
        if (!lastPos) {
          lastPos = new THREE.Vector3();
        }
        lastPos.copy(userPos);
        hitSoundEntity.add(Tags.UserHitAudioTrigger);
        const audioData = hitSoundEntity.get(Tags.UserHitAudioTrigger);
        const hasIce = activeEnv.length
          ? activeEnv[0].get(Tags.EnvironmentState).name === "tundra"
          : false;
        audioData.type = hasIce ? "ice" : "water";
      }
    } else if (showEffect) {
      spawnTime += dt;
      if (spawnTime >= spawnDelay) {
        spawnTime %= spawnDelay;
        spawnDelay = newSpawnDelay();
        outer: for (let i = 0; i < particleEmitters.length; i++) {
          const e = particleEmitters[i];
          const pos = e.get(Tags.ParticleEmit).position;
          const n = random.rangeFloor(1, 5);
          for (let i = 0; i < n; i++) {
            if (!spawnOne(userPos, userVelocity, true)) break outer;
          }
        }
      }
    }

    particleEmitters.forEach((e) => {
      const p = e.get(Tags.ParticleEmit);
      p.elapsed += dt;
      if (p.elapsed >= p.duration) {
        e.tagOff(Tags.ParticleEmit);
      }
    });

    activeMeshes.forEach((e) => {
      const m = e.get(Tags.Object3D);
      m.userData.time += dt;
      const curTime = m.userData.time - m.userData.delay;
      if (!m.visible && curTime >= 0) {
        m.visible = true;
      }
      const curElapsed = Math.max(0, curTime);
      const curAlpha = MathUtil.clamp01(curElapsed / m.userData.duration);
      const scl = Math.max(1e-5, Math.sin(curAlpha * Math.PI));
      m.scale.setScalar(m.userData.scale * scl);
      m.position.addScaledVector(m.userData.velocity, m.userData.speed);
      m.position.y += dt;
      if (curElapsed >= m.userData.duration) {
        m.visible = false;
        e.kill();
        m.userData._entity = null;
        pool.release(m);
      }
    });
  };

  function spawnOne(userPos, userVelocity, big) {
    const m = pool.next();
    if (!m) return false;
    m.userData._entity = world
      .entity()
      .add(Tags.WaterFollowParticle)
      .add(Tags.Object3D, m);
    m.userData.velocity.copy(userVelocity);
    m.quaternion.fromArray(random.quaternion(tmpArr4D));
    m.position.copy(userPos);
    random.insideCircle(random.range(1, 2), tmpArr2D);
    m.position.x += tmpArr2D[0];
    m.position.z += tmpArr2D[1];
    m.position.y = random.range(0.01, 0.25);
    m.visible = false;
    m.userData.scale = (big ? 0.6 : 0.4) * random.gaussian(0.1, 0.1 / 3);
    m.userData.time = 0;
    m.userData.delay = random.range(0, 0.5);
    m.userData.speed = random.range(0.05, 0.5);
    m.userData.duration = random.range(1, 1.5);
    return m;
  }
}
