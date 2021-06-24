import * as THREE from "three";
import * as Tags from "../tags";
import * as MathUtil from "../util/math";
import { loadTexture } from "../util/load";
import { cloneMaterial, detachObject } from "../util/three-util";
import { spliceOne } from "../util/array";
import easeAppear from "eases/sine-out";
import easeDisappear from "eases/sine-in";
import Random from "../util/Random";
import ObjectPool from "../util/ObjectPool";
import * as ShaderManager from "../util/ShaderManager";
import Assets from "../util/Assets";
import { addPreRenderCallback } from "../util/addFrameTasks";
import { tweenTo } from "./AnimationSystem";

const SOFT_ID = "image/data/soft-circle";

export default function EnvironmentGroundDataTextureSystem(world) {
  const renderer = world.findTag(Tags.Renderer);
  const [softMap] = Assets.createGPUTextureTask(renderer, SOFT_ID);

  const random = Random();

  const RTSIZE = 256;
  const renderTarget = new THREE.WebGLRenderTarget(RTSIZE, RTSIZE);

  renderTarget.texture.generateMipmaps = false;
  renderTarget.depthBuffer = false;
  renderTarget.texture.minFilter = THREE.LinearFilter;
  renderTarget.texture.magFilter = THREE.LinearFilter;
  renderTarget.texture.wrapS = renderTarget.texture.wrapT =
    THREE.ClampToEdgeWrapping;

  world
    .entity()
    .add(Tags.DebugRenderTarget, { visible: false, target: renderTarget });

  const projection = new THREE.Matrix4();
  const view = new THREE.Matrix4();
  world.entity().add(Tags.GroundDataRenderTarget, {
    target: renderTarget,
    projection,
    view,
  });

  const orthoCam = new THREE.OrthographicCamera(-1, 1, -1, 1, -100, 100);
  const orthoScene = new THREE.Scene();

  // const group = new THREE.Group();
  // world.entity().add(Tags.Object3D, group);

  const gh = 4;
  const gr = 0.1;
  const geo = new THREE.CylinderGeometry(gr, gr, gh, 8);
  geo.translate(0, gh / 2, 0);

  const clearColor = new THREE.Vector3(0, 0, 0);
  const tmpColor = new THREE.Vector3(0, 0, 0);

  const activeParticles = [];
  const tmpVec2Arr = [0, 0];
  let lastPosition = new THREE.Vector3();
  let hasLastPosition = false;

  const fastShaderMaterial = ShaderManager.create({
    name: "Shader-Data-Texture",
    uniforms: {
      color: { value: new THREE.Color() },
      map: { value: softMap },
      opacity: { value: 0.0 },
    },
    transparent: true,
    depthWrite: false,
    depthTest: false,
    side: THREE.DoubleSide,
    vertexShader: /*glsl*/ `
    #include <common>
    varying vec2 vUv;

    void main () {
      vUv = uv;

      vec3 centerWorldPos = (modelMatrix * vec4(vec3(0.0), 1.0)).xyz;
      vec3 camRightWorld = vec3(viewMatrix[0].x, viewMatrix[1].x, viewMatrix[2].x);
      vec3 camUpWorld = vec3(viewMatrix[0].y, viewMatrix[1].y, viewMatrix[2].y);

      vec2 scale;
      scale.x = length( vec3( modelMatrix[ 0 ].x, modelMatrix[ 0 ].y, modelMatrix[ 0 ].z ) );
      scale.y = length( vec3( modelMatrix[ 1 ].x, modelMatrix[ 1 ].y, modelMatrix[ 1 ].z ) );

      vec3 offsetPos = position.xyz;
      vec3 vertexWorldPos = centerWorldPos
        + camRightWorld * offsetPos.x * scale.x
        + camUpWorld * offsetPos.y * scale.y;

      gl_Position = projectionMatrix * viewMatrix * vec4(vertexWorldPos, 1.0);
    }`,
    fragmentShader: /*glsl*/ `
    uniform sampler2D map;
    uniform float opacity;
    uniform vec3 color;
    varying vec2 vUv;
    void main () {
      gl_FragColor = texture2D(map, vUv) * vec4(color, opacity);
    }
    `,
  });

  const particlePool = new ObjectPool({
    name: "ParticlePool",
    initialCapacity: 100,
    create() {
      const material = fastShaderMaterial;
      const mesh = new THREE.Sprite(
        material
        // new THREE.SpriteMaterial({
        //   map: softMap,
        //   transparent: true,
        //   depthWrite: false,
        //   depthTest: false,
        //   opacity: 0.0,
        //   side: THREE.DoubleSide,
        // })
      );
      cloneMaterial(mesh);
      ShaderManager.push(mesh.material);

      mesh.userData = {
        time: 0,
        directionX: 0,
        directionY: 0,
        velocity: new THREE.Vector3(),
        // angle: Math.atan2(userChar.direction.z, userChar.direction.x),
        userSpeed: 0,
        strength: 1,
        delay: random.range(0, 0.1),
        duration: random.range(0, 2),
        durationIn: random.range(1.25, 1.5),
        durationOut: 1,
        minSize: 2,
        size: random.range(5, 7.5),
        // position: position.clone(),
        alpha: 0,
        opacity: 1,
        active: false,
      };
      return mesh;
    },
  });

  let time = 0;
  let globalAlpha = { value: 1, tweening: false };
  const biomeResolution = world.listen(Tags.FinalBiomeResolution);
  // const swapEvents = world.listen(Tags.SafeToSwapBiomes);

  // Note; we exit out of ECS linear system style here
  // This is a big error prone but hopefully improves per frame perf
  addPreRenderCallback(submitRender);

  return function envGroundDataTexSystem(dt) {
    time += dt;
    const canvas = renderer.domElement;
    const width = canvas.width;
    const height = canvas.height;
    if (canvas.width === 0 || canvas.height === 0) return;

    if (biomeResolution.added.length > 0) {
      tweenTo(world, globalAlpha, "value", 0, 1, "sineOut");
    }
    // if (swapEvents.added.length > 0) {
    //   tweenTo(world, globalAlpha, "value", 1, 1, "sineOut");
    // }

    // const camera = world.findTag(Tags.MainCamera);
    // camera.updateMatrixWorld();

    const userChar = world.findTag(Tags.UserCharacter);
    const userTarget = world.findTag(Tags.UserTarget);
    const position = userChar.position;
    const target = userTarget.position;
    const distThreshold = 0.5;
    const distThresholdSq = distThreshold * distThreshold;

    if (
      !hasLastPosition ||
      lastPosition.distanceToSquared(position) >= distThresholdSq
    ) {
      const mesh = particlePool.next();

      const d = mesh.userData;
      d.active = true;
      d.time = 0;
      d.alpha = 0;
      d.directionX = userChar.direction.x;
      d.directionY = userChar.direction.z;
      d.velocity.copy(userChar.velocity);
      d.userSpeed = userTarget.totalSpeedAlpha;

      const r = random.insideCircle(0.5, tmpVec2Arr);
      mesh.position.set(position.x, position.z, 0);
      mesh.position.x += r[0];
      mesh.position.y += r[1];
      mesh.position.x += userChar.direction.x * 1;
      mesh.position.z += userChar.direction.z * 1;
      orthoScene.add(mesh);
      activeParticles.push(mesh);

      lastPosition.copy(position);
      hasLastPosition = true;
    }

    activeParticles.forEach((mesh) => {
      const p = mesh.userData;
      p.time += dt;
      const maxVel = 0.15;
      const vx = MathUtil.mapRange(p.velocity.x, -maxVel, maxVel, 0, 1, true);
      const vz = MathUtil.mapRange(p.velocity.z, -maxVel, maxVel, 0, 1, true);
      const velx = MathUtil.clamp(p.velocity.x, -maxVel, maxVel);
      const velz = MathUtil.clamp(p.velocity.z, -maxVel, maxVel);
      mesh.position.x += velx * 0.2;
      mesh.position.z += velz * 0.2;

      const curTime = Math.max(0, p.time - p.delay);
      const totalDur = p.duration + p.durationIn + p.durationOut;
      if (curTime < p.durationIn) {
        p.alpha = easeAppear(MathUtil.clamp01(curTime / p.durationIn));
      } else if (curTime >= p.durationIn + p.duration) {
        const start = Math.max(0, curTime - (p.durationIn + p.duration));
        p.alpha = 1 - easeDisappear(MathUtil.clamp01(start / p.durationOut));
      } else {
        p.alpha = 1;
      }

      if (curTime >= totalDur) {
        p.active = false;
      }
      //
      const kt = 1;
      // const angleT = MathUtil.mapRange(p.angle, -Math.PI, Math.PI, 0, 1, true);
      // const angle = (angleT * 2 - 1) * Math.PI;
      mesh.material.uniforms.color.value.setRGB(
        1,
        p.directionX * 0.5 + 0.5,
        p.directionY * 0.5 + 0.5
      );
      // mesh.material.color.setRGB(1, vx, vz);
      mesh.material.uniforms.opacity.value =
        p.alpha * p.opacity * kt * globalAlpha.value;
      mesh.scale.setScalar(
        MathUtil.lerp(p.minSize, p.size, Math.pow(p.alpha, 1))
      );
    });
    for (let i = activeParticles.length - 1; i >= 0; i--) {
      if (!activeParticles[i].userData.active) {
        const mesh = activeParticles[i];
        particlePool.release(mesh);
        detachObject(mesh);
        spliceOne(activeParticles, i);
      }
    }

    const windowView = 40;
    orthoCam.left = -windowView / 2;
    orthoCam.right = windowView / 2;
    orthoCam.top = windowView / 2;
    orthoCam.bottom = -windowView / 2;
    orthoCam.position.set(target.x, target.z, 0);
    orthoCam.zoom = 1;
    orthoCam.updateProjectionMatrix();
    orthoCam.updateMatrixWorld();

    projection
      .copy(orthoCam.projectionMatrix)
      .multiply(orthoCam.matrixWorldInverse);
    view.identity();
    // view.copy(orthoCam.matrixWorldInverse);
    // orthoCam.zoom = Math.sin()

    // Note: we could render here but we save it for SubmitFrameSystem
    // we do this by adding a 'pre render' callback - not ideal with ECS
    // but will do for perf.
    // submitRender();
  };

  function submitRender() {
    tmpColor.copy(renderer.getClearColor());
    renderer.setRenderTarget(renderTarget);
    renderer.setClearColor(clearColor);
    renderer.clear();
    renderer.render(orthoScene, orthoCam);
    renderer.setRenderTarget(null);
    renderer.setClearColor(tmpColor);
  }

  function quickCopy(cameraSrc, cameraDst) {
    THREE.Camera.prototype.copy.call(cameraDst, cameraSrc);
    cameraDst.fov = cameraSrc.fov;
    cameraDst.zoom = cameraSrc.zoom;
    cameraDst.near = cameraSrc.near;
    cameraDst.far = cameraSrc.far;
    cameraDst.focus = cameraSrc.focus;
    cameraDst.aspect = cameraSrc.aspect;
    cameraDst.filmGauge = cameraSrc.filmGauge;
    cameraDst.filmOffset = cameraSrc.filmOffset;
  }
}
