import SimplexNoise from "simplex-noise";
import anime from "animejs";
import * as Tags from "../tags";
import * as THREE from "three";
import resetPlayerPos from "../util/resetPlayerPos";
import { setEntityTweenFromTo, tweenFromTo } from "./AnimationSystem";
import Line3D from "./writing/Line3D";
import { localize } from "../util/locale";
import Assets from "../util/Assets";
import queryString from "../util/query-string";

import coinTexUrl from "../assets/textures/coins.jpg";
import coinModelURL from "../assets/gltf/coin.gltf";

import { GLTFLoader } from "../util/GLTFLoader";
import { TextureLoader } from "three";

import * as ShaderManager from "../util/ShaderManager";
import Random from "../util/Random";
import { clamp, mapRange } from "canvas-sketch-util/math";

const NOOP = () => {};
const texLoader = new TextureLoader();
const geom = new THREE.PlaneBufferGeometry(2, 2);

const random = Random();
const noise = new SimplexNoise(random.value);

const coinMaterial = ShaderManager.create({
  name: "coinShader",
  uniforms: {
    uTime: { value: 0 },
    tMap: { value: new THREE.Texture() },
    uOffset: { value: new THREE.Vector2() },
    uGlowIntensity: { value: 1 },
  },
  vertexShader: /*glsl*/ `
    attribute vec2 aOffset;
    attribute float aGlowDelay;

    uniform float uTime;
    
    varying vec2 vUv;
    varying vec2 vOffset;
    varying float vGlowDelay;
    
    void main() {
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      
      vUv = uv;
      vOffset = aOffset;
      vGlowDelay = aGlowDelay;
    }
  `,
  fragmentShader: /*glsl*/ `
    uniform sampler2D tMap;
    uniform float uGlowIntensity;
    varying float vGlowDelay;

    varying vec2 vUv;
    varying vec2 vOffset;

    void main() {

      vec2 uv = vec2(vUv.x, 1. - vUv.y);
      uv *= .5;

      uv += vOffset;
      float glow = uGlowIntensity - vGlowDelay;
      glow = clamp(glow, 1., 3.);
      vec3 color = texture2D(tMap, uv).rgb * glow;

      gl_FragColor = vec4(color, 1.);
    }
  `,
});

const fsQuadMaterial = ShaderManager.create({
  name: "coinShader",
  uniforms: {
    uOpacity: { value: 0 },
  },
  transparent: true,
  depthTest: false,
  depthWrite: false,
  vertexShader: /*glsl*/ `
    void main() {
      gl_Position = vec4( position, 1.0 );
    }
  `,
  fragmentShader: /*glsl*/ `
    uniform float uOpacity;
    void main() {
      gl_FragColor = vec4(1., 1.0, 1.0, uOpacity);
    }
  `,
});

function loadTexture(url) {
  return new Promise((resolve, reject) => {
    texLoader.load(
      url,
      // ok
      (texture) => {
        resolve(texture);
      },
      // progress
      NOOP,
      // ko
      (evt) => {
        reject(evt);
      }
    );
  });
}

const anim = {
  yOffset: 0,
  magicalEffect: 0,
  capeSpeed: 0.2,
  glowIntensity: 1,
  glowIntensity2: 1,
  coinScl: 0.001,
  coinGlow: 1,
  shakeSpeed: 0.5,
  flash: 0,
  coinSpinSpeed: 1,
  coinAngularSpeed: 0.1,
  camDistance: 15,
  camShake: 0,
  camShakeSpeed: 1,
};

export default function OutroSystem(world) {
  let isLoaded = false;

  let time = 0;
  let outroElapsed = 0;
  let outroStarted = false;

  let hasPlayedSound = false;
  let hasStartedSecondPart = false;

  const container = new THREE.Group();
  container.name = "coins";
  world.entity().add(Tags.Object3D, container);

  let coinGeom = null;

  const user = world.findTag(Tags.UserCharacter);
  const userZoom = world.findTag(Tags.UserZoom);
  const userFollow = world.findTag(Tags.UserFollow);
  const animateOutEvents = world.listen(Tags.FinalBiomeResolution);

  let treePos = new THREE.Vector3();

  // load
  const manager = new THREE.LoadingManager();
  const gltfLoader = new GLTFLoader(manager);
  const coins = [];
  let fsquad = null;
  gltfLoader.load(coinModelURL, function (_gltf) {
    coinGeom = _gltf.scene.children[0].geometry;
    makeCoins();
    makeFSQuad();
    isLoaded = true;
  });

  return (dt) => {
    if (!isLoaded) return;

    time += dt;

    if (outroStarted) {
      outroElapsed += dt;
    }

    const user = world.findTag(Tags.UserCharacter);

    coins.forEach((coin, idx) => {
      coin.rotateX(0.015 * anim.coinSpinSpeed);
      coin.rotateY(0.015 * anim.coinSpinSpeed);
      coin.rotateZ(0.015 * anim.coinSpinSpeed);

      let scl = anim.coinScl - coin.scaleDelay;
      scl = clamp(scl, 0.001, 0.5);
      coin.scale.setScalar(scl);

      coin.time += dt * 2;

      const yoffsetAmpl = mapRange(anim.coinAngularSpeed, 1, 20, 0.7, 0.1);
      coin.position.y = 3 + idx * 1.5 + Math.cos(coin.time) * yoffsetAmpl;

      coin.angularPos += dt * coin.angularSpeed * anim.coinAngularSpeed;
      coin.position.x =
        treePos.x +
        Math.cos(coin.angularPos) *
          (coin.radius - mapRange(anim.coinAngularSpeed, 1, 20, 0, 1));
      coin.position.z =
        treePos.z -
        0.5 +
        Math.sin(coin.angularPos) *
          (coin.radius - mapRange(anim.coinAngularSpeed, 1, 20, 0, 1));

      // shake
      // const ampl = .2
      // coin.position.x += noise.noise3D(coin.time * anim.shakeSpeed, coin.position.y, coin.position.z) * ampl;
      // coin.position.y += noise.noise3D(coin.position.x, coin.time * anim.shakeSpeed, coin.position.z) * ampl;
      // coin.position.z += noise.noise3D(coin.position.x, coin.position.y, coin.time * anim.shakeSpeed) * ampl;

      coin.material.uniforms.uGlowIntensity.value = anim.coinGlow;
    });

    fsquad.material.uniforms.uOpacity.value = anim.flash;

    fsquad.material.uniforms.uOpacity.value = anim.flash;

    // flash sound at 9.7sec
    if (outroElapsed > 9.7 && !hasPlayedSound) {
      hasPlayedSound = true;
      world.entity().add(Tags.FlashSound, "flash-build-up");
    }

    // notify second part of outro
    if (outroElapsed > 12.4 && !hasStartedSecondPart) {
      hasStartedSecondPart = true;
      world.entity().add(Tags.FinalBiomeResolutionLines);
    }

    animateOutEvents.added.forEach((e) => {
      outroStarted = true;

      const originTrees = world.view([
        Tags.SpriteAnimation,
        Tags.SpriteAnimationOriginTreeTag,
      ]);
      treePos = originTrees[0].get(Tags.Object3D).position;

      // load texture
      loadTexture(coinTexUrl).then((texture) => {
        coins.forEach((coin, idx) => {
          coin.material.uniforms.tMap.value = texture;
        });
      });

      start();
    });
  };

  function start() {
    // animate capespeed and magicaleffect
    anime({
      targets: anim,
      magicalEffect: 10,
      capeSpeed: 2,
      duration: 1000,
      delay: 0,
      easing: "easeInQuart",
      update: function () {
        user.magicalEffect = anim.magicalEffect;
        user.capeSpeed = anim.capeSpeed;
      },
    });

    // glow
    anime({
      targets: anim,
      glowIntensity: 20,
      duration: 6000,
      delay: 0,
      easing: "easeInOutSine",
      update: function () {
        user.glowIntensity = anim.glowIntensity;
      },
    });

    // elevates
    anime({
      targets: anim,
      yOffset: 3,
      duration: 5000,
      delay: 3000,
      easing: "easeInOutSine",
      update: function () {
        user.yOffset = anim.yOffset;
      },
    });

    // coins scale
    anime({
      targets: anim,
      coinScl: 1.5,
      duration: 1300,
      delay: 7000,
      easing: "easeOutSine",
    });

    // coins glow
    anime({
      targets: anim,
      coinGlow: 80,
      duration: 6000,
      delay: 9500,
      easing: "easeInSine",
      complete: () => {},
    });

    // coin spin speed
    anime({
      targets: anim,
      coinSpinSpeed: 10,
      duration: 4500,
      delay: 8000,
      easing: "easeInSine",
    });

    // coin angular speed
    anime({
      targets: anim,
      coinAngularSpeed: 20,
      duration: 4000,
      delay: 9000,
      easing: "easeInQuart",
    });

    // cape glow 2
    anime({
      targets: anim,
      glowIntensity2: 2,
      duration: 2000,
      delay: 12000,
      easing: "easeInSine",
      update: function () {
        user.glowIntensity2 = anim.glowIntensity2;
      },
      complete: () => {
        anim.glowIntensity2 = 1;
        user.glowIntensity2 = anim.glowIntensity2;
        userFollow.shake = 0;
        userFollow.shakeSpeed = 1;
      },
    });

    //  // shake speed
    //  anime({
    //   targets: anim, 'shakeSpeed': 1,
    //   duration: 5000, delay: 9000,
    //   easing: 'easeInSine',

    // })

    // flash in
    anime({
      targets: anim,
      flash: 1,
      duration: 500,
      delay: 12800,
      easing: "easeOutSine",
      update: () => {
        user.glowIntensity -= anim.flash * 1.5;
        user.magicalEffect -= anim.flash * 0.5;
      },
      complete: () => {
        // flash out
        hideCharacterAndCoins();

        camDistanceAnim.pause();
        shakeAnim.pause();
        shakeSpeedAnim.pause();

        anim.capeSpeed = 0.2;
        anim.glowIntensity2 = 1;
        user.glowIntensity2 = anim.glowIntensity2;
        userFollow.shake = 0;
        userFollow.shakeSpeed = 0;
        userZoom.distance = 15;

        anime({
          targets: anim,
          flash: 0,
          duration: 3000,
          delay: 1500,
          easing: "easeOutSine",
        });
      },
    });

    // cam distance
    const camDistanceAnim = anime({
      targets: anim,
      camDistance: 12,
      duration: 9000,
      delay: 5000,
      easing: "easeInOutSine",
      update: function () {
        userZoom.distance = anim.camDistance;
      },
    });

    // cam shake
    const shakeAnim = anime({
      targets: anim,
      camShake: 2,
      duration: 3000,
      delay: 12000,
      easing: "easeInOutSine",
      update: function () {
        userFollow.shake = anim.camShake;
        userFollow.shakeSpeed = anim.camShakeSpeed;
      },
    });

    // cam shake speed
    const shakeSpeedAnim = anime({
      targets: anim,
      camShakeSpeed: 5,
      duration: 2000,
      delay: 11000,
      easing: "easeInOutSine",
      update: function () {
        userFollow.shakeSpeed = anim.camShakeSpeed;
      },
    });
  }

  function hideCharacterAndCoins() {
    coins.forEach((coin) => {
      coin.visible = false;
    });
  }

  function makeFSQuad() {
    fsquad = new THREE.Mesh(geom, fsQuadMaterial);
    fsquad.frustumCulled = false;
    fsquad.renderOrder = 1e10;
    container.add(fsquad);
  }

  function makeCoins() {
    const anglBetween = (Math.PI * 2) / 3;
    let angle = 0;
    const radius = 2;
    for (let i = 0; i < 3; i++) {
      const ox = i % 2;
      const oy = 1 - Math.floor(i / 2);

      const geom = coinGeom.clone();
      const offsets = new Float32Array(geom.attributes.position.count * 2);
      const glowDelays = new Float32Array(geom.attributes.position.count);

      for (let j = 0; j < offsets.length; j += 2) {
        offsets[j] = ox * 0.5;
        offsets[j + 1] = oy * 0.5;
      }

      for (let k = 0; k < glowDelays.length; k++) {
        glowDelays[k] = i * 2;
      }

      geom.setAttribute("aOffset", new THREE.BufferAttribute(offsets, 2));
      geom.setAttribute("aGlowDelay", new THREE.BufferAttribute(glowDelays, 1));

      const coin = new THREE.Mesh(geom, coinMaterial);
      coin.scale.setScalar(0.5);

      angle += anglBetween;

      coin.position.x = Math.cos(angle) * radius;

      coin.position.z = Math.sin(angle) * radius;
      container.add(coin);

      coin.rotateX(Math.PI * 2 * random.range(0, 1));
      coin.rotateY(Math.PI * 2 * random.range(0, 1));
      coin.rotateZ(Math.PI * 2 * random.range(0, 1));

      // very bad, assigning props on the fly
      coin.time = random.range(0, 3);
      coin.scaleDelay = i * 0.5;
      coin.angularPos = angle;
      coin.angularSpeed = 1; //random.range(1, 1.5)
      coin.radius = random.range(5, 6);
      coins.push(coin);
    }
  }
}
