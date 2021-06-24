import * as Tags from "../../tags";
import * as THREE from "three";
import { polygonCentroid } from "d3-polygon";
import Color from "canvas-sketch-util/color";
import FastPoissonDiskSampling from "fast-2d-poisson-disk-sampling";
import waterFragmentShader from "../../shaders/water.frag";
import Random from "../../util/Random";
import { getMinimumSpanningTree } from "../../util/mst";
import distanceSq from "euclidean-distance/squared";
import { Delaunay } from "d3-delaunay";
import SimplexNoise from "simplex-noise";
import concaveman from "../../util/concaveman";
import * as Helpers from "../../util/helpers";
import simplify from "simplify-path";
import pointInPoly from "point-in-polygon";
// import { ConvexHull } from "three/examples/jsm/math/ConvexHull";
import getPointBounds from "bound-points";
import scaleAndAdd2D from "gl-vec2/scaleAndAdd";
import rotate2D from "gl-vec2/rotate";
import stackblur from "stackblur";
import { point2DInsideBounds, circlesIntersect } from "../../util/geometry";
// import fragmentShader from "../../shaders/ground-simple.frag";
import * as ShaderManager from "../../util/ShaderManager";

import { MetaData } from "../../util/RefGLTFLoader";

import { quadtree as Quadtree } from "d3-quadtree";
import boundPoints from "bound-points";
import earcut from "earcut";

import * as MathUtil from "../../util/math";
import euclideanDistance from "euclidean-distance";
import euclideanDistanceSq from "euclidean-distance/squared";

import { loadTexture } from "../../util/load";
import { EnvironmentGrid } from "./EnvironmentGrid";
import { BiomeFeatures } from "../../util/tokens";

const ignoreCenterSampleRadius = 25;
const ignoreCenterTokenRadius = 45;
const ignoreCenterTokenRadiusSq =
  ignoreCenterTokenRadius * ignoreCenterTokenRadius;

export default function createEnvironmentEntity(
  world,
  {
    biome = "forest",
    biomeData,
    width,
    height,
    bounds,
    renderer,
    uvMat,
    repeatX,
    repeatY,
    mapGround,
    mapOverlay,
    mapGroundPath,
    waterDistortMap,
    waterNoiseMap,
    waterVertexShader,
  }
) {
  // console.profile("gen");

  const tmp2DArray = [0, 0];

  const curBiomeData = biomeData[biome];
  const hasLakes = curBiomeData.hasLakes;
  const hasIce = curBiomeData.hasIce;
  const colors = curBiomeData.colors;
  const waterColors = curBiomeData.waterColors;

  const state = new Uint16Array(curBiomeData.seed); //Random.getRandomState();
  const random = Random(state);
  const noise01 = new SimplexNoise(random.value);
  const noise02 = new SimplexNoise(random.value);
  const featureRadius = 20;
  const rootObject = new THREE.Group();
  rootObject.name = `Environment-${biome}`;

  const g = createGeo(
    colors,
    random,
    featureRadius,
    hasLakes,
    noise01,
    noise02
  );
  convertCellPolysToColorIndex(g);

  if (hasLakes) {
    // g.polys;
  }

  const tokensAwayFromCenter = random.shuffle(
    g.tokens.filter((t) => {
      const lenSq = euclideanDistanceSq(t.position, [0, 0]);
      return random.chance(0.7) && lenSq >= ignoreCenterTokenRadiusSq;
    })
  );

  const maxPatches = Math.round(0.75 * tokensAwayFromCenter.length);
  const patches = [];

  const cellTileSize = 40;
  const colorTileSize = 10;
  const grid = new EnvironmentGrid(
    random,
    colors,
    Math.min(width, height),
    cellTileSize,
    colorTileSize
  );

  const quadtree = Quadtree()
    .x((d) => d.centroid[0])
    .y((d) => d.centroid[1]);
  quadtree.extent(bounds);
  quadtree.addAll(g.cells);
  getGridPixels(quadtree, grid);

  const patchNames = Object.keys(MetaData).filter((key) => {
    return MetaData[key].type === biome && !key.includes("items");
  });
  const patchDeck = random.deck(patchNames);

  for (
    let i = 0;
    i < tokensAwayFromCenter.length && patches.length < maxPatches;
    i++
  ) {
    const t = tokensAwayFromCenter[i];
    if (!intersectsAnyLake(g, t.position, 4)) {
      const pos = t.position.slice();
      const curColor = grid.getColorAt(pos[0], pos[1]);

      const name = patchDeck.current;
      const patchInfo = MetaData[name];

      const circlePoints = MathUtil.linspace(8).map((t) => {
        const angle = Math.PI * 2 * t;
        return [
          Math.cos(angle) * patchInfo.boundingCircle.radius + pos[0],
          Math.sin(angle) * patchInfo.boundingCircle.radius + pos[1],
        ];
      });

      // if (biome === 'grasslands') {

      // }

      // if any of the circle points hit a lake
      if (circlePoints.some((o) => intersectsAnyLake(g, o, 4))) {
        continue;
      }

      // const h = Helpers.circleHelper2D(
      //   patchInfo.boundingCircle.center,
      //   patchInfo.boundingCircle.radius,
      //   "white"
      // );
      // h.position.x += t.position[0];
      // h.position.z += t.position[1];
      // h.position.y = 0.1;
      // world.entity().add(Tags.Object3D, h);

      const patch = {
        name,
        position: pos,
      };
      patches.push(patch);

      const offset = patchInfo.boundingCircle.radius * 0.85;
      // t.position[0] += offset;
      t.position[1] += offset;
      // if (random.chance(0.5)) t.active = false;

      patchDeck.next();
    }
  }

  const activeTokens = tokensAwayFromCenter.filter(
    (t) =>
      t.active !== false &&
      point2DInsideBounds(t.position, bounds) &&
      !intersectsAnyLake(g, t.position, 4)
  );

  // !intersectsAnyLake(geo, p, 4) &&

  let allSamples = createSamples(
    patches,
    g,
    activeTokens,
    random,
    noise01,
    noise02
  );
  let samples = [];
  let waterSamples = [];
  allSamples.forEach((s) => {
    if (intersectsAnyLake(g, s, 1)) {
      // waterSamples.push(s);
    } else {
      if (hasIce && random.chance(0.5)) return;
      samples.push(s);
    }
  });

  if (hasLakes) {
    g.lakeBounds.forEach((bounds, i) => {
      const [min, max] = bounds;
      const w = max[0] - min[0];
      const h = max[1] - min[1];
      const disk = new FastPoissonDiskSampling(
        {
          shape: [w, h],
          tries: 10,
          radius: 10,
        },
        random.value
      );
      const lakeSamplePoints = disk
        .fill()
        .map((p) => {
          return [min[0] + p[0], min[1] + p[1]];
        })
        .filter((p) => {
          const isInLake =
            point2DInsideBounds(p, bounds) && pointInPoly(p, g.lakes[i]);
          if (isInLake) {
            const ptDist = 2.5;
            const ptSq = ptDist * ptDist;
            // only if none hit edge
            if (!g.lakes[i].some((o) => euclideanDistanceSq(o, p) < ptSq)) {
              return true;
            }
          }
          return false;
        });
      lakeSamplePoints.forEach((s) => {
        waterSamples.push(s);
      });
    });
  }

  // for (let i = 0; i < totalPatchesToShow && i < tokensAwayFromCenter.length; i++) {
  //   const token = tokensAwayFromCenter[i];
  //   patchDeck.current()
  // }
  // console.log("total patches", patches.length);
  // console.log("total patches to show", totalPatchesToShow);

  // now let's place some special samples that hold the different
  // "patches" that we want to spawn

  const textures = createChannelTextures(renderer, g, colors, waterColors);

  const [texData, texColor, texLake, texLakeBlur, texLakeHard] = textures;

  const meshes = createWaterMeshes(g, textures);

  getGridSamples(quadtree, grid, samples, waterSamples);

  const features = BiomeFeatures[biome].tokens;
  const tokens = activeTokens
    .filter((p) => {
      const [min, max] = bounds;
      // console.log(p.position, min, max);
      // p.position[0] = -min[0];
      const edist = 15;
      return (
        Math.abs(p.position[0] - min[0]) > edist &&
        Math.abs(p.position[1] - min[1]) > edist &&
        Math.abs(p.position[0] - max[0]) > edist &&
        Math.abs(p.position[1] - max[1]) > edist
      );
    })
    .map((p) => {
      return {
        position: p.position,
        type: random.pick(features),
      };
    });

  // console.log("total tokens", tokens);

  const bestIdlePatches = patches.filter((p) => {
    const d = euclideanDistance(p.position, [0, 0]);
    return d >= 25 && d < (512 / 2) * 0.75;
  });
  const idleViewPatch = random.pick(bestIdlePatches);

  const idleViewPatchInfo = MetaData[idleViewPatch.name];
  const idleViewPoint = new THREE.Vector3(
    idleViewPatch.position[0] - idleViewPatchInfo.boundingCircle.radius * 0.75,
    0,
    idleViewPatch.position[1] - idleViewPatchInfo.boundingCircle.radius * 0.75
  );

  // console.log("patches", bestIdlePatches.length);
  // console.log("idleViewPoint", idleViewPatch, idleViewPoint);

  tokens.forEach((t, i) => {
    const [x, y] = t.position;
    const cell = grid.getCellAt(x, y);
    cell.tokens.push(i);
  });

  patches.push({
    name: "origin-patch-0",
    position: [0, 0],
  });

  patches.forEach((p, i) => {
    const [x, y] = p.position;
    const cell = grid.getCellAt(x, y);
    cell.patches.push(i);
  });
  // console.profileEnd("gen");

  return world.entity().add(Tags.EnvironmentState, {
    ...curBiomeData,
    data: {
      width,
      height,
    },
    waterMeshes: meshes,
    name: biome,
    haikusTotal: curBiomeData.haikusTotal,
    patches,
    tokens,
    group: rootObject,
    lakes: g.lakes.map((poly, i) => {
      return {
        bounds: g.lakeBounds[i],
        polygon: poly,
      };
    }),
    idleViewPoint,
    colors,
    textures,
    waterMap: texLakeHard,
    grid,
    samples,
    waterSamples,
  });

  function getGridSamples(quadtree, grid, samples, waterSamples) {
    samples.forEach((s, i) => {
      const cell = grid.getCellAt(s[0], s[1]);
      if (cell) cell.samples.push(i);
    });
    waterSamples.forEach((s, i) => {
      const cell = grid.getCellAt(s[0], s[1]);
      if (cell) cell.waterSamples.push(i);
    });
    for (let y = 0; y < grid.cellDivisions; y++) {
      for (let x = 0; x < grid.cellDivisions; x++) {
        const u = x / (grid.cellDivisions - 1);
        const v = y / (grid.cellDivisions - 1);
        const wx = MathUtil.lerp(-width / 2, width / 2, u);
        const wz = MathUtil.lerp(-height / 2, height / 2, v);
        const cell = quadtree.find(wx, wz);
        const c = grid.cells[x + y * grid.cellDivisions];
        c.elevation = cell.elevation;
        c.moisture = cell.moisture;
        c.path = cell.distance;
        c.colorIndex = cell.colorIndex;
      }
    }
  }

  function getGridPixels(quadtree, grid) {
    for (let y = 0; y < grid.colorDivisions; y++) {
      for (let x = 0; x < grid.colorDivisions; x++) {
        const u = x / (grid.colorDivisions - 1);
        const v = y / (grid.colorDivisions - 1);
        const wx = MathUtil.lerp(-width / 2, width / 2, u);
        const wz = MathUtil.lerp(-height / 2, height / 2, v);
        const cell = quadtree.find(wx, wz);
        grid.colorIndices[x + y * grid.colorDivisions] = cell.colorIndex;
      }
    }
  }

  function createWaterMeshes(geo, textures) {
    const dataTarget = world.findTag(Tags.GroundDataRenderTarget);
    const groundView = world.findTag(Tags.GroundPlaneView);

    return g.lakes.map((poly, i) => {
      const [min, max] = g.lakeBounds[i];
      const w = max[0] - min[0];
      const h = max[1] - min[1];
      const lakeSize = Math.sqrt(w * w + h * h) / 2;
      const centroid = polygonCentroid(poly);
      const verts = poly.flat(Infinity);
      const cells = earcut(verts, [], 2);
      const geom = new THREE.BufferGeometry();
      const uvs = [];
      const verts3D = [];
      const angles = [];
      const surfUVs = [];
      poly.forEach((p, i, list) => {
        angles.push((i / (list.length - 1)) * Math.PI * 2);
        verts3D.push(p[0], 0, p[1]);
        const u = MathUtil.inverseLerp(-width / 2, width / 2, p[0]);
        const v = MathUtil.inverseLerp(height / 2, -height / 2, p[1]);
        uvs.push(u, v);

        const su = MathUtil.inverseLerp(min[0], max[0], p[0]);
        const sv = MathUtil.inverseLerp(min[1], max[1], p[1]);
        surfUVs.push(su, sv);
      });
      geom.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(verts3D, 3)
      );
      geom.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
      geom.setAttribute("surfUv", new THREE.Float32BufferAttribute(surfUVs, 2));
      geom.setAttribute("angle", new THREE.Float32BufferAttribute(angles, 1));
      geom.setIndex(new THREE.Uint16BufferAttribute(cells, 1));

      const material = ShaderManager.create({
        name: "WaterShader",
        uniforms: {
          uvScale: { value: new THREE.Vector2(repeatX, repeatY) },
          time: { value: 0 },
          centroidPosition: {
            value: new THREE.Vector3(centroid[0], 0, centroid[1]),
          },
          uvTransform: {
            value: uvMat,
          },

          environmentSize: {
            value: new THREE.Vector2(width, height),
          },
          worldDataMap: {
            value: dataTarget ? dataTarget.target.texture : getEmptyTexture(),
          },
          worldDataProjection: {
            value: dataTarget ? dataTarget.projection : new THREE.Matrix4(),
          },
          worldDataView: {
            value: dataTarget ? dataTarget.view : new THREE.Matrix4(),
          },

          waterDistortMap: { value: waterDistortMap },
          waterNoiseMap: { value: waterNoiseMap },
          lakeSize: { value: lakeSize },
          colorA: { value: new THREE.Color(hasIce ? "#698193" : "#163d84") },
          colorB: { value: new THREE.Color(hasIce ? "#a8bec4" : "#49c2ff") },
          groundMap: { value: groundView.target.texture },
          dataMapBiome: { value: textures[0] },
          dataMapColor: { value: textures[1] },
          dataMapLake: { value: textures[2] },
          dataMapLakeBlur: { value: textures[3] },
          uvRepeatScale: { value: 1 },
        },
        side: THREE.BackSide,
        vertexShader: waterVertexShader,
        transparent: true,
        defines: {
          WATER: !hasIce,
          HAS_GROUND_MAP: true,
          HAS_DATA_MAP: true,
          HAS_ANGLE: true,
          HAS_SURF_UV: true,
        },
        fragmentShader: waterFragmentShader,
      });
      const mesh = new THREE.Mesh(geom, material);
      mesh.userData.colorA = material.uniforms.colorA.value.clone();
      mesh.userData.colorB = material.uniforms.colorB.value.clone();
      rootObject.add(mesh);
      world.entity().add(Tags.ShaderUniformTime, {
        uniform: material.uniforms.time,
      });
      mesh.layers.set(world.findTag(Tags.RenderLayers).water);
      mesh.renderOrder = -1;
      mesh.position.y = 0.05;
      return mesh;
    });
  }

  function createSamples(patches, geo, activeTokens, random, noise01, noise02) {
    const sampleRadius = 1.5;
    const sampleDisk = new FastPoissonDiskSampling(
      {
        shape: [width, height],
        tries: 10,
        radius: sampleRadius * 2,
      },
      random.value
    );
    // const points = sampleDisk.fill();
    const tmpNormal = [0, 0];
    const tmpPerp = [0, 0];
    const tmpPoint = [0, 0];
    const tmpSample = [0, 0];
    const tmpRotNorm = [0, 0];
    const tmpOffset2D = [0, 0];
    geo.segments.forEach(([a, b]) => {
      getSegmentNormal(tmpNormal, a, b);
      getPerpendicular(tmpPerp, tmpNormal);

      const len = euclideanDistance(a, b);

      const { elevation, moisture } = createTerrain(
        width,
        height,
        noise01,
        noise02,
        (a[0] + b[0]) / 2,
        (a[1] + b[1]) / 2
      );

      const spacing = MathUtil.lerp(0.25, 20, elevation);
      const count = Math.max(2, Math.ceil(len / spacing));
      for (let i = 0; i < count; i++) {
        // if (random.gaussian(0, 1) > 0) continue;
        let t = i / (count - 1);
        t = MathUtil.lerp(0.0, 1, t);

        const steps = random.rangeFloor(1, 6);
        for (let k = 0; k < steps; k++) {
          const p = MathUtil.lerpArray(a, b, t, tmpPoint);
          p[0] += width / 2;
          p[1] += height / 2;

          const radius = Math.abs(random.gaussian(1, 1));
          scaleAndAdd2D(p, p, random.insideCircle(radius, tmpOffset2D), 1);

          // const dist = random.gaussian(20, 10);
          const dist = random.range(15, 20) + Math.abs(random.gaussian(0, 5));
          for (let j = 0; j < 2; j++) {
            // if (random.gaussian(0, 1) > 0) continue;
            const x = j === 0 ? -1 : 1;
            const angleOff = 45;
            rotate2D(
              tmpRotNorm,
              tmpPerp,
              MathUtil.degToRad(random.range(-angleOff, angleOff))
            );
            scaleAndAdd2D(tmpSample, p, tmpRotNorm, dist * x);

            if (!sampleDisk.inNeighbourhood(tmpSample)) {
              scaleAndAdd2D(
                tmpSample,
                tmpSample,
                random.insideCircle(
                  random.range(0.0 * sampleRadius, 1 * sampleRadius),
                  tmpOffset2D
                ),
                1
              );
              sampleDisk.addPoint(tmpSample);
            }
          }
        }
      }
    });
    const centerRadius = ignoreCenterSampleRadius;
    const centerSq = centerRadius * centerRadius;

    const samples = sampleDisk.samplePoints.map((p) => {
      return [-width / 2 + p[0], -height / 2 + p[1]];
    });
    return samples.filter((p) => {
      const tokenRadius = 4;
      const tokenRadiusSq = tokenRadius * tokenRadius;
      return (
        !activeTokens.some(
          (t) => euclideanDistanceSq(t.position, p) < tokenRadiusSq
        ) &&
        !patches.some((patch) => {
          const patchInfo =
            patch.name in MetaData ? MetaData[patch.name] : false;
          if (patchInfo) {
            const radius = patchInfo.boundingCircle.radius;
            return circlesIntersect(p, 1, patch.position, radius);
          } else {
            return false;
          }
        }) &&
        euclideanDistanceSq(p, [0, 0]) > centerSq
      );
    });
  }

  function intersectsAnyLake(geo, p, radius = 2) {
    for (let i = 0; i < geo.lakeBounds.length; i++) {
      if (intersectsLakeIndex(geo, p, i, radius)) {
        return true;
      }
    }
    return false;
  }

  function intersectsLakeIndex(geo, p, i, radius = 2) {
    const ptSq = radius * radius;
    const b = geo.lakeBounds[i];
    if (point2DInsideBounds(p, b)) {
      if (pointInPoly(p, geo.lakes[i])) {
        return true;
      }
    }
    if (geo.lakes[i].some((o) => euclideanDistanceSq(o, p) < ptSq)) {
      return true;
    }
    return false;
  }

  function drawCanvas(canvas, context, textureSize, drawFn) {
    context.fillStyle = "black";
    context.clearRect(0, 0, textureSize, textureSize);
    context.fillRect(0, 0, textureSize, textureSize);

    const [min, max] = bounds;
    const fw = max[0] - min[0];
    const fh = max[1] - min[1];
    const sx = canvas.width / fw;
    const sy = canvas.height / fh;
    const zoom = 1.0;

    context.save();
    context.scale(sx, sy);
    context.translate(width / 2, height / 2);
    context.scale(zoom, zoom);
    drawFn({ context, canvas });
    context.restore();
    return { context, canvas };
  }

  function createChannelTextures(renderer, geo, groundColors, waterColors) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    return [0, 1, 2, 3, 4].map((c, i) => {
      let textureSize = c >= 2 ? 256 : 512;
      if (c === 4) textureSize = 128;
      canvas.width = textureSize;
      canvas.height = textureSize;
      drawCanvas(canvas, context, textureSize, ({ canvas, context }) =>
        drawChannelTexture({
          c,
          i,
          canvas,
          context,
          geo,
          groundColors,
          waterColors,
        })
      );

      let iters = 2;
      let radius = 4;
      if (c === 2) {
        iters = 1;
        radius = 2;
      } else if (c === 3) {
        iters = 2;
        radius = 8;
      } else if (c === 4) {
        iters = 0;
        radius = 0;
      }
      if (iters > 0) {
        blur(context, textureSize, textureSize, iters, radius);
      }
      const tex = new THREE.Texture(canvas);
      tex.needsUpdate = true;
      renderer.initTexture(tex);
      tex.image = null;
      return tex;
    });
  }

  function drawChannelTexture({
    c,
    i,
    canvas,
    context,
    geo,
    groundColors,
    waterColors,
  }) {
    const baseColor = new THREE.Color();
    // const offPathColorObj = new THREE.Color(offPathColor);

    if (c === 0 || c === 1) {
      geo.cells.forEach((p) => {
        let color;
        if (c === 0) {
          const r0 = random.range(-1, 1) * 0.2;
          const r1 = random.range(-1, 1) * 0.2;
          const r2 = random.range(-1, 1) * 0.2;
          baseColor.setRGB(
            MathUtil.clamp01(p.moisture + r0),
            MathUtil.clamp01(p.elevation + r1),
            MathUtil.clamp01(p.distance + r2)
          );
          // baseColor.setHSL(0, 0, p.moisture);
          // baseColor.offsetHSL(0, 0, (p.elevation * 2 - 1) * 0.1);
          // baseColor.offsetHSL(0, 0, (p.moisture * 2 - 1) * 0.1);
          // baseColor.offsetHSL(0, 0, (p.distance * 2 - 1) * 0.1);

          color = baseColor.getStyle();
          // const g = p.colorIndex / 4;
          // color = `hsl(0, 0%, ${(g * 100).toFixed(2)}%)`;
          // baseColor.set(groundColors[p.colorIndex].color);
          // baseColor.lerp(offPathColorObj, 1 - p.distance);
          // baseColor.offsetHSL(0, 0, (p.distance * 2 - 1) * 0.1);
          // // baseColor.offsetHSL(0, 0, (p.elevation * 2 - 1) * 0.05);
          // // baseColor.offsetHSL(0, 0, (p.moisture * 2 - 1) * 0.1);
          // color = baseColor.getStyle();
        } else {
          color = p.color.getStyle();
        }

        context.fillStyle = context.strokeStyle = color;

        context.beginPath();
        p.polygon.forEach((pt) => context.lineTo(...pt));
        context.lineJoin = "round";
        context.lineWidth = 1;
        context.fill();
        context.stroke();
      });

      // if (c === 1) {
      //   geo.lakes.forEach((p) => {
      //     context.fillStyle = random.pick(waterColors).color;
      //     context.beginPath();
      //     p.forEach((pt) => context.lineTo(...pt));
      //     context.fill();
      //   });
      // }
    } else {
      geo.lakes.forEach((p, i) => {
        context.fillStyle = "white";
        context.strokeStyle = c === 4 ? "white" : "black";
        context.beginPath();
        p.forEach((pt) => context.lineTo(...pt));
        context.lineJoin = "round";
        context.closePath();
        context.lineWidth = c === 4 ? 0.5 : 2;
        context.fill();
        context.stroke();
      });
    }
  }

  function blur(context, width, height, iters = 1, radius = 8) {
    const imgData = context.getImageData(0, 0, width, height);
    for (let i = 0; i < iters; i++) {
      stackblur(imgData.data, width, height, radius);
    }
    context.putImageData(imgData, 0, 0);
  }

  function convertCellPolysToColorIndex(g) {
    g.cells.forEach((p) => {
      const { distance, moisture, elevation, lakeDistance } = p;
      const m = moisture;
      const e = elevation;

      let colorIndex = 0;
      if (hasLakes) {
        const lakeWetland = 10;
        if (
          p.lengthFromCenter > lakeWetland &&
          (intersectsAnyLake(g, p.centroid, lakeWetland) ||
            p.polygon.some((pt) =>
              intersectsAnyLake(g, p.centroid, lakeWetland)
            ))
        ) {
          // water
          colorIndex = 3;
        } else {
          // non-water
          if (m < 0.5 && e >= 0.5) {
            // dry, high
            colorIndex = 0;
          } else if (m < 0.5 && e < 0.5) {
            // dry, low
            colorIndex = 1;
          } else {
            // wet, low/high
            colorIndex = 2;
          }
        }
      } else {
        if (m < 0.5 && e >= 0.5) {
          // dry, high
          colorIndex = 0;
        } else if (m < 0.5 && e < 0.5) {
          // dry, low
          colorIndex = 1;
        } else if (m >= 0.5 && e >= 0.5) {
          // wet, high
          colorIndex = 2;
        } else {
          // wet, low
          colorIndex = 3;
        }
      }
      p.colorIndex = colorIndex;

      const pt = 0.5;
      const pf = 0.5;
      const color = new THREE.Color();
      color.set(colors[p.colorIndex % colors.length].color);

      color.offsetHSL(0, 0, (p.elevation * 2 - 1) * 0.05);
      color.offsetHSL(0, 0, (p.moisture * 2 - 1) * 0.1);
      color.offsetHSL(
        random.range(-1, 1) * 0.01,
        random.range(-1, 1) * 0.01,
        (MathUtil.smoothstep(pt - pf, pt + pf, p.distance) * 2 - 1) * 0.1
      );
      p.color = color;
    });
  }

  function createGeo(
    colors,
    random,
    featureRadius,
    hasLakes,
    noise01,
    noise02
  ) {
    const tokenZones = random.shuffle(
      getRandomFeatures(width, height, featureRadius, random)
    );
    let tokens = tokenZones.map((feature) => {
      const position = feature.slice();
      const offset = random.insideCircle(featureRadius * 0.5, tmp2DArray);
      position[0] += offset[0];
      position[1] += offset[1];
      return {
        center: feature,
        radius: featureRadius,
        position,
      };
    });

    const lakeSpacing = featureRadius * 4;
    const lakeGap = lakeSpacing;
    const maxLakes = 8;
    let lakes = [];
    if (hasLakes) {
      lakes = getRandomFeatures(width, height, lakeSpacing, random);
      lakes = random
        .shuffle(
          lakes.filter((t) => {
            return euclideanDistance(t, [0, 0]) > featureRadius * 4;
          })
        )
        .slice(0, maxLakes);
    }

    tokens = tokens.filter((t) => {
      const d = euclideanDistance(t.position, [0, 0]);
      for (let i = 0; i < lakes.length; i++) {
        const dlake = euclideanDistance(t.position, lakes[i]);
        if (dlake < lakeGap / 2) return false;
      }
      const absX = Math.abs(t.position[0]);
      const absY = Math.abs(t.position[1]);
      const margin = 0.95;
      // if (d > width / 2) return random.chance(0.5);
      // if (d > width / 4) return random.chance(0.9);
      return absX < (width / 2) * margin && absY < (height / 2) * margin;
    });

    const connections = getMinimumSpanningTree(
      tokens.map((t) => t.position),
      (a, b) => distanceSq(a, b)
    ).map((c) => c.indices);

    const segments = connections.map((c) => {
      const connection = c.map((i) => tokens[i]);
      return connection.map((t) => t.position);
    });

    const flatBounds = bounds.flat();

    // const bds = Helpers.boundsHelper2D(
    //   [
    //     [flatBounds[0], flatBounds[1]],
    //     [flatBounds[2], flatBounds[3]],
    //   ],
    //   { color: "yellow" }
    // );
    // world.entity().add(Tags.Object3D, bds);

    const dpoints = segments
      .map((segment) => {
        const count = random.rangeFloor(5, 5);
        const points = [];
        for (let i = 0; i < count; i++) {
          const t = i / count;
          const p = MathUtil.lerpArray(segment[0], segment[1], t);
          random.insideCircle(featureRadius / 8, tmp2DArray);
          p[0] += tmp2DArray[0];
          p[1] += tmp2DArray[1];
          points.push(p);
        }
        return points;
      })
      .flat();

    const delaunayPoints = generateRandomPointsFast(width, height, 1, random);
    const delaunay = Delaunay.from(delaunayPoints);
    const relaxations = 2;
    for (let i = 0; i < relaxations; i++) {
      relax(flatBounds, delaunay, 0.5);
    }
    const voronoi = delaunay.voronoi(flatBounds);
    const cells = Array.from(voronoi.cellPolygons()).map((polygon, i) => {
      const index = polygon.index;
      if (index !== i) console.error("ERR! poly index doesn't match");
      polygon = Array.from(polygon).slice(0, polygon.length - 1);
      return polygon;
    });

    // const polys = Helpers.multiPoly2D(cells);
    // world.entity().add(Tags.Object3D, polys);

    // const tokenPositions = tokens.map((t) => t.position);
    const centroids = cells.map((c) => polygonCentroid(c));
    const distances = centroids.map((c) => {
      return metaballDistance(c[0], c[1], dpoints, featureRadius);
    });
    const lakeDistances = centroids.map((c) => {
      return metaballDistance(c[0], c[1], lakes, lakeGap / 4, 1, 1.5);
    });

    const polys = cells.map((c, i) => {
      const centroid = centroids[i];
      const { elevation, moisture } = createTerrain(
        width,
        height,
        noise01,
        noise02,
        centroid[0],
        centroid[1]
      );

      const d = distances[i];
      const lakeDistance = lakeDistances[i];
      return {
        polygon: c,
        connections,
        segments,
        distance: d,
        lakeDistance,
        moisture,
        elevation,
      };
    });

    normalizeAttr(polys, "moisture");
    normalizeAttr(polys, "elevation");
    normalizeAttr(polys, "lakeDistance");
    normalizeAttr(polys, "distance");

    const lakePolys = new Set();
    polys.forEach((p, i) => {
      const { distance, moisture, elevation, lakeDistance } = p;
      const m = moisture;
      const e = elevation;
      const length = euclideanDistance([0, 0], centroids[i]);

      p.centroid = centroids[i];
      p.lengthFromCenter = length;

      if (
        hasLakes &&
        length > 40 &&
        distance < 0.25 &&
        ((m > 0.5 && e < 0.5) || lakeDistance > 0.5)
      ) {
        lakePolys.add(i);
      }
      // const objects = Helpers.filledPoly2D(p.polygon, { color });
      // world.entity().add(Tags.Object3D, objects);
    });

    const lakeSets = convertLakeIndicesToSets(voronoi, lakePolys);
    const lakeHulls = lakeSets
      .filter((set) => {
        return set.length > 2;
      })
      .map((set) => convertSetToHull(polys, set));

    const lakeContours = lakeHulls
      .map((hull) => {
        const p = simplify(hull, 1);
        if (p.length) p.pop(); // remove closing point
        return p;
      })
      .filter((c) => {
        return c.length > 4;
      })
      .map((c) => {
        const points3D = c.map((p) => new THREE.Vector3(p[0], 0, p[1]));
        return new THREE.CatmullRomCurve3(points3D, true, "chordal", 0.5)
          .getSpacedPoints(c.length * 8)
          .map((t) => [t.x, t.z]);
      });

    return {
      lakes: lakeContours,
      lakeBounds: lakeContours.map((c) => boundPoints(c)),
      tokens: tokens,
      segments,
      cells: polys,
    };
  }

  function getPerpendicular(out = [], a) {
    out[0] = -a[1];
    out[1] = a[0];
    return out;
  }

  function getSegmentNormal(out = [], a, b) {
    let dx = b[0] - a[0];
    let dy = b[1] - a[1];
    const mlen2 = dx * dx + dy * dy;
    if (mlen2 !== 0) {
      // normalize vector to unit length
      const len = Math.sqrt(mlen2);
      dx /= len;
      dy /= len;
    }
    out[0] = dx;
    out[1] = dy;
    return out;
  }

  function convertLakeIndicesToSets(voronoi, indices) {
    const touchedPolys = new Set();
    const lakeSets = new Set();
    indices.forEach((i) => {
      if (!touchedPolys.has(i)) {
        const allTouching = findAllLakeNeighbors(
          voronoi,
          indices,
          i,
          touchedPolys
        );
        // const lakeCandidates = [];
        allTouching.forEach((j) => {
          // mark all these as touched
          touchedPolys.add(j);
        });
        lakeSets.add([...allTouching]);
      }
    });

    return [...lakeSets];
  }

  function convertSetToHull(polys, set) {
    const verts = [];
    set.forEach((i) => {
      const [min, max] = getPointBounds(polys[i].polygon);
      const w = max[0] - min[0];
      const h = max[1] - min[1];
      const r = Math.min(w, h) * 0.5;
      const angleOff = random.range(-1, 1) * Math.PI * 2;
      const newPoints = MathUtil.linspace(8).map((t) => {
        const angle = t * 2 * Math.PI + angleOff;
        const x = min[0] + w / 2 + Math.cos(angle) * r;
        const y = min[1] + h / 2 + Math.sin(angle) * r;
        verts.push([x, y]);
      });
      // polys[i].polygon.forEach((v) => {
      //   verts.push(v);
      // });
    });
    // const points = verts.map((v) => new THREE.Vector3(v[0], 0, v[1]));
    // const hull = new ConvexHull().setFromPoints(points);
    // console.log(hull.faces);
    // const hull = fastConvexHull(verts);
    // console.log(hull);
    return concaveman(verts);
  }

  function findAllLakeNeighbors(voronoi, lakePolys, i, excluding) {
    const set = new Set();
    const polysToTest = [i];
    while (polysToTest.length > 0) {
      // add this node to the set
      const t = polysToTest.shift();
      set.add(t);
      // now find its neighbors
      for (let j of voronoi.neighbors(t)) {
        // if the neighbor is a lake and we haven't seen it yet
        if (lakePolys.has(j) && !set.has(j) && !excluding.has(j)) {
          // add it to our set
          set.add(j);
          // also we have to now walk its neighbors to see if any more match
          polysToTest.push(j);
        }
      }
    }
    return set;
  }

  function normalizeAttr(cells, attr) {
    const max = cells.reduce(
      (max, cell) => Math.max(max, cell[attr]),
      -Infinity
    );
    const min = cells.reduce(
      (min, cell) => Math.min(min, cell[attr]),
      Infinity
    );
    if (max !== min) {
      cells.forEach((c) => {
        c[attr] = MathUtil.mapRange(c[attr], min, max, 0, 1, true);
      });
    }
  }

  function metaballDistance(
    x,
    y,
    centroids,
    radius,
    minScale = 1,
    maxScale = 1.5,
    power = 0.5
  ) {
    let sum = 0;
    for (let i = 0; i < centroids.length; i++) {
      const c = centroids[i];
      // if (c[0] === x && c[1] === y) continue;
      const dx = x - c[0];
      const dy = y - c[1];
      const d2 = dx * dx + dy * dy;
      // if (d2 === 0) continue;
      let dst = d2 === 0 ? 0 : Math.sqrt(d2);
      // if (dst > featureRadius * 2) continue;
      // if (dst > featureRadius) continue;
      // if (dst < featureRadius / 2) dst = featureRadius;
      // if (dst < featureRadius / 4) dst = featureRadius / 4;
      // sum += featureRadius / dst;
      const minDist = radius * minScale;
      const maxDist = radius * maxScale;
      const alpha = MathUtil.clamp01(
        MathUtil.inverseLerp(minDist, maxDist, dst)
      );
      sum += 1 - Math.pow(alpha, power);
    }
    return sum;
  }

  function relax(flatBounds, delaunay, relaxationParameter = 0.5) {
    const voronoi = delaunay.voronoi(flatBounds);
    for (let i = 0; i < delaunay.points.length; i += 2) {
      const cell = voronoi.cellPolygon(i >> 1);
      if (cell === null) continue;
      const x0 = delaunay.points[i];
      const y0 = delaunay.points[i + 1];
      const [x1, y1] = polygonCentroid(cell);
      delaunay.points[i] = x0 + (x1 - x0) * relaxationParameter;
      delaunay.points[i + 1] = y0 + (y1 - y0);
    }
    delaunay.update();
  }

  function getRandomFeatures(width, height, radius, random) {
    const disk = new FastPoissonDiskSampling(
      {
        shape: [width, height],
        tries: 10,
        radius: radius * 2,
      },
      random.value
    );
    disk.addPoint([width / 2, height / 2]);
    return disk.fill().map((p) => {
      return [-width / 2 + p[0], -height / 2 + p[1]];
    });
  }

  function generateRandomPointsFast(width, height, spacing, random) {
    const aspect = width / height;
    const countWidth = Math.max(1, Math.ceil(width / spacing));
    const countHeight = Math.max(1, Math.ceil(height / spacing));
    const factor = 5;
    const N = Math.round(Math.max(countWidth, countHeight) * factor);
    return MathUtil.linspace(N).map(() => {
      return [
        random.range(-width / 2, width / 2),
        random.range(-height / 2, height / 2),
      ];
    });
  }
}

function createTerrain(width, height, noise01, noise02, x, y) {
  const params = { f1: 2, t1: 4, k1: 0.5, f2: 2, t2: 4, k2: 0.25 };
  const { t1, f1, k1, t2, f2, k2 } = params;
  const aspect = width / height;
  let u = MathUtil.inverseLerp(-width / 2, width / 2, x);
  let v = MathUtil.inverseLerp(-height / 2, height / 2, y);
  u *= aspect;
  const elevation = MathUtil.lerp(
    Math.pow(layeredNoise3D(noise01, u, v, 0, t1), 1.2),
    noise01.noise2D(u * f1, v * f1) * 0.5 + 0.5,
    k1
  );

  const moisture = MathUtil.lerp(
    Math.pow(layeredNoise3D(noise02, u, v, 0, t2), 1),
    noise02.noise2D(u * f2, v * f2) * 0.5 + 0.5,
    k2
  );
  return { elevation, moisture };
}

function layeredNoise3D(simplex, px, py, z = 0, uvFreq = 0.1) {
  // This uses many layers of noise to create a more organic pattern
  const nx = px * uvFreq;
  const ny = py * uvFreq;
  let e =
    1.0 * (simplex.noise3D(1 * nx, 1 * ny, z) * 0.5 + 0.5) +
    0.5 * (simplex.noise3D(2 * nx, 2 * ny, z) * 0.5 + 0.5) +
    0.25 * (simplex.noise3D(4 * nx, 4 * ny, z) * 0.5 + 0.5) +
    0.13 * (simplex.noise3D(8 * nx, 8 * ny, z) * 0.5 + 0.5) +
    0.06 * (simplex.noise3D(16 * nx, 16 * ny, z) * 0.5 + 0.5) +
    0.03 * (simplex.noise3D(32 * nx, 32 * ny, z) * 0.5 + 0.5);
  e /= 1.0 + 0.5 + 0.25 + 0.13 + 0.06 + 0.03;
  return e;
}
