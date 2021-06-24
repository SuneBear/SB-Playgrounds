import * as Tags from "../tags";
import * as THREE from "three";
import { insideWaterPolys } from "../util/water-util";
import Random from "../util/Random";

export default function AnimalSpawnSystem(world) {
  let spawnTimer = 0;
  let maxBirds = 2;

  const types = {
    forest: ["bird"],
    grasslands: ["butterfly"],
    tundra: ["jumpingrabbit"],
  };

  const random = Random();
  const newSpawnDelay = () => random.range(5, 5);
  let spawnDelay = newSpawnDelay();
  const activeEnv = world.view(Tags.ActiveEnvironmentState);
  const tmpPos = new THREE.Vector3();
  const tmpArr2D = [0, 0];
  const maxAnimalsOnScreen = 2;
  const animalView = world.view(Tags.Animal);
  const animalSpawns = world.view(Tags.AnimalSpawn);

  const underPlayer = world.findTag(Tags.EnvironmentUnderPlayerState);

  const centerRadius = 15;
  const centerRadiusSq = centerRadius * centerRadius;
  const target = world.findTag(Tags.UserTarget);
  let lastPos = null;
  const moveSpawnRadius = 4;
  const moveSpawnRadiusSq = moveSpawnRadius * moveSpawnRadius;

  return (dt) => {
    const envState = activeEnv.length
      ? activeEnv[0].get(Tags.EnvironmentState)
      : null;
    const env = envState && envState.name;
    if (!env || !types[env].length) return;

    let userInWater = underPlayer.water;
    const drifting = world.findTag(Tags.GameLandingCameraDrift);

    const hasMoved =
      !lastPos ||
      target.position.distanceToSquared(lastPos) >= moveSpawnRadiusSq;

    // When the user is in the water, trigger fish based on distance to placeholders
    if (!userInWater && !drifting && hasMoved) {
      spawnTimer += dt;
      if (spawnTimer >= spawnDelay) {
        spawnTimer %= spawnDelay;
        spawnDelay = newSpawnDelay();
        if (!lastPos) lastPos = new THREE.Vector3();
        lastPos.copy(target.position);

        if (!world.findTag(Tags.TutorialState)) {
          let valid = false;
          let positionInWater = false;
          let animalType;

          tmpPos.copy(target.position).addScaledVector(target.direction, 25);
          tmpArr2D[0] = tmpPos.x;
          tmpArr2D[1] = tmpPos.z;
          valid = true;

          const dstSq = tmpPos.x * tmpPos.x + tmpPos.z * tmpPos.z;
          if (dstSq < centerRadiusSq) valid = false;

          if (valid) {
            if (insideWaterPolys(envState, tmpArr2D)) {
              valid = false;
            }
          }
          if (valid) animalType = random.pick(types[env]);

          if (valid && animalType) {
            console.log("Spawning animals!", animalType, positionInWater);

            const e = world.entity();
            e.add(Tags.AnimalSpawn);

            const s = e.get(Tags.AnimalSpawn);
            s.position.copy(tmpPos);
            s.lake = positionInWater;
            s.biome = env;
            s.animal = animalType;
          }
        }
      }
    }

    // remove spawns after they are picked up by other systems
    // since some spawns might not trigger any animals depending on conditions
    animalSpawns.forEach((e) => {
      const s = e.get(Tags.AnimalSpawn);
      s.time += dt;
      if (s.time >= s.duration) e.kill();
    });
  };
}
