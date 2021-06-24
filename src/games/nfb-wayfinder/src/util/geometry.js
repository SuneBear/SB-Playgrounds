import { lerpArray } from "./math";
import boundPoints from "bound-points";
import euclideanSq from "euclidean-distance/squared";

export function boundsToEdges(bounds) {
  const [min, max] = bounds;
  // const w = max[0] - min[0];
  // const h = max[1] - min[1];
  const verts = [
    [min[0], min[1]],
    [max[0], min[1]],
    [max[0], max[1]],
    [min[0], max[1]],
  ];
  const edges = [];
  for (let i = 0; i < verts.length; i++) {
    const a = verts[i];
    const b = verts[(i + 1) % verts.length];
    edges.push([a, b]);
  }
  return edges;
}

export function boundsIntersect(boundsA, boundsB) {
  const [minA, maxA] = boundsA;
  const [minB, maxB] = boundsB;

  const [aMinX, aMinY] = minA;
  const [aMaxX, aMaxY] = maxA;
  const [bMinX, bMinY] = minB;
  const [bMaxX, bMaxY] = maxB;

  const noOverlap =
    aMinX > bMaxX || bMinX > aMaxX || aMinY > bMaxY || bMinY > aMaxY;
  return !noOverlap;
}

export function boundsInsideOther(boundsA, boundsB) {
  const [minA, maxA] = boundsA;
  const [minB, maxB] = boundsB;

  const width = maxA[0] - minA[0];
  const height = maxA[1] - minA[1];
  const x = minA[0];
  const y = minA[1];

  const owidth = maxB[0] - minB[0];
  const oheight = maxB[1] - minB[1];
  const ox = minB[0];
  const oy = minB[1];

  return (
    width > 0 &&
    height > 0 &&
    owidth > 0 &&
    oheight > 0 &&
    ox >= x &&
    ox + owidth <= x + width &&
    oy >= y &&
    oy + oheight <= y + height
  );
}

export function getBoundingCircle(points, bounds = null) {
  if (!bounds) bounds = boundPoints(points);
  const center = lerpArray(bounds[0], bounds[1], 0.5);
  let maxRadiusSq = 0;
  for (let i = 0; i < points.length; i++) {
    maxRadiusSq = Math.max(maxRadiusSq, euclideanSq(points[i], center));
  }
  const radius = Math.sqrt(maxRadiusSq);
  return {
    center,
    radius,
  };
}

export function circlesIntersect(positionA, radiusA, positionB, radiusB) {
  const dx = positionA[0] - positionB[0];
  const dy = positionA[1] - positionB[1];
  const dsq = dx * dx + dy * dy;
  const r = radiusA + radiusB;
  const rsq = r * r;
  return dsq <= rsq;
}

export function point2DInsideBounds(p, bounds) {
  const [x, y] = p;
  const [min, max] = bounds;
  return x >= min[0] && x < max[0] && y >= min[1] && y < max[1];
}

export function circleInsideBounds(p, radius, bounds) {
  const [x, y] = p;
  const [min, max] = bounds;
  return (
    x - radius >= min[0] &&
    x + radius < max[0] &&
    y - radius >= min[1] &&
    y + radius < max[1]
  );
}

export function vertsToEdges(verts) {
  const e = [];
  for (let i = 0; i < 4; i++) {
    const a = verts[i];
    const b = verts[(i + 1) % verts.length];
    e.push([a, b]);
  }
  return e;
}

export function boundsToVerts(bounds) {
  const [min, max] = bounds;
  const [nx, ny] = min;
  const nw = max[0] - min[0];
  const nh = max[1] - min[1];
  return [
    [nx, ny],
    [nx + nw, ny],
    [nx + nw, ny + nh],
    [nx, ny + nh],
  ];
}

export function intersectLineSegmentLineSegment(p1, p2, p3, p4) {
  // Reference:
  // https://github.com/evil-mad/EggBot/blob/master/inkscape_driver/eggbot_hatch.py
  const d21x = p2[0] - p1[0];
  const d21y = p2[1] - p1[1];
  const d43x = p4[0] - p3[0];
  const d43y = p4[1] - p3[1];

  // denominator
  const d = d21x * d43y - d21y * d43x;
  if (d === 0) return -1;

  const nb = (p1[1] - p3[1]) * d21x - (p1[0] - p3[0]) * d21y;
  const sb = nb / d;
  if (sb < 0 || sb > 1) return -1;

  const na = (p1[1] - p3[1]) * d43x - (p1[0] - p3[0]) * d43y;
  const sa = na / d;
  if (sa < 0 || sa > 1) return -1;
  return sa;
}
