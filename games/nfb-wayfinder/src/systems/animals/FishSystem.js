import * as Tags from "../../tags";
import { Data, Tag, Types } from "../../tags";
import * as THREE from "three";
import { TextureLoader } from "three";
import Random from "../../util/Random";
import spriteURL from "../../assets/spritesheets/fish.png";
import * as MathUtil from "../../util/math";
import SpriteAnimation from "../../util/SpriteAnimation";

// import sheetData from "../../assets/spritesheets/fish.sheet.json";
import { createSprite, setSpriteFlip } from "../../util/EditorWayfinderSprite";

class FishTag extends Data {
  static data = {
    spawnEntity: Types.Ref(null),
  };
}

class FishVisible extends Tag {}

// Systems are functions that accept a 'world' fragment
// make sure you name this function when you create a new system
export default function FishSystem(world) {
  const random = Random();

  const waterPlaceholders = world.view(Tags.WaterFishPlaceholderTag);
  const character = world.findTag(Tags.UserCharacter);
  const spawnRadius = 8;
  const DEBUG = false;
  const geo = DEBUG ? new THREE.SphereGeometry(1, 32, 32) : null;

  const spawnRadiusSq = spawnRadius * spawnRadius;
  const fishView = world.view([Tags.SpriteAnimation, FishTag]);
  const envState = world.view([
    Tags.EnvironmentState,
    Tags.ActiveEnvironmentState,
  ]);

  // spawnOne(new THREE.Vector3(-6, 0, -2));
  // the return value of a system is a function that
  // is called on each tick
  return function FishSystem(dt) {
    if (
      envState.length &&
      envState[0].get(Tags.EnvironmentState).name !== "grasslands"
    ) {
      return;
    }
    const userPos = character.position;

    // kill fish after loop is done
    fishView.forEach((e) => {
      if (e.get(Tags.SpriteAnimation).finished) {
        e.get(FishTag).spawnEntity.remove(FishVisible);
        e.kill();
      }
    });

    waterPlaceholders.forEach((e) => {
      // check to see if we should spawn
      const a = e.get(Tags.GroundAsset);
      const dx = a.x - userPos.x;
      const dz = a.z - userPos.z;
      const dSq = dx * dx + dz * dz;
      const isInside = dSq <= spawnRadiusSq;
      if (isInside) {
        if (!e.has(Tags.UserHasHit)) {
          e.add(Tags.UserHasHit);
          if (!e.has(FishVisible)) {
            e.add(FishVisible);
            spawnOne(e, a.x, a.z);
          }
        }
      } else {
        if (e.has(Tags.UserHasHit)) {
          e.remove(Tags.UserHasHit);
        }
      }

      // TODO: DEBUG CODE TO HIGHLIGHT HIT AREA, REMOVE LATER
      if (DEBUG) {
        if (!e.has(Tags.Object3D)) {
          const m = new THREE.Mesh(
            geo,
            new THREE.MeshBasicMaterial({ color: "red", wireframe: true })
          );
          m.scale.setScalar(spawnRadius);
          m.position.y = 0;
          const asset = e.get(Tags.GroundAsset);
          m.position.x = asset.x;
          m.position.z = asset.z;
          e.add(Tags.Object3D, m);
        }
        e.get(Tags.Object3D).material.color.set(
          e.has(Tags.UserHasHit) ? "green" : "red"
        );
      }
    });
  };

  function spawnOne(linked, x, z) {
    const sprite = createSprite(world, new THREE.Texture());
    sprite.position.set(x, 0, z);
    const e = world
      .entity()
      .add(Tags.Object3D, sprite)
      .add(Tags.ShaderUniformTime, {
        uniform: sprite.material.uniforms.time,
      })
      .add(Tags.ShadowCaster, { sprite: true })
      .add(Tags.AnimalSound, "fish")
      .add(FishTag, { spawnEntity: linked });

    // randomly flip the sprite
    setSpriteFlip(sprite, random.boolean());

    // Scale for all fish sprites
    const scl = 4;
    sprite.scale.x = scl;
    sprite.scale.y = scl * 0.6666;

    // Add sprite animation to it
    e.add(Tags.SpriteAnimation);
    const anim = e.get(Tags.SpriteAnimation);

    // Lazily load sprite sheet based on when it's first added to scene
    e.add(Tags.SpriteAnimationLazyLoadSheet);
    const lazy = e.get(Tags.SpriteAnimationLazyLoadSheet);
    lazy.id = "spritesheets/fish";
  }
}
