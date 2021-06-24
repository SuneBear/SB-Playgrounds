import * as THREE from "three";
import * as Tags from "../tags";

export default function ShaderUniformSystem(world) {
  world.system.info({ hidden: true });
  const resolutions = world.view(Tags.ShaderUniformResolution);
  const timeUniforms = world.view(Tags.ShaderUniformTime);
  const userTargetPositions = world.view(Tags.ShaderUniformUserTargetPosition);
  const userCharacterPositions = world.view(
    Tags.ShaderUniformUserCharacterPosition
  );
  const sizeVec = new THREE.Vector2();
  const renderer = world.findTag(Tags.Renderer);
  const appState = world.findTag(Tags.AppState);
  return function shaderUniformSystem(dt) {
    sizeVec.x = appState.width;
    sizeVec.y = appState.height;
    resolutions.forEach((e) => {
      const d = e.get(Tags.ShaderUniformResolution);
      if (d.uniform) {
        d.uniform.value.set(sizeVec.x, sizeVec.y);
      }
    });
    timeUniforms.forEach((e) => {
      const u = e.get(Tags.ShaderUniformTime);
      u.elapsed += dt;
      if (u.uniform) {
        u.uniform.value = u.elapsed;
      }
    });
    const target = world.findTag(Tags.UserTarget).position;
    const character = world.findTag(Tags.UserCharacter).position;
    userTargetPositions.forEach((e) => {
      const u = e.get(Tags.ShaderUniformUserTargetPosition);
      if (u.uniform) {
        u.uniform.value.copy(target);
      }
    });

    userCharacterPositions.forEach((e) => {
      const u = e.get(Tags.ShaderUniformUserCharacterPosition);
      if (u.uniform) {
        u.uniform.value.copy(character);
      }
    });
  };
}
