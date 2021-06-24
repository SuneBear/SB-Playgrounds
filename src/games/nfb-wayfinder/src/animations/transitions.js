import * as eases from "eases";
import { lerp, lerpAngle } from "../util/math";

export function transition(fn, opts = {}) {
  return (node, args = {}) => {
    return fn(node, { ...args, ...opts });
  };
}

export function emptyTransition(node, opts = {}) {
  // const o = +getComputedStyle(node).opacity;
  // delay = delay + stagger * index;
  return {
    delay: 0,
    duration: 0,
    css: (t) => "",
  };
}

export function fadeOpacityTransition(
  node,
  {
    index = 0,
    opacity = 0,
    stagger = 200,
    delay = 0,
    duration = 350,
    reverse = false,
  } = {}
) {
  const o = +getComputedStyle(node).opacity;
  delay = delay + stagger * index;
  return {
    delay,
    duration,
    tick(t) {
      let b = eases.sineIn(t);
      if (reverse) b = 1 - b;
      node.style.opacity = lerp(opacity, o, b);
    },
  };
}

export function fadeInTransition(
  node,
  {
    x = 0,
    y = -10,
    endX = 0,
    endY = 0,
    endAngle = 0,
    angle = 0,
    opacity = 0,
    index = 0,
    stagger = 200,
    delay = 0,
    duration = 1000,
    reverse = false,
  } = {}
) {
  const o = +getComputedStyle(node).opacity;
  delay = delay + stagger * index;

  return {
    delay,
    duration,
    tick(t) {
      let a = eases.quartOut(t);
      let b = eases.sineIn(t);
      if (reverse) {
        a = 1 - a;
        b = 1 - b;
      }
      const px = lerp(x, endX, a);
      const py = lerp(y, endY, a);
      const pangle = lerpAngle(angle, endAngle, b);
      node.style.transformOrigin = "50% 50%";
      node.style.transform = `translate(${px}px, ${py}px) rotateZ(${pangle}rad)`;
      node.style.opacity = lerp(opacity, o, b);
    },
    // css(t) {
    //   const a = eases.quartOut(t);
    //   const b = eases.sineIn(t);
    //   const py = lerp(y, 0, a);
    //   return `
    //     transform: translate(0px, ${py}px);
    //     opacity: ${lerp(opacity, o, b)};
    //   `;
    // },
  };
}

export function fadeTransition(node, opts = {}) {
  return fadeInTransition(node, opts);
}

export function fadeOutTransition(node, opts = {}) {
  return fadeInTransition(node, opts);
}
