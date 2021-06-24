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
  tundra: "spritesheets/tree-anim-c",
};

// Assets.prepare(sheets.forest);

export default function TreeSpriteAnimationSystem(world) {
  const renderer = world.findTag(Tags.Renderer);
  const activeEnv = world.view(Tags.ActiveEnvironmentState);
  const animationView = world.view([
    Tags.Object3D,
    Tags.SpriteAnimation,
    Tags.SpriteAnimationOriginTreeTag,
  ]);
  let currentBiome = null;
  let currentSheet;

  let tundraSheet;
  const endGameView = world.view(Tags.EndGameState);
  const outroFinishedView = world.view(Tags.OutroFinished);

  return function TreeSpriteAnimationSystem(dt) {
    let biome;
    if (activeEnv.length) {
      biome = activeEnv[0].get(Tags.EnvironmentState).name;
      if (biome !== currentBiome) {
        currentBiome = biome;
        if (endGameView.length === 0 && outroFinishedView.length === 0) {
          // console.log("[sheet] CLEARING!");
          currentSheet = null; // clear current sheet so we don't render the wrong image
          // load the new asset ID and set sheet
          const id = sheetIds[biome];
          SpriteManager(id, renderer).then((sheet) => {
            currentSheet = sheet;
            if (biome === "tundra") tundraSheet = sheet;
          });
        }
      }
    }

    // console.log("trees", animationView.length);
    animationView.forEach((e) => {
      const d = e.get(Tags.SpriteAnimation);

      // update current sheet
      let oldSheet = d.sheet;
      d.sheet = outroFinishedView.length > 0 ? tundraSheet : currentSheet;
      // console.log("SPRITE TREE", d.sheet);
      if (oldSheet !== d.sheet) {
      }

      if (biome === "tundra") {
        e.get(Tags.Object3D).position.y = -0.25;
      }

      if (d.sheet && outroFinishedView.length > 0) {
        //
        const frameIndex = d.sheet.frames.length - 1;
        const oldFrame = d.frame;
        d.frame = frameIndex;
        d.playing = false;
        if (oldSheet !== d.sheet || oldFrame !== d.frame) {
          d.dirty = true;
        }
      }
    });
  };

  function setFrame(object, frame) {
    const material = object.material;
    const tex = material.uniforms.map.value;
    shareAtlasTexture(renderer, frame.atlas, tex);
    material.uniforms.repeat.value.copy(frame.repeat);
    material.uniforms.offset.value.copy(frame.offset);
  }
}

function getFrameIndex(time, fps, totalFrames, loop) {
  const duration = fps * totalFrames;
  if (!loop && time >= duration) return totalFrames - 1;

  const timeOffset = 0;
  const playMode = 0;
  const intervalMS = (1 / fps) * 1000;
  const timeMS = Math.round((time * 1000) / intervalMS) * intervalMS;

  const N = totalFrames;
  const elapsed = timeMS / 1000;
  const playDirection = 1;

  let curFrameReal = fps * elapsed * playDirection;
  curFrameReal = MathUtil.wrap(curFrameReal, 0, N);

  let curFrame = Math.floor(curFrameReal);
  const fract = curFrameReal - curFrame;
  curFrame = Math.max(0, Math.min(curFrame, totalFrames - 1));
  return curFrame;
}
