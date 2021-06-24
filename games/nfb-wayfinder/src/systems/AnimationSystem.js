import * as Tags from "../tags";
import * as THREE from "three";
import * as MathUtil from "../util/math";
import * as eases from "eases";

export function tweenTo(world, target, key, to, duration, ease, delay) {
  const e = world.entity();
  setEntityTweenFromTo(e, target, key, target[key], to, duration, ease, delay);
  e.get(Tags.TargetKeyTween).assignFromOnStart = true;
  return e;
}

export function createTimerTween(world, duration, delay, onStart, onFinish) {
  const e = world.entity();
  setEntityTweenFromTo(e, null, null, 0, 1, duration, null, delay);
  return e;
}

export function tweenFromTo(
  world,
  target,
  key,
  from,
  to,
  duration,
  ease,
  delay
) {
  const e = world.entity();
  setEntityTweenFromTo(e, target, key, from, to, duration, ease, delay);
  return e;
}

export function setEntityTweenFromTo(
  entity,
  target,
  key,
  from,
  to,
  duration,
  ease,
  delay
) {
  entity.add(Tags.TargetKeyTween);
  const t = entity.get(Tags.TargetKeyTween);
  t.duration = duration != null ? duration : 1;
  t.ease = ease || "linear";
  t.target = target;
  t.key = key;
  t.from = from;
  t.to = to;
  t.delay = delay || 0;
  t.elapsed = 0;
  t.finished = false;
  t.active = true;
  t.started = false;
  t.killEntityOnFinish = true;
  t.assignFromOnStart = false;
}

export default function AnimationSystem(world) {
  const tweens = world.view(Tags.TargetKeyTween);
  const copyScalar = world.view([
    Tags.TargetKeyTween,
    Tags.TweenCopyTargetKeyToVectorScalar,
  ]);
  // const killables = world.view(Tags.KillEntityAfterTweens);
  // const copyVector = world.view([Tags.CopyTweenValueToVector, Tags.Tween]);

  return function animationSystem(dt) {
    const isModalStopping = Boolean(
      world.findTag(Tags.ModalStoppingUserMovement)
    );
    tweens.forEach((e) => {
      const d = e.get(Tags.TargetKeyTween);
      if (!d.active) return;
      if (d.pauseOnModal && isModalStopping) return;

      if (!d.finished) {
        if (d.elapsed >= d.delay) {
          let t = Math.min(1, Math.max(0, d.elapsed - d.delay) / d.duration);
          if (typeof d.ease === "string" && d.ease && d.ease in eases) {
            t = eases[d.ease](t);
          } else if (typeof d.ease === "function") {
            t = d.ease(t);
          }
          if (!d.started) {
            if (d.assignFromOnStart) {
              if (d.target) d.from = d.target[d.key];
            }
            d.started = true;
            if (d.callbackOnStart && typeof d.callbackOnStart === "function") {
              d.callbackOnStart(e);
            }
          }
          if (d.target) d.target[d.key] = MathUtil.lerp(d.from, d.to, t);
        }
        d.elapsed += dt;
        if (d.elapsed - d.delay > d.duration) {
          d.finished = true;
          if (d.target) d.target[d.key] = d.to;
          if (d.callbackOnFinish && typeof d.callbackOnFinish === "function") {
            d.callbackOnFinish(e);
          }
        }
      }

      if (d.finished && d.killEntityOnFinish) {
        e.kill();
      }
    });
    copyScalar.forEach((e) => {
      const d = e.get(Tags.TargetKeyTween);
      if (!d.active) return;
      const vec = e.get(Tags.TweenCopyTargetKeyToVectorScalar);
      if (d.started && d.target && d.key) {
        const s = d.target[d.key];
        if (vec) vec.setScalar(s);
      }
    });

    // killables.forEach((e) => {
    //   // find all tweens associated with this entity
    //   if (!hasActiveTweenMatching(e)) {
    //     console.log("killing entity");
    //     e.kill();
    //   }
    // });
  };

  // function hasActiveTweenMatching(entity) {
  //   for (let i = 0; i < tweens.length; i++) {
  //     const e = tweens[i];
  //     if (!e.alive || !e.has(Tags.TargetKeyTween)) continue;
  //     const d = e.get(Tags.TargetKeyTween);
  //     if (!d.finished && ) return true;
  //   }
  //   return false;
  // }
}
