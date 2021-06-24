import * as THREE from "three";
import * as Tags from "../../tags";
import FastPoissonDiskSampling from "fast-2d-poisson-disk-sampling";
import Random from "../../util/Random";
import vertexShader from "../../shaders/ground-patch-instance.vert";
import fragmentShader from "../../shaders/ground-patch-instance.frag";
import boundPoints from "bound-points";
import { inverseLerp } from "../../util/math";
import ObjectPool from "../../util/ObjectPool";
import * as ShaderManager from "../../util/ShaderManager";
import Assets from "../../util/Assets";
import { clamp } from "../../util/math";

export class GrassTileGeometry extends THREE.InstancedBufferGeometry {
  constructor(opts = {}) {
    super();
    const { position, index, uv } = opts;
    this._tmpVec3 = new THREE.Vector3();
    this._featureCount = Infinity;
    this.setAttribute("position", position);
    this.setAttribute("uv", uv);
    this.setIndex(index);
  }

  computeBoundingBox() {
    if (this.boundingBox === null) this.boundingBox = new THREE.Box3();
    this._computeBox3(this.boundingBox);
  }

  _computeBox3(b) {
    const offsets = this.attributes.offset;
    if (offsets != null) {
      b.makeEmpty();
      b.min.y = 0;
      b.max.y = 1;
      for (let i = 0; i < offsets.count; i++) {
        const x = offsets.getX(i);
        const z = offsets.getY(i);
        if (x < b.min.x) b.min.x = x;
        if (x > b.max.x) b.max.x = x;
        if (z < b.min.z) b.min.z = z;
        if (z > b.max.z) b.max.z = z;
      }
    }
  }

  computeBoundingSphere() {
    if (this.boundingSphere === null) this.boundingSphere = new THREE.Sphere();
    const offsets = this.attributes.offset;
    if (!offsets) return;

    this.computeBoundingBox();
    const center = this.boundingSphere.center;
    this.boundingBox.getCenter(center);
    // second, try to find a boundingSphere with a radius smaller than the
    // boundingSphere of the boundingBox: sqrt(3) smaller in the best case
    let maxRadiusSq = 0;

    const v = this._tmpVec3;
    for (let i = 0; i < offsets.count; i++) {
      const x = offsets.getX(i);
      const y = 0;
      const z = offsets.getY(i);
      v.set(x, y, z);
      maxRadiusSq = Math.max(maxRadiusSq, center.distanceToSquared(v));
    }

    this.boundingSphere.radius = Math.sqrt(maxRadiusSq);
  }

  setCount(count) {
    this.instanceCount = Math.min(this._featureCount, count);
  }

  setFeatures(features, prefix) {
    this.instanceCount = features.length;
    this.prefix = prefix;
    this._featureCount = features.length;
    // pos.xy
    // scale.s
    // sprite.x = multiplies uv X by a uniform spriteSize.x
    // negative implies flip texture
    const floatsPerInstance = 2 + 1 + 4 + 1;
    const data = new Float32Array(features.length * floatsPerInstance);
    for (let i = 0, c = 0; i < features.length; i++) {
      const f = features[i];
      // x, y
      data[c++] = f.position[0];
      data[c++] = f.position[1];
      // scale s (scales by uniform spriteScale)
      // also include the flip value here since
      // we only care about absolute scale and > 0
      data[c++] = (f.flip ? -1 : 1) * f.scale;
      // xyzw UV into sprite atlas
      data[c++] = f.spriteCoords[0];
      data[c++] = f.spriteCoords[1];
      data[c++] = f.spriteCoords[2];
      data[c++] = f.spriteCoords[3];
      data[c++] = f.spriteAspect;
    }
    const buffer = new THREE.InstancedInterleavedBuffer(
      data,
      floatsPerInstance
    );
    this.setAttribute(
      "offset",
      new THREE.InterleavedBufferAttribute(buffer, 2, 0)
    );
    this.setAttribute(
      "scale",
      new THREE.InterleavedBufferAttribute(buffer, 1, 2)
    );
    this.setAttribute(
      "spriteCoords",
      new THREE.InterleavedBufferAttribute(buffer, 4, 3)
    );
    this.setAttribute(
      "spriteAspect",
      new THREE.InterleavedBufferAttribute(buffer, 1, 7)
    );
  }
}

export default function createGroundPatchPool(world, opt = {}) {
  const staticBuffers = createStaticBuffers();
  const random = Random();
  const sampleOpts = opt.samples || {};

  const sprites = opt.sprites;
  const groundMap = opt.groundMap;
  const groundProjectionMatrix = opt.groundProjectionMatrix;
  const dataTarget = world.findTag(Tags.GroundDataRenderTarget);

  // const tex = new THREE.Texture();
  // const renderer = world.findTag(Tags.Renderer);
  // let spriteMapAspect;
  // Assets.loadGPUTexture(renderer, tex, "image/data/grass-temp").then((img) => {
  //   spriteMapAspect = img.image.width / img.image.height;
  // });

  const renderLayers = world.findTag(Tags.RenderLayers);

  // How many unique grass patches will be shared across all meshes
  const geometries = [];
  const nGeometries = 3;
  const activeEnv = world.findEntity(Tags.ActiveEnvironmentState);
  const initialPrefix = activeEnv
    ? activeEnv.get(Tags.EnvironmentState).name
    : "";
  for (let i = 0; i < nGeometries; i++) {
    const geometry = new GrassTileGeometry({
      ...staticBuffers,
    });
    const features = getFeatures(sampleOpts, initialPrefix);
    geometry.setFeatures(features, initialPrefix);
    geometries.push(geometry);
  }

  const deck = random.deck(geometries);

  const pool = new ObjectPool({
    name: "GroundPatch",
    initialCapacity: opt.initialCapacity || 0,
    create() {
      const globalSpriteScale = 1;
      const geometry = deck.next();
      const shader = ShaderManager.create({
        name: "GrassGroundPatch",
        transparent: false,
        // depthTest: false,
        // depthWrite: false,
        vertexShader,
        fragmentShader,
        extensions: { derivatives: true },
        uniforms: {
          useSpriteAtlas: { value: true },
          spriteMapAspect: { value: 1 },
          waterMap: { value: new THREE.Texture() },
          map: { value: sprites.atlases[0] },
          worldMapSize: {
            value: new THREE.Vector2(),
          },
          worldDataMap: {
            value: dataTarget ? dataTarget.target.texture : new THREE.Texture(),
          },
          worldDataProjection: {
            value: dataTarget ? dataTarget.projection : new THREE.Matrix4(),
          },
          worldDataView: {
            value: dataTarget ? dataTarget.view : new THREE.Matrix4(),
          },
          globalSpriteScale: { value: globalSpriteScale },
          highlightColor: { value: new THREE.Color("#948059") },
          groundProjectionMatrix: {
            value: groundProjectionMatrix || new THREE.Matrix4(),
          },
          grassTipFactor: { value: 1.5 },
          groundMap: { value: groundMap || new THREE.Texture() },
          time: { value: 0 },
        },
      });

      const mesh = new THREE.Mesh(geometry, shader);
      mesh.name = "ground-patch-pool";
      mesh.userData = {
        globalSpriteScale,
      };
      mesh.layers.set(renderLayers.grass);
      // mesh.renderOrder = 1;
      mesh.userData.active = false;
      mesh.userData.entity = world
        .entity()
        .add(Tags.ShaderUniformTime, {
          uniform: shader.uniforms.time,
        })
        .add(Tags.GroundPatchInstance, mesh);

      return mesh;
    },
    renew(mesh) {
      mesh.userData.active = true;
    },
    release(mesh) {
      mesh.userData.active = false;
    },
    dispose(mesh) {
      if (mesh.userData.entity) {
        mesh.userData.entity.kill();
        mesh.userData.entity = null;
      }
      mesh.userData.active = false;
    },
  });

  // const query = world.query(Tags.GroundPatchInstance);

  return {
    setPrefix(prefix) {
      geometries.forEach((geometry) => {
        if (geometry.prefix !== prefix) {
          const features = getFeatures(sampleOpts, prefix);
          geometry.setFeatures(features, prefix);
        }
      });
    },
    next() {
      return pool.next();
    },
    release(m) {
      return pool.release(m);
    },
  };

  function getFeatures(opt, prefix = "", weights) {
    const { spriteTextureAtlasColumns = 1 } = opt;
    const spriteList = prefix
      ? sprites.values.filter((s) => s.type === prefix)
      : sprites.values;
    return getSamples(opt)
      .map((p) => {
        const sprite = random.pick(spriteList);
        const relHeight = 1;
        const aspect = sprite.width / sprite.height;
        const relWidth = 1 * aspect;
        // console.log(
        //   sprite.name,
        //   sprite.repeat.x / sprite.repeat.y,
        //   sprite.width / sprite.height
        // );
        const scl = 0.66;
        return {
          flip: random.boolean(),
          spriteCoords: sprite.repeat.toArray().concat(sprite.offset.toArray()),
          spriteAspect: sprite.width / sprite.height,
          // scale: relWidth * 0.35 * Math.abs(random.gaussian(1, 1 / 3)),
          scale: clamp(random.gaussian(scl, scl / 2), 0.5, 1.25),
          // scale: Math.min(
          //   2.35,
          //   relWidth * 0.35 * Math.abs(random.gaussian(1, 1 / 3))
          // ),
          // scale: relWidth * 0.35 * Math.abs(random.gaussian(1, 1 / 3)),
          position: p,
        };
      })
      .filter((p) => p.scale >= 1e-5);
  }

  function getSamples({
    size = 40,
    spacing = 1,
    scale = 1,
    tries = 10,
    circular = false,
    maxSamples = 1000,
    filter = true,
  }) {
    return random
      .shuffle(
        new FastPoissonDiskSampling(
          {
            shape: [size, size],
            radius: spacing,
            tries,
          },
          random.value
        )
          .fill()
          .map((p) => {
            return [p[0] - size / 2, p[1] - size / 2];
          })
      )
      .slice(0, maxSamples);
    // return random
    //   .shuffle(
    //     new FastPoissonDiskSampling(
    //       {
    //         shape: [size, size],
    //         radius: spacing,
    //         tries,
    //       },
    //       random.value
    //     )
    //       .fill()
    //       .filter((point) => {
    //         if (!circular) return true;
    //         const r = size / 2;
    //         const rsq = r * r;
    //         const dx = point[0] - size / 2;
    //         const dz = point[1] - size / 2;
    //         const insideOuter = dx * dx + dz * dz <= rsq;
    //         const rIn = random.gaussian(size / 4, size / 4);
    //         const rsqIn = rIn * rIn;
    //         const insideInner = dx * dx + dz * dz <= rsqIn;
    //         return insideOuter && insideInner;
    //       })
    //       // .filter((p) => {
    //       //   if (filter) return random.gaussian() > 0;
    //       //   else return true;
    //       // })
    //       .map((p) => {
    //         p = p.slice();
    //         const [x, y] = random.insideCircle(random.gaussian(0, spacing / 3));
    //         p[0] += x;
    //         p[1] += y;
    //         return [(p[0] - size / 2) * scale, (p[1] - size / 2) * scale];
    //       })
    //   )
    //   .slice(0, maxSamples);
  }
}

function createStaticBuffers() {
  const planeBufferGeometry = new THREE.PlaneBufferGeometry(1, 1, 1, 4);
  const attribs = planeBufferGeometry.attributes;
  const vertCount = attribs.position.count;
  const posArray = [];
  const uvArray = [];
  for (let i = 0; i < vertCount; i++) {
    const x = attribs.position.getX(i);
    const y = attribs.position.getY(i) + 0.5;
    posArray.push(x, y);
    const u = attribs.uv.getX(i);
    const v = attribs.uv.getY(i);
    uvArray.push(u, v);
  }
  const position = new THREE.BufferAttribute(new Float32Array(posArray), 2);
  const uv = new THREE.BufferAttribute(new Float32Array(uvArray), 2);
  const index = new THREE.BufferAttribute(
    planeBufferGeometry.getIndex().array,
    1
  );
  planeBufferGeometry.dispose();
  return {
    position,
    uv,
    index,
  };
}
