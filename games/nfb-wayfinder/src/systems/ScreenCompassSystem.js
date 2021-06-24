import * as Tags from "../tags";
import * as THREE from "three";
import * as MathUtil from "../util/math";
import { setEntityTweenFromTo, tweenTo } from "./AnimationSystem";
import {
  createSpriteMaterial,
  getEmptyTexture,
  createTokenMaterial,
  getSpriteGeometry,
  setSpriteToken,
} from "../util/materials";

export default function ScreenCompassSystem(world) {
  const container = new THREE.Group();
  container.name = "compass";
  world.entity().add(Tags.Object3D, container);

  const tokenView = world.view([Tags.GroundAsset, Tags.GroundAssetToken]);
  const envCells = world.view(Tags.EnvironmentCell);
  const tokensDiscovered = world.findTag(Tags.TokensDiscoveredSet);

  const envState = world.view([
    Tags.EnvironmentState,
    Tags.ActiveEnvironmentState,
  ]);

  const target = world.findTag(Tags.UserTarget);
  const char = world.findTag(Tags.UserCharacter);

  const tokenPointers = new Array(3).fill(null).map(() => {
    const mesh = new THREE.Mesh(getSpriteGeometry(), createTokenMaterial());
    mesh.renderOrder = 10;
    mesh.name = "dot";
    mesh.userData.currentAngle = null;
    mesh.userData.currentSize = 0;
    mesh.userData.lastToken = null;
    mesh.userData.lastTokenType = null;
    container.add(mesh);
    return mesh;
  });

  return (dt) => {
    if (!envState.length) return;
    const activeEnv = envState[0];
    const tokens = activeEnv.get(Tags.EnvironmentState).tokens;

    const isDirectingToOrigin = Boolean(world.findTag(Tags.DirectUserToOrigin));
    const ignoreTokens = Boolean(world.findTag(Tags.BlockTokenCollection));
    const canCollect = !isDirectingToOrigin && !ignoreTokens;

    const closest = tokens
      .filter((t) => {
        const canCollectType = !tokensDiscovered.has(t.type);
        return canCollect && canCollectType;
      })
      .map((t) => {
        const x = t.position[0];
        const z = t.position[1];
        const dx = x - target.position.x;
        const dz = z - target.position.z;
        const dSq = dx * dx + dz * dz;
        return [dSq, t];
      });
    closest.sort((a, b) => a[0] - b[0]);
    const best = closest.slice(0, 3).map((s) => s[1]);
  };
}
