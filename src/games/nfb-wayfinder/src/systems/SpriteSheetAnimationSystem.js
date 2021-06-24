import * as Tags from "../tags";
import * as THREE from "three";
import * as MathUtil from "../util/math";
import SpriteManager from "../util/SpriteManager";
import { loadTexture } from "../util/load";

import { shareAtlasTexture } from "../util/three-util";
import Assets from "../util/Assets";

const sheetIds = {
  forest: "spritesheets/tree-anim-a",
  grasslands: "spritesheets/tree-anim-b",
  tundra: "spritesheets/tree-anim-b",
};

// Assets.prepare(sheets.forest);

export default async function SpriteSheetAnimationSystem(world) {
  const renderer = world.findTag(Tags.Renderer);

  // TODO: remove this await ...
  // const sheet = await SpriteManager("spritesheets/tree-anim-a", renderer);
  let sheet;
  let setSheet = (s) => {
    sheet = s;
  };

  const animationView = world.view([Tags.Object3D, Tags.SpriteAnimation]);

  const lazyLoaders = world.view([
    Tags.SpriteAnimation,
    Tags.SpriteAnimationLazyLoadSheet,
  ]);
  const spriteCache = {};

  const fps = 12;
  const frameInterval = 1 / fps;
  let currentBiome = null;

  // SpriteManager(id, renderer).then((sheet) => setSheet(sheet));

  return function SpriteSheetAnimationSystem(dt) {
    lazyLoaders.forEach((e) => {
      const s = e.get(Tags.SpriteAnimationLazyLoadSheet);
      const d = e.get(Tags.SpriteAnimation);
      const id = s.id;
      if (id in spriteCache) {
        // see if sprite has loaded
        const asset = spriteCache[id];
        if (asset && asset.loaded) {
          d.sheet = asset.sheet;
          if (s.playOnLoad && !d.playing) d.start();
          // console.log("LAZY LOAD DONE", d.sheet, asset.sheet, id);
          e.remove(Tags.SpriteAnimationLazyLoadSheet);
        }
      } else {
        // console.log("LAZY LOAD START", id);
        spriteCache[id] = {
          sheet: null,
          loaded: false,
          promise: SpriteManager(id, renderer).then((sheet) => {
            spriteCache[id].loaded = true;
            spriteCache[id].sheet = sheet;
          }),
        };
      }
    });

    animationView.forEach((e) => {
      const d = e.get(Tags.SpriteAnimation);
      const sheet = d.sheet;
      const object = e.get(Tags.Object3D);

      if (d.lastFrame == null && sheet) {
        const frame = sheet.frames[0];
        setFrame(object, frame, d.fixSpriteAspect);
        d.lastFrame = frame;
        d.frame = 0;
        d.dirty = false;
      }

      object.material.visible = Boolean(sheet);

      if (d.playing && sheet) {
        const totalFrames = sheet.frames.length;
        d.elapsed += dt * d.speed;
        if (d.elapsed >= d.delay && d.elapsed - d.delay >= frameInterval) {
          d.elapsed = d.delay;
          d.frame++;
          const endFrame =
            d.looping && d.loopEnd != null ? d.loopEnd : totalFrames;
          if (d.frame >= endFrame) {
            if (d.looping) {
              if (d.loopStart != null) {
                d.frame = d.loopStart;
              } else {
                d.frame = 0;
              }
              d.currentLoop++;
            } else {
              d.frame = totalFrames - 1;
              d.playing = false;
              d.finished = true;
            }
            if (d.onLoopEnd) d.onLoopEnd(e);
          }
          d.dirty = true;
        }
      }

      if (d.dirty && sheet) {
        d.dirty = false;
        const frame = sheet.frames[d.frame];
        setFrame(object, frame, d.fixSpriteAspect);
        d.lastFrame = frame;
      }
    });
  };

  function setFrame(object, frame, fixAspect) {
    const material = object.material;
    const tex = material.uniforms.map.value;
    shareAtlasTexture(renderer, frame.atlas, tex);
    // console.log("set frame", object.name, frame);
    material.uniforms.repeat.value.copy(frame.repeat);
    material.uniforms.offset.value.copy(frame.offset);
    if (fixAspect) {
      const aspect = frame.width / frame.height;
      object.scale.x = object.scale.y * aspect;
    }
  }
}
