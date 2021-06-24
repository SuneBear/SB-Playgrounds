import * as Tags from "../../tags";
import { Data, Types } from "../../tags";
import * as THREE from "three";
import { TextureLoader } from "three";
import Random from "../../util/Random";
import * as MathUtil from "../../util/math";
import SpriteAnimation from "../../util/SpriteAnimation";

import { createSprite, setSpriteFlip } from "../../util/EditorWayfinderSprite";

const VA = new THREE.Vector3();
const VB = new THREE.Vector3();

class Fox extends Data {
  static data = {
    state: Types.Ref("sleep"), // sleep || awake
    canPlayHmSound: Types.Ref(true)
  };
}

let soundHmTimer

// Systems are functions that accept a 'world' fragment
// make sure you name this function when you create a new system
export default function foxSystem(world) {
  const random = Random();

  const events = world.listen([Tags.Object3D, Tags.FoxSpriteTag]);
  const view = world.view([Tags.Object3D, Tags.FoxSpriteTag]);

  const foxHmEvent = world.listen(Tags.FoxHm);

  const distThreshold = 13;
  const user = world.findTag(Tags.UserCharacter);

  const distThresholdSq = distThreshold * distThreshold;

  const tmpBox = new THREE.Box3();
  // The "patch" loading system will actually emit these entities for us
  // const testFakeAdd = () => {
  //   const sprite = createSprite(world, new THREE.Texture());
  //   sprite.position.set(random.range(6, 8) * random.sign(), 0, -2);
  //   world
  //     .entity()
  //     .add(Tags.Object3D, sprite)
  //     .add(Tags.ShaderUniformTime, {
  //       uniform: sprite.material.uniforms.time,
  //     })
  //     .add(Tags.ShadowCaster, { sprite: true })
  //     .add(Tags.FoxSpriteTag);
  // };
  // testFakeAdd();

  // the return value of a system is a function that
  // is called on each tick
  return function FoxSystem(dt) {
    events.added.forEach((e, idx) => {
      const object = e.get(Tags.Object3D);
      e.add(Fox)

      // randomly flip the sprite
      setSpriteFlip(object, random.boolean());

      // Scale for all fox sprites
      object.scale.y = 1.5;

      // Add sprite animation to it
      e.add(Tags.SpriteAnimation);
      const anim = e.get(Tags.SpriteAnimation);
      anim.looping = true;

      anim.loopStart = 0;
      anim.loopEnd = 29;

      // anim.onLoopEnd = (e) => {
      //   const fox = e.get(Fox)
      //   console.log(fox)
        
      //   if (fox.state == 'awake' && fox.canPlayHmSound) {
      //     console.log(anim.frame)
      //     // fox.canPlayHmSound = false
      //     e.add(Tags.FoxHm)
      //     anim.loopStart = 29;
      //     anim.loopEnd = 68;
      //   }
      // }

      e.add(Tags.SpriteAnimationLazyLoadSheet);
      const lazy = e.get(Tags.SpriteAnimationLazyLoadSheet);
      lazy.id = "spritesheets/fox";
    });

    const frustum = world.findTag(Tags.MainCameraFrustum);

    const userPosition = user.position;
    VA.x = userPosition.x;
    VA.z = userPosition.z;

    view.forEach((e, idx) => {
      const mesh = e.get(Tags.Object3D);
      const anim = e.get(Tags.SpriteAnimation);
      const fox = e.get(Fox)

      VB.setFromMatrixPosition(mesh.matrixWorld);

      // can also do this but it includes an additional unnecessary update
      // mesh.getWorldPosition(VB);

      const dx = VA.x - VB.x;
      const dz = VA.z - VB.z;
      const dstSq = dx * dx + dz * dz;
      
      if (dstSq < distThresholdSq) {
        fox.state = 'awake'
        anim.loopStart = 29;
        anim.loopEnd = 68;
        if(anim.frame >= 30 && anim.frame <= 33 && fox.canPlayHmSound) {
          fox.canPlayHmSound = false
          e.add(Tags.FoxHm)
          e.remove(Tags.FoxPurring)
          soundHmTimer = setTimeout( () => { 
            e.remove(Tags.FoxHm)
            fox.canPlayHmSound = true
          }, 5000 )
        }
      } else {
        fox.state = 'sleep'
        anim.loopStart = 0;
        anim.loopEnd = 29;

        // in camera view
        tmpBox.setFromObject(mesh);
        if (frustum.intersectsBox(tmpBox)) {
          e.add(Tags.FoxPurring)
        }
        else {
          e.remove(Tags.FoxHm)
          e.remove(Tags.FoxPurring)
        }

      }
    });
  };
}
