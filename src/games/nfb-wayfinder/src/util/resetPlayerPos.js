import * as THREE from "three";

export const standingNextToOriginTree = new THREE.Vector3(7, 0, 3);
export const playerStart = new THREE.Vector3(7, 0, 3);

// export const standingNextToOriginTree = new THREE.Vector3(34.19839943737152, 0, -18.377668713353398);
// export const playerStart = new THREE.Vector3(34.19839943737152, 0, -18.377668713353398);

export default function resetPlayerPos(world) {
  setPlayerPos(world, playerStart);
  world.findTag(Tags.UserTarget).position.set(0, 0, 0);
}

export function setPlayerPos(world, position) {
  world.findTag(Tags.UserTarget).position.copy(position);
  const char = world.findTag(Tags.UserCharacter);
  if (char) char.position.copy(position);
}
