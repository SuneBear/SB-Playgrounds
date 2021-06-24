import * as Tags from "../tags";
import * as THREE from "three";
import * as MathUtil from "../util/math";
import * as eases from "eases";
import { localize } from "../util/locale";
import { setEntityTweenFromTo, tweenTo } from "./AnimationSystem";
import {
  createSpriteMaterial,
  getEmptyTexture,
  createTokenMaterial,
  getSpriteGeometry,
  setSpriteToken,
} from "../util/materials";
import Assets from "../util/Assets";
import * as ShaderManager from "../util/ShaderManager";

export default function CompassSystem(world) {
  const container = new THREE.Group();
  container.name = "compass";
  world.entity().add(Tags.Object3D, container);

  const renderer = world.findTag(Tags.Renderer);
  const bloom = 0.5;

  const white = new THREE.Color(1, 1, 1);
  const shadowAlpha = 0.1;
  const shadowColorOpaque = new THREE.Color("#280422").lerp(
    white,
    1 - shadowAlpha
  );
  const shadowColorTransparent = white;

  const radius = 1.25;
  const thick = 0.025;
  const ringGeo = new THREE.TorusGeometry(radius, thick, 6, 24);
  ringGeo.rotateX(-Math.PI / 2);
  ringGeo.translate(0, thick / 2, 0);

  const [compassRingMap] = Assets.createGPUTextureTask(
    renderer,
    "image/data/compass-ring"
  );

  const planeGeo = new THREE.PlaneBufferGeometry(1, 1, 1, 1);
  planeGeo.rotateX(-Math.PI / 2);

  const ringShader = ShaderManager.create({
    name: "CompassRingShader",
    vertexShader: /*glsl*/ `
      varying vec2 vUv;
      void main () {
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position.xyz, 1.0);
        vUv = uv;
      }
    `,
    fragmentShader: /*glsl*/ `
      varying vec2 vUv;
      uniform sampler2D map;
      uniform vec3 color;
      uniform float opacity;

      void main () {
        vec4 tColor = texture2D(map, vUv);
        if (tColor.a <= 0.5) discard;
        gl_FragColor = vec4(color * tColor.rgb, tColor.a * opacity);
        // gl_FragColor = vec3(vec3(0.5), tColor.a);
      }
    `,
    uniforms: {
      color: { value: new THREE.Color(1 + bloom, 1 + bloom, 1 + bloom) },
      opacity: { value: 1 },
      map: { value: compassRingMap },
    },
    transparent: true,
  });

  // const ringMat = new THREE.MeshBasicMaterial({
  //   transparent: true,
  //   color: new THREE.Color(1 + bloom, 1 + bloom, 1 + bloom),
  //   map: compassRingMap,
  // });
  const ringMat = ringShader;
  const ringMesh = new THREE.Mesh(planeGeo, ringMat);
  const ringSpriteScale = radius * 2.25;
  container.add(ringMesh);

  const shadowMat = ringShader.clone();
  shadowMat.uniforms.color.value = shadowColorOpaque.clone();
  shadowMat.uniforms.map.value = compassRingMap;
  shadowMat.blending = THREE.MultiplyBlending;
  shadowMat.needsUpdate = true;
  const shadowMesh = new THREE.Mesh(
    planeGeo,
    shadowMat
    // new THREE.MeshBasicMaterial({
    //   transparent: true,
    //   alphaTest: 0.5,
    //   blending: THREE.MultiplyBlending,
    //   color: shadowColorOpaque.clone(),
    //   map: compassRingMap,
    // })
  );
  const layers = world.findTag(Tags.RenderLayers);
  container.add(shadowMesh);
  shadowMesh.layers.set(layers.shadow);
  // ringMesh.rotation.x = MathUtil.degToRad(-5);

  const arrowMat = new THREE.MeshBasicMaterial({
    transparent: true,
    // depthTest: false,
    // depthWrite: false,
    color: new THREE.Color(1 + bloom, 1 + bloom, 1 + bloom),
  });

  const dotContainer = new THREE.Group();
  const geoPointScale = 0.1;
  container.add(dotContainer);
  const dots = new Array(3).fill(null).map(() => {
    const mesh = new THREE.Mesh(getSpriteGeometry(), createTokenMaterial());
    mesh.renderOrder = 10;
    mesh.name = "dot";
    // const mesh = new THREE.Mesh(
    //   dotSphere,
    //   new THREE.MeshBasicMaterial({
    //     color: "white",
    //     transparent: true,
    //   })
    // );
    mesh.userData.currentAngle = null;
    mesh.userData.currentSize = 0;
    mesh.userData.lastToken = null;
    mesh.userData.lastTokenType = null;
    dotContainer.add(mesh);
    return mesh;
  });

  const arrows = new Array(4).fill().map((_, i) => {
    const arrowMesh = new THREE.Mesh(planeGeo, arrowMat);
    container.add(arrowMesh);
    arrowMesh.renderOrder = 1;
    arrowMesh.scale.setScalar(i <= 2 ? 0.5 : 1);
    arrowMesh.userData.currentAngle = null;
    arrowMesh.visible = false;
    return arrowMesh;
  });

  let arrowReady = false,
    hasInitArrow = false;
  const loadArrow = () => {
    hasInitArrow = true;
    Assets.createGPUTexture(renderer, `image/data/compass-arrow3`).then(
      (map) => {
        arrowReady = true;
        arrowMat.map = map;
        arrowMat.needsUpdate = true;
        arrows.forEach((arrowMesh) => {});
      }
    );
  };

  const tokenView = world.view([Tags.GroundAsset, Tags.GroundAssetToken]);
  const envCells = world.view(Tags.EnvironmentCell);
  const tokensDiscovered = world.findTag(Tags.TokensDiscoveredSet);

  const envState = world.view([
    Tags.EnvironmentState,
    Tags.ActiveEnvironmentState,
  ]);

  const tokenStates = dots.map(() => ({
    distanceSq: Infinity,
    token: null,
    consumed: false,
  }));

  const compass = world.entity();
  const opacityTween = { value: 0 };
  const target = world.findTag(Tags.UserTarget);
  const char = world.findTag(Tags.UserCharacter);
  const activeLineView = world.view([
    Tags.WrittenStanzaLine,
    Tags.WrittenStanzaLineActive,
  ]);

  let wasShowCompass = false;
  const centerDistThreshold = 12.5;
  const centerDistThresholdSq = centerDistThreshold * centerDistThreshold;

  const distThreshold = 10;
  const distThresholdSq = distThreshold * distThreshold;
  const showCompassView = world.view(Tags.CompassVisible);
  const compassCurrentPosition = new THREE.Vector3();
  const messages = world.view(Tags.TutorialMessage);
  const showCompassEvents = world.listen(Tags.CompassVisible);

  return (dt) => {
    if (!envState.length) return;
    const activeEnv = envState[0];

    let triggerCompassRecompute = false;

    if (target && target.forceApplied) {
      showCompassView.forEach((e) => {
        const vis = e.get(Tags.CompassVisible);
        // e.tagOff(Tags.CameraZoomOut);
        if (
          vis.position.distanceToSquared(target.position) >= distThresholdSq
        ) {
          e.tagOff(Tags.CompassVisible);
        }
      });
    }

    if (showCompassView.length > 0) {
      const e = showCompassView[0];
      if (e.has(Tags.CompassVisible)) {
        triggerCompassRecompute = true;
        compassCurrentPosition.copy(e.get(Tags.CompassVisible).position);
      }
    }

    const introSeq = world.findTag(Tags.OriginTreeIntroSequence);
    const charVis = !world.findTag(Tags.HideCharacter);
    const directToOrigin = Boolean(world.findTag(Tags.DirectUserToOrigin));
    const tutorialState = world.findTag(Tags.TutorialState);
    const haikuCardShown = world.findTag(Tags.HaikuCardShown);
    const resolving = world.findTag(Tags.ShowBiomeResolution);

    const distFromCenterSq = char.position.lengthSq();
    const hintMode = showCompassView.length > 0;
    const showCompass =
      charVis &&
      ((directToOrigin && !resolving) ||
        (hintMode &&
          activeLineView.length === 0 &&
          !haikuCardShown &&
          !tutorialState &&
          !introSeq &&
          !resolving)); //!newMoving;

    container.visible = opacityTween.value >= 1e-5;

    if (showCompassEvents.changed && !directToOrigin) {
      messages.forEach((e) => {
        const msg = e.get(Tags.TutorialMessage);
        e.kill();
      });
      if (showCompassEvents.added.length) {
        const e = world.entity().add(Tags.TutorialMessage);
        const msg = e.get(Tags.TutorialMessage);
        msg.id = "comapss";
        // if (directToOrigin) {
        //   msg.message = localize.get().tutorialResolve;
        //   msg.iconMode = "tree";
        // } else {
        // msg.message = "Collect tokens to recover nature’s lost memories";
        msg.message = localize.get().tutorialCollect;
        msg.iconMode = "token-random";
        // }
        msg.delay = 0;
        // tokens: true,
        //     delay: 3,
        msg.duration = 6;
      }
    }

    if (wasShowCompass !== showCompass) {
      // if (showCompass) triggerCompassRecompute = showCompass;
      compass.tagOff(Tags.TargetKeyTween);
      setEntityTweenFromTo(
        compass,
        opacityTween,
        "value",
        opacityTween.value,
        showCompass ? 1 : 0,
        showCompass ? 2 : 0.5,
        showCompass ? "sineOut" : "sineOut",
        0
      );
      const tween = compass.get(Tags.TargetKeyTween);
      tween.killEntityOnFinish = false;
      tween.assignFromOnStart = true;
      wasShowCompass = showCompass;
    }

    // for (let i = 0; i < 4; i++) {
    //   arrows[i].visible = false;
    // }

    // container.position.copy(char.position);
    const distSq = container.position.distanceToSquared(char.position);
    if (distSq >= distThresholdSq) {
      container.position.copy(char.position);
    } else {
      MathUtil.dampVector(
        container.position,
        char.position,
        10,
        dt,
        container.position
      );
    }

    shadowMesh.material.uniforms.color.value
      .copy(shadowColorTransparent)
      .lerp(shadowColorOpaque, opacityTween.value);
    ringMesh.material.uniforms.opacity.value = opacityTween.value;
    const rScl =
      ringSpriteScale *
      MathUtil.lerp(1.15, 1, eases.sineInOut(opacityTween.value));
    ringMesh.scale.x = rScl;
    ringMesh.scale.z = rScl;
    arrowMat.opacity = opacityTween.value;

    dots.forEach(
      (d) => (d.material.uniforms.opacity.value = opacityTween.value)
    );
    ringMesh.position.y = 0.3;
    shadowMesh.position.y = 0.01;
    shadowMesh.scale.copy(ringMesh.scale);

    ringMesh.rotation.y += dt * 0.5;
    shadowMesh.rotation.y = ringMesh.rotation.y;

    const charX = char.position.x;
    const charZ = char.position.z;
    const tokens = activeEnv.get(Tags.EnvironmentState).tokens;

    const isDirectingToOrigin = Boolean(world.findTag(Tags.DirectUserToOrigin));
    const ignoreTokens = Boolean(world.findTag(Tags.BlockTokenCollection));
    const canCollect = !introSeq && !isDirectingToOrigin && !ignoreTokens;

    if (triggerCompassRecompute) {
      for (let i = 0; i < tokenStates.length; i++) {
        tokenStates[i].distanceSq = Infinity;
        tokenStates[i].token = null;
        tokenStates[i].consumed = false;
      }

      // const best = [];
      triggerCompassRecompute = false;
      for (let i = 0; i < tokens.length; i++) {
        const t = tokens[i];

        const canCollectType = !tokensDiscovered.has(t.type);
        const shouldShow = canCollect && canCollectType;
        if (!shouldShow) continue;

        const x = t.position[0];
        const z = t.position[1];
        const dx = x - compassCurrentPosition.x;
        const dz = z - compassCurrentPosition.z;
        const dSq = dx * dx + dz * dz;
        // best.push([dSq, t]);
        if (dSq <= tokenStates[0].distanceSq) {
          tokenStates[0].distanceSq = dSq;
          tokenStates[0].token = t;
        } else if (dSq <= tokenStates[1].distanceSq) {
          tokenStates[1].distanceSq = dSq;
          tokenStates[1].token = t;
        } else if (dSq <= tokenStates[2].distanceSq) {
          tokenStates[2].distanceSq = dSq;
          tokenStates[2].token = t;
        }
      }
      // best.sort((a, b) => a[0] - b[0]);
      // for (let i = 0; i < 3 && i < best.length; i++) {
      //   const b = best[i];
      //   tokenStates[i].distanceSq = b[0];
      //   tokenStates[i].token = b[1];
      // }
    }

    // console.log(tokenStates.filter((f) => f.token).length);
    //

    // if (directToOrigin) {

    //   if (!hasInitArrow) {
    //     loadArrow();
    //   }

    //   arrowMesh.material.opacity = opacityTween.value;

    //   if (arrowMesh.userData.currentAngle == null) {
    //     arrowMesh.userData.currentAngle = newAngle;
    //   }
    // }

    const arrowMesh = arrows[arrows.length - 1];

    let newArrowAngle = arrowMesh.userData.currentAngle;
    if (directToOrigin) {
      const dx = 0 - charX;
      const dz = 0 - charZ;
      newArrowAngle = Math.atan2(dz, dx);
      if (!hasInitArrow) {
        loadArrow();
      }
      arrowMesh.material.opacity = opacityTween.value;
    }

    arrowMesh.visible = arrowReady && directToOrigin;
    ringMesh.visible = opacityTween.value >= 1e-5; //!arrowMesh.visible;
    shadowMesh.visible = ringMesh.visible;

    if (newArrowAngle != null) {
      if (arrowMesh.userData.currentAngle == null) {
        arrowMesh.userData.currentAngle = newArrowAngle;
      }

      arrowMesh.userData.currentAngle = MathUtil.dampAngle(
        arrowMesh.userData.currentAngle,
        newArrowAngle,
        10,
        dt
      );

      const angle = arrowMesh.userData.currentAngle;
      const u = Math.cos(angle);
      const v = Math.sin(angle);
      const scl = 0.5; //Math.max(0.25, size);
      const r = radius + 1 + scl * geoPointScale;
      const x = u * r;
      const z = v * r;
      arrowMesh.position.set(x, ringMesh.position.y, z);
      arrowMesh.rotation.y = Math.PI + Math.PI / 2 + -angle;
    }

    for (let i = 0; i < dots.length; i++) {
      const dot = dots[i];
      const curArrow = arrows[i];
      dot.visible = false;
      curArrow.visible = false;

      let newSize = 0;
      let newAngle = dot.userData.currentAngle;

      const st = nextTokenState(dot);
      if (st) {
        st.consumed = true;

        const t = st.token;

        dot.userData.lastToken = t;
        const dx = t.position[0] - charX;
        const dz = t.position[1] - charZ;
        const dist = Math.sqrt(dx * dx + dz * dz);
        const maxDist = 100;
        newAngle = Math.atan2(dz, dx);
        const scl = 1; //Math.pow(1 - MathUtil.clamp01(dist / maxDist), 1);
        newSize = scl;
        if (dot.userData.currentAngle == null) {
          dot.userData.currentAngle = newAngle;
        }
      } else {
        dot.userData.lastToken = null;
      }

      dot.userData.currentAngle = MathUtil.dampAngle(
        dot.userData.currentAngle,
        newAngle,
        10,
        dt
      );
      dot.userData.currentSize = MathUtil.dampAngle(
        dot.userData.currentSize,
        newSize,
        5,
        dt
      );

      const angle = dot.userData.currentAngle;
      if (angle != null) {
        const size = dot.userData.currentSize;
        const u = Math.cos(angle);
        const v = Math.sin(angle);
        const scl = 0.7; //Math.max(0.25, size);
        const r = radius + 0.75 + scl * geoPointScale;
        const x = u * r;
        const z = v * r;
        dot.position.set(x, ringMesh.position.y - 0.25, z);
        dot.scale.setScalar(scl);
        // dot.material.uniforms.opacity.value = opacityTween.value;
        dot.visible = size >= 1e-5 && !directToOrigin;
        // dot.material.uniforms.opacity.value = size * opacityTween.value;
        if (dot.visible && dot.userData.lastToken) {
          if (dot.userData.lastTokenType !== dot.userData.lastToken.type) {
            dot.userData.lastTokenType = dot.userData.lastToken.type;
            setSpriteToken(renderer, dot, dot.userData.lastTokenType);
          }
          // setSpriteToken
        }
        const r2 = r + 0.75;
        if (resolving || directToOrigin) {
          curArrow.visible = false;
        } else {
          curArrow.visible = true;
          curArrow.position.set(u * r2, ringMesh.position.y, v * r2);
          curArrow.rotation.y = Math.PI + Math.PI / 2 + -angle;
          if (!hasInitArrow) {
            loadArrow();
          }
        }
      } else {
        dot.visible = false;
        curArrow.visible = false;
      }
    }
  };

  function nextTokenState(dot) {
    const lastToken = dot.userData.lastToken;
    if (lastToken) {
      const state = tokenStates.find((f) => f.token === lastToken);
      if (state && !state.consumed && state.token) {
        return state;
      }
    }
    const next = tokenStates.find((f) => f.token && !f.consumed);
    return next;
  }
}
