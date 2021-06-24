import * as Tags from "../tags";
import * as THREE from "three";
import arrayAlmostEqual from "array-almost-equal";
import { setPointsToBufferPosition } from "./three-util";
import boundPoints from "bound-points";
import { inverseLerp, linspace } from "canvas-sketch-util/math";
import earcut from "earcut";
import * as GeomUtil from "./geometry";

let circleLineGeo;
let sphereGeo;

export function multiLineSegments2D(segments, opt = {}) {
  const geometry = new THREE.Geometry();
  const mesh = new THREE.LineSegments(
    geometry,
    new THREE.LineBasicMaterial({
      color: "white",
      ...opt,
    })
  );
  mesh.updateData = update;
  if (segments) update(segments);
  return mesh;

  function update(segments) {
    geometry.vertices.length = 0;
    segments.forEach((s) => {
      s.forEach((a) => {
        geometry.vertices.push(new THREE.Vector3(a[0], 0, a[1]));
      });
    });
    geometry.verticesNeedUpdate = true;
  }
}

export function multiPoly2D(polygons = [], opt = {}) {
  const { closed = true } = opt;
  const geometry = new THREE.Geometry();
  const mesh = new THREE.LineSegments(
    geometry,
    new THREE.LineBasicMaterial({
      color: "white",
      ...opt,
    })
  );
  mesh.updateData = update;
  if (polygons) update(polygons);
  return mesh;

  function update(polygons) {
    geometry.vertices.length = 0;
    polygons.forEach((polygon) => {
      const isClosed = arrayAlmostEqual(
        polygon[0],
        polygon[polygon.length - 1]
      );
      if (!isClosed && closed) {
        polygon = polygon.slice();
        polygon.push(polygon[0]);
      }
      for (let i = 0; i < polygon.length - 1; i++) {
        const a = polygon[i];
        const b = polygon[i + 1];
        geometry.vertices.push(new THREE.Vector3(a[0], 0, a[1]));
        geometry.vertices.push(new THREE.Vector3(b[0], 0, b[1]));
      }
    });
    geometry.verticesNeedUpdate = true;
  }
}

export function filledPoly2D(polygon = [], opt = {}) {
  const { vertices, holes, dimensions } = earcut.flatten([polygon]);
  const tris = earcut(vertices, holes, dimensions);
  const [min, max] = opt.bounds || boundPoints(polygon);
  const geo = new THREE.BufferGeometry();
  geo.setIndex(new THREE.Uint16BufferAttribute(tris, 1));
  geo.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(
      polygon.map((p) => [p[0], 0, p[1]]).flat(Infinity),
      3
    )
  );
  geo.setAttribute(
    "uv",
    new THREE.Float32BufferAttribute(
      polygon
        .map((p) => {
          return [
            inverseLerp(min[0], max[0], p[0]),
            inverseLerp(min[1], max[1], p[1]),
          ];
        })
        .flat(Infinity),
      2
    )
  );

  const matOpt = { ...opt };
  delete matOpt.bounds;
  return new THREE.Mesh(
    geo,
    new THREE.MeshBasicMaterial({
      ...matOpt,
      side: THREE.DoubleSide,
    })
  );
}

export function filledMultiPoly2D(polygon = [], opt = {}) {
  const { closed = true, color = "white" } = opt;
  const geometry = new THREE.Geometry();
  const mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({
      color: color,
      side: THREE.DoubleSide,
      ...opt,
    })
  );
  mesh.updateData = update;
  if (polygon) update(polygon);
  return mesh;

  function update(polygon) {
    geometry.vertices.length = 0;
    polygons.forEach((polygon) => {
      const isClosed = arrayAlmostEqual(
        polygon[0],
        polygon[polygon.length - 1]
      );
      if (!isClosed && closed) {
        polygon = polygon.slice();
        polygon.push(polygon[0]);
      }
      for (let i = 0; i < polygon.length - 1; i++) {
        const a = polygon[i];
        const b = polygon[i + 1];
        geometry.vertices.push(new THREE.Vector3(a[0], 0, a[1]));
        geometry.vertices.push(new THREE.Vector3(b[0], 0, b[1]));
      }
    });
    geometry.verticesNeedUpdate = true;
  }
}

export function multiPoints2D(points = [], opt = {}) {
  const geometry = new THREE.BufferGeometry();
  const mesh = new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      color: "white",
      size: 1,
      sizeAttenuation: true,
      ...opt,
    })
  );
  mesh.updateData = update;
  if (points) update(points);
  return mesh;

  function update(points) {
    setPointsToBufferPosition(
      geometry,
      points.map((p) => new THREE.Vector3(p[0], 0, p[1]))
    );
  }
}

export function circleHelper2D(position, radius, color = "white", steps = 32) {
  if (!circleLineGeo) {
    circleLineGeo = new THREE.Geometry();
    circleLineGeo.vertices = linspace(steps, true).map((t) => {
      const angle = t * Math.PI * 2;
      const r = 1;
      return new THREE.Vector3(Math.cos(angle) * r, 0, Math.sin(angle) * r);
    });
  }
  const mesh = new THREE.Line(
    circleLineGeo,
    new THREE.LineBasicMaterial({
      // depthTest: false,
      // depthWrite: false,
      color,
    })
  );
  mesh.position.x = position[0];
  mesh.position.z = position[1];
  mesh.scale.setScalar(radius);
  return mesh;
}

export function boundsHelper2D(bounds, opt = {}) {
  const verts = GeomUtil.boundsToVerts(bounds);
  const geo = new THREE.Geometry();
  geo.vertices = verts.map((v) => new THREE.Vector3(v[0], 0, v[1]));
  return new THREE.LineLoop(
    geo,
    new THREE.LineBasicMaterial({
      ...opt,
    })
  );
}

export function curveHelper(curve, opt = {}) {
  const { divisions = 50 } = opt;
  const verts = curve.getPoints(divisions);
  const geo = new THREE.Geometry();
  geo.vertices = verts;
  return new THREE.Line(
    geo,
    new THREE.LineBasicMaterial({
      ...opt,
    })
  );
}

export function spheresAlongCurve(curve, opt = {}) {
  let { count, spaced = true, spacing } = opt;
  if (count == null && spacing) {
    count = Math.max(2, Math.round(curve.getLength() / spacing));
  }
  count = Math.max(2, count);
  const matOpt = { ...opt };
  delete matOpt.count;
  delete matOpt.spaced;
  delete matOpt.spacing;
  delete matOpt.scale;
  const verts = spaced
    ? curve.getSpacedPoints(count - 1)
    : curve.getPoints(count - 1);
  if (!sphereGeo) sphereGeo = new THREE.SphereGeometry(1, 32, 32);
  const group = new THREE.Group();
  verts.map((v) => {
    const mesh = new THREE.Mesh(sphereGeo, new THREE.MeshBasicMaterial(matOpt));
    const scl = opt.scale != null ? opt.scale : 0.5;
    mesh.scale.setScalar(scl);
    mesh.position.copy(v);
    group.add(mesh);
  });
  return group;
}

export function pointsToSpheres(points, opt = {}) {
  if (!sphereGeo) sphereGeo = new THREE.SphereGeometry(1, 32, 32);
  const group = new THREE.Group();
  const matOpt = { ...opt };
  delete matOpt.scale;
  points.map((v) => {
    const mesh = new THREE.Mesh(sphereGeo, new THREE.MeshBasicMaterial(matOpt));
    const scl = opt.scale != null ? opt.scale : 0.5;
    mesh.scale.setScalar(scl);
    mesh.position.copy(v);
    group.add(mesh);
  });
  return group;
}

export function animatedWindLineCurve(world, curve, opt = {}) {
  const { divisions = 25 } = opt;
  const verts = curve.getPoints(divisions - 1);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(
      verts.map((p) => p.toArray()).flat(Infinity),
      3
    )
  );
  geo.setAttribute(
    "coord",
    new THREE.Float32BufferAttribute(
      verts
        .map((_, i, list) => {
          const u = list.length <= 1 ? 0.5 : i / (list.length - 1);
          return u;
        })
        .flat(Infinity),
      1
    )
  );
  const line = new THREE.Line(
    geo,
    new THREE.ShaderMaterial({
      name: "helperWindLine",
      transparent: true,
      fragmentShader: /*glsl*/ `
        const float PI = 3.14159265359;
        const float TWO_PI = 6.28318530718;

        float repeat(float t, float length) {
          return t - floor(t / length) * length;
        }

        float deltaAngle(float current, float target) {
          float num = repeat(target - current, TWO_PI);
          if (num > PI) num -= TWO_PI;
          return num;
        }

        float wrapAngle(float angle) {
          float n = repeat(angle, TWO_PI);
          if (n > PI) n -= TWO_PI;
          return n;
        }

        float ToroidalDistance (float x1, float x2)
        {
            float dx = abs(x2 - x1);
            if (dx > 0.5) dx = 1.0 - dx;
            return sqrt(dx*dx);
        }
        
        uniform vec3 color;
        uniform float opacity;
        uniform float time;
        varying float vCoord;
        void main () {
          float alpha = opacity;
          float progress = mod(time, 1.0);
          
          // float smoothness = 0.1;
          // float target = mix(-0.5, 1.5, progress);
          // alpha *= smoothstep(target - smoothness, target + smoothness, vCoord);
          alpha *= pow(sin(vCoord * 10.0 + time * -3.0) * 0.5 + 0.5, 2.0);
          gl_FragColor = vec4(color, alpha);
        }
      `,
      vertexShader: /*glsl*/ `
        attribute float coord;
        varying float vCoord;
        void main () {
          vCoord = coord;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position.xyz, 1.0);
        }
      `,
      uniforms: {
        color: { value: new THREE.Color(opt.color || "white") },
        opacity: { value: 1 },
        time: { value: 0 },
      },
    })
  );
  world.tag(Tags.ShaderUniformTime, { uniform: line.material.uniforms.time });
  return line;
}
