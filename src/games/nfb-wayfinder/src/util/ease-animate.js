const linear = (t) => t;

export default function easeAnimate(
  elapsed = 0,
  duration = 1,
  delay = 0,
  animateDuration = 0.25,
  ease = linear
) {
  const time = Math.max(0, elapsed - delay);
  let anim = 0;
  if (time <= animateDuration) {
    anim = time / animateDuration;
  } else if (isFinite(duration) && time >= duration - animateDuration) {
    const el = Math.max(0, time - (duration - animateDuration));
    const t = el / animateDuration;
    anim = 1 - t;
  } else {
    anim = 1;
  }
  anim = ease(anim);
  return anim;
}
