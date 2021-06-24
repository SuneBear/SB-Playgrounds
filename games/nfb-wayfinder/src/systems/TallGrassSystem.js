import * as Tags from "../tags";
import * as THREE from "three";
import FastPoissonDiskSampling from "fast-2d-poisson-disk-sampling";
import Random from "../util/Random";
import * as ShaderManager from "../util/ShaderManager";
import Assets from "../util/Assets";

export default async function TallGrassSystem(world) {
  const map = await Assets.createGPUTexture(
    world.findTag(Tags.Renderer),
    "image/data/grass-1"
  );

  const random = Random();
  const baseGeometry = new THREE.BufferGeometry();
  const { position, uv, index } = createStaticBuffers();

  // const positionArr = [];
  // const uvArr = [];
  // const indexArr = [];
  // let indexOffset = 0;
  // const matrix = new THREE.Matrix4();
  // const vec3D = new THREE.Vector3();
  // const vec2D = new THREE.Vector2();
  // for (let i = 0; i < 1; i++) {
  //   const [x, y] = random.insideCircle(1);

  //   matrix.identity();
  //   matrix.makeTranslation(x, 0, y);

  //   for (let i = 0; i < baseData.position.length / 2; i++) {
  //     const tx = baseData.position[i * 2 + 0];
  //     const tz = baseData.position[i * 2 + 1];
  //     vec3D.set(tx, 0, tz);
  //     vec3D.applyMatrix4(matrix);
  //     positionArr.push(vec3D.x, vec3D.y, vec3D.z);
  //   }
  //   for (let i = 0; i < baseData.uv.length; i++) {
  //     const n = baseData.uv[i];
  //     uvArr.push(n);
  //   }
  //   for (let i = 0; i < baseData.index.length; i++) {
  //     const idx = baseData.index[i];
  //     indexArr.push(idx + indexOffset);
  //   }
  //   indexOffset += baseData.position.length;
  // }

  const instancedGeometry = new THREE.InstancedBufferGeometry();
  instancedGeometry.setAttribute("position", position);
  instancedGeometry.setAttribute("uv", uv);
  instancedGeometry.setIndex(index);

  const size = 40;
  const samples = new FastPoissonDiskSampling(
    {
      shape: [size, size],
      radius: 1,
      tries: 10,
    },
    random.value
  )
    .fill()
    .map((s) => {
      // const [tx, ty] = random.insideCircle(size);
      // s[0] += tx;
      // s[1] += ty;
      return [s[0] - size / 2, s[1] - size / 2];
    });

  const offsets = [];
  for (let i = 0; i < samples.length; i++) {
    const s = samples[i];
    const scl = 0.75;
    offsets.push(s[0], s[1], random.gaussian(scl, scl / 2));
  }
  console.log("Instances", samples.length);
  instancedGeometry.instanceCount = samples.length;
  const offsetAttr = new THREE.InstancedBufferAttribute(
    new Float32Array(offsets),
    3
  );
  instancedGeometry.setAttribute("offset", offsetAttr);

  const material = ShaderManager.create({
    uniforms: {
      color: { value: new THREE.Color("#d8ab38") },
      colorGround: { value: new THREE.Color("#B88211") },
      map: { value: map },
      aspect: { value: map.image.width / map.image.height },
    },
    fragmentShader: /*glsl*/ `
      uniform sampler2D map;
      uniform vec3 color;
      uniform vec3 colorGround;
      varying vec2 vUv;
      void main () {
        vec4 cData = texture2D(map, vUv);
        vec4 outColor = vec4(mix(colorGround, color, vUv.y), 1.0);
        // outColor.rgb += 0.1 * (cData.g * 2.0 - 1.0);
        float mask = 1.0 - cData.r;
        gl_FragColor = outColor;
        if (mask < 0.5) discard;
      }
    `,
    vertexShader: /*glsl*/ `
      attribute vec3 offset;
      uniform float aspect;
      varying vec2 vUv;
      void main () {
        vUv = uv;
        float curScale = offset.z;
        vec3 centerWorldPos = (modelMatrix * vec4(vec3(0.0), 1.0)).xyz;
        vec3 camRightWorld = vec3(viewMatrix[0].x, viewMatrix[1].x, viewMatrix[2].x);
        vec3 camUpWorld = vec3(viewMatrix[0].y, viewMatrix[1].y, viewMatrix[2].y);

        vec2 scale;
        scale.x = length( vec3( modelMatrix[ 0 ].x, modelMatrix[ 0 ].y, modelMatrix[ 0 ].z ) );
        scale.y = length( vec3( modelMatrix[ 1 ].x, modelMatrix[ 1 ].y, modelMatrix[ 1 ].z ) );
        scale *= curScale;

        vec2 offsetPos = position.xy;
        vec3 vertexWorldPos = centerWorldPos
          + camRightWorld * offsetPos.x * scale.x * aspect 
          + camUpWorld * offsetPos.y * scale.y;

        vertexWorldPos.xz += offset.xy;

        // gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed.xyz, 1.0);
        gl_Position = projectionMatrix * viewMatrix * vec4(vertexWorldPos, 1.0);
      }
    `,
    side: THREE.DoubleSide,
  });

  for (let i = 0; i < 9; i++) {
    const px = Math.floor(i % 3);
    const pz = Math.floor(i / 3);

    const mesh = new THREE.Mesh(instancedGeometry, material);
    world.entity().add(Tags.Object3D, mesh);
    mesh.frustumCulled = false;
    mesh.position.x = (px - 1.5) * size;
    mesh.position.z = (pz - 1.5) * size;
  }

  // const mesh2 = new THREE.Mesh(
  //   new THREE.SphereGeometry(1, 8, 8),
  //   new THREE.MeshBasicMaterial()
  // );
  // world.entity().add(Tags.Object3D, mesh2);

  return (dt) => {};
}

// function createStaticArrayData() {
//   const planeBufferGeometry = new THREE.PlaneBufferGeometry(1, 1, 1, 3);
//   const attribs = planeBufferGeometry.attributes;
//   const vertCount = attribs.position.count;
//   const posArray = [];
//   const uvArray = [];
//   for (let i = 0; i < vertCount; i++) {
//     const x = attribs.position.getX(i);
//     const y = attribs.position.getY(i) + 0.5;
//     posArray.push(x, y);
//     const u = attribs.uv.getX(i);
//     const v = attribs.uv.getY(i);
//     uvArray.push(u, v);
//   }
//   const indexArray = planeBufferGeometry.getIndex().array;
//   planeBufferGeometry.dispose();
//   return { uv: uvArray, position: posArray, index: indexArray };
//   // const position = new THREE.BufferAttribute(new Float32Array(posArray), 2);
//   // const uv = new THREE.BufferAttribute(new Float32Array(uvArray), 2);
//   // const index = new THREE.BufferAttribute(
//   //   planeBufferGeometry.getIndex().array,
//   //   1
//   // );
//   // planeBufferGeometry.dispose();
//   // return {
//   //   position,
//   //   uv,
//   //   index,
//   // };
// }

function createStaticBuffers() {
  const planeBufferGeometry = new THREE.PlaneBufferGeometry(1, 1, 1, 3);
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
