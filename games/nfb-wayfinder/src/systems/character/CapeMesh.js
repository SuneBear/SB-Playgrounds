import * as THREE from "three";
import * as MathUtil from "../../util/math";
import * as ShaderManager from "../../util/ShaderManager";
import { tweenTo, setEntityTweenFromTo } from "../AnimationSystem";
import createTimeline from "../../util/tween-ticker";

import {
  CylinderBufferGeometry,
  CylinderGeometry,
} from "../../util/ModCylinderGeometry";

export default function CapeMesh(world, { map }) {
  const radiusBottom = 0.8;
  const radiusTop = 0.15;
  const height = 1; // needs to be one !! for the shader
  const radialSegments = 32;

  const user = world.findTag(Tags.UserCharacter);

  const geometry = new CylinderBufferGeometry({
    radiusTop,
    radiusBottom,
    height,
    radialSegments,
    heightSegments: 8,
    openTop: false,
    openBottom: false,
  });
  // const geometry = new THREE.CylinderGeometry(
  //   radiusTop,
  //   radiusBottom,
  //   height,
  //   radialSegments,
  //   2
  // );
  geometry.translate(0, height / 2, 0);

  // const rot = new THREE.Matrix4().makeRotationZ(MathUtil.degToRad(45 / 4));
  // geometry.vertices.forEach((v) => {
  //   if (v.y > 0) {
  //     // v.applyMatrix4(rot);
  //   } else {
  //     // v.x -= 0.25;
  //   }
  // });

  const material = ShaderManager.create({
    // wireframe: true,
    uniforms: {
      cap: { value: true, type: "b" },
      color: { value: new THREE.Color("#de4d26") },
      overlayColor: { value: new THREE.Color("#f7eaaf") },
      opacity: { value: 1 },
      ripple: { value: 0 },
      rotationAngle: { value: 0 },
      map: { value: map },
      mapScale: { value: new THREE.Vector2().setScalar(0.75) },
      mapOffset: { value: new THREE.Vector2(0.45, 0.5) },
      coneHeight: { value: height },
      tilt: { value: 0 },
      magicalEffect: { value: 0 },
      stroke: { value: false, type: "b" },
      elapsed: { value: 0 },
      glowIntensity: { value: 1 },
      glowIntensity2: { value: 1 },
    },
    name: "cape-mesh",
    extensions: {
      derivatives: true,
    },
    side: THREE.DoubleSide,
    // wireframe: true,
    fragmentShader: /*glsl*/ `
      #include <common>
      uniform vec3 color;
      uniform vec3 overlayColor;
      uniform float opacity;
      uniform sampler2D map;
      uniform float magicalEffect;
      uniform float glowIntensity;
      uniform float glowIntensity2;
      varying float vConeY;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying float vAngle;
      varying float vCap;
      varying vec2 vScreenUv;
      uniform bool stroke;
      varying vec3 vViewPoisition;

      vec4 tex2DConstScale(sampler2D tex, float texSize, vec2 uv)
      {
        // uv.x *= aspect;
        // uv.xy *= spriteHeight;
        vec2 offset = vec2(0.0, 0.0);
        // Find the discretized derivatives of our coordinates
        float maxDeriv = max(length(dFdx(uv)), length(dFdy(uv)));
        float pixScale = 1.0 / (texSize * maxDeriv);
        // Find two nearest log-discretized noise scales
        vec2 pixScales = vec2(
          exp2(floor(log2(pixScale))),
          exp2(ceil(log2(pixScale)))
        );
        // Factor to interpolate lerp with
        float lerpFactor = fract(log2(pixScale));

        float scale = 0.1;
        return mix(
          texture2D(tex, pixScales.x * scale * uv + offset),
          texture2D(tex, pixScales.y * scale * uv + offset),
          lerpFactor
        );
      }

      void main () {
        float L = texture2D(map, vUv).r * glowIntensity;

        float rim = clamp(dot(normalize(vViewPoisition), vNormal), 0.0, 1.0);
        rim = step(0.5, rim);
        vec3 curOverlay = overlayColor + 0.75;
        
        // float L = tex2DConstScale(map, 256.0, vUv).r;
        if (vCap > 0.5) {
          gl_FragColor = vec4(color, opacity);
        } else {
          float edges = step(0.045, vConeY);
          // float edges = clamp(step(0.05, vConeY) * step(vConeY, 1.0 - 0.05), 0.0, 1.0);

          vec3 outColor = mix(color, overlayColor, L) * glowIntensity2;
          outColor = mix(vec3(magicalEffect), outColor, edges);
          // outColor.rgb = mix(outColor * 0.85, outColor, vec3(rim));

          // outColor = mix(outColor, outColor * 0.75, pow(1.0 - vConeY, 1.5));


          // gl_FragColor = vec4(vec3(edges), 1.0);
          gl_FragColor = vec4(outColor, opacity);
        }
        if (stroke) {
          gl_FragColor.rgb = vec3(0.0);
        }
        // gl_FragColor.rgb += vCap;
        // gl_FragColor.a = 1.0;
      }
    `,
    vertexShader: /*glsl*/ `
      #include <common>
      attribute float capState;
      attribute float vertexAngle;
      uniform float tilt;
      uniform float ripple;
      uniform bool stroke;
      uniform float elapsed;
      uniform float coneHeight;
      varying float vAngle;
      uniform vec2 mapScale;
      uniform vec2 mapOffset;
      uniform float rotationAngle;
      varying vec2 vScreenUv;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying float vCap;
      varying float vConeY;
      varying vec3 vViewPoisition;

      void main () {
        vUv = mapOffset + uv * mapScale;
        vCap = capState;
        vec3 transformed = position.xyz;

        
        float rippleTime = 0.0;

        vec3 centerWorldPos = (modelMatrix * vec4(vec3(0.0), 1.0)).xyz;
        vec3 camRightWorld = vec3(viewMatrix[0].x, viewMatrix[1].x, viewMatrix[2].x);
        vec3 camUpWorld = vec3(viewMatrix[0].y, viewMatrix[1].y, viewMatrix[2].y);

        vec2 scale;
        scale.x = length( vec3( modelMatrix[ 0 ].x, modelMatrix[ 0 ].y, modelMatrix[ 0 ].z ) );
        scale.y = length( vec3( modelMatrix[ 1 ].x, modelMatrix[ 1 ].y, modelMatrix[ 1 ].z ) );

        vec3 vertexWorldPos = centerWorldPos;

        float coneYAlpha = position.y / coneHeight;
        vec2 norm = normalize(transformed.xz);
        float coneAngle = atan(norm.y, norm.x);
        float tAngle = (coneAngle + PI) / (PI * 2.0);
        vAngle = coneAngle;
        float coneYStrength = smoothstep(0.5, 0.0, coneYAlpha);

        vConeY = coneYAlpha;

        if (capState < 0.5) {
          vec3 targetPoint = vec3(0.0, coneHeight, 0.0);
          vec3 targetDir = normalize(position.xyz - targetPoint);

          float time = ripple * PI * 2.0;
          float rippleFreq = PI * 2.0 * 0.5;
          float rippleAmp = 0.1;
          transformed.xz += norm * cos(coneAngle * 5.0 + elapsed) * 0.1 * pow(1.0 - coneYAlpha, 5.0);
          transformed.xyz += targetDir * (sin(coneAngle * rippleFreq + time)) * rippleAmp * coneYStrength;
        }
        transformed.xyz += tilt * vec3(-1.0, 0.0, 0.0) * (1.0 - pow(coneYAlpha, 0.85));


        if (stroke) {
          // transformed.xyz *= 1.1;
          // transformed.xyz += normal.xyz * 0.2;
          // transformed.y -= 0.1;
        }
        
        // if (capState < -0.5) {
        //   transformed.y -= 0.1;
        // }
        vNormal = normalMatrix * normal;
        vec3 worldPos = (modelMatrix * vec4(transformed.xyz, 1.0)).xyz;
        // vec3 moveDir = vec3(cos(rotationAngle), 0.0, sin(rotationAngle));
        // worldPos -= moveDir * tilt * 4.0;
        vec4 vpos = viewMatrix * vec4(worldPos, 1.0);
        vViewPoisition = -vpos.xyz;

        gl_Position = projectionMatrix * vpos;
        vec4 spritePos = projectionMatrix * viewMatrix * vec4(vertexWorldPos, 1.0);
        vScreenUv = (gl_Position.xy / gl_Position.w * 0.5 + 0.5);
        vScreenUv.x -= spritePos.x / spritePos.w * 0.5 + 0.5;
        vScreenUv.y -= spritePos.y / spritePos.w * 0.5 + 0.5;
        vScreenUv = vScreenUv * 12.0;
        // vScreenUv.x -= rotationAngle;
      }
    `,
  });

  const mesh = new THREE.Mesh(geometry, material);
  // mesh.scale.setScalar(0.6);
  // mesh.scale.y *= 1.4;

  // const stroke = mesh.clone();
  // stroke.material = stroke.material.clone();
  // stroke.material.uniforms = THREE.UniformsUtils.clone(
  //   stroke.material.uniforms
  // );
  // // stroke.material.depthTest = false;
  // // stroke.material.depthWrite = false;
  // stroke.material.uniforms.stroke.value = true;
  // // stroke.renderOrder = 1;
  // // mesh.renderOrder = 2;
  // stroke.material.side = THREE.BackSide;

  const anchor = new THREE.Group();
  anchor.add(mesh);
  // anchor.add(stroke);

  // const effects = world.listen(Tags.CapeMagicalEffect);
  // const effectsOff = world.listen(Tags.CapeMagicalEffectPersisted);
  // const effectInTween = world.entity();
  // const effectOutTween = world.entity();

  const effectView = world.view(Tags.CapeMagicalEffect);
  const autoRemoveEffects = world.view(Tags.AutoRemoveCapeMagicalEffect);
  const timeline = createTimeline();
  let magicState = { enabled: false, value: 0 };

  const outroState = world.view(Tags.FinalBiomeResolution);
  // const animateOutMagic = (delay = 2) => {
  //   effectInTween.remove(Tags.TargetKeyTween);
  //   effectOutTween.remove(Tags.TargetKeyTween);
  //   setEntityTweenFromTo(
  //     effectOutTween,
  //     material.uniforms.magicalEffect,
  //     "value",
  //     material.uniforms.magicalEffect.value,
  //     0,
  //     2,
  //     "sineOut",
  //     delay
  //   );
  //   const t1 = effectOutTween.get(Tags.TargetKeyTween);
  //   t1.killEntityOnFinish = false;
  //   t1.assignFromOnStart = true;
  // };

  // const meshes = [mesh];
  return {
    group: anchor,
    update(dt, camera, lookAngle, speed) {
      timeline.tick(dt);

      autoRemoveEffects.forEach((e) => {
        const d = e.get(Tags.AutoRemoveCapeMagicalEffect);
        d.elapsed += dt;
        if (d.elapsed >= d.delay) {
          e.tagOff(Tags.CapeMagicalEffect);
          e.tagOff(Tags.AutoRemoveCapeMagicalEffect);
        }
      });

      // meshes.forEach((mesh) => {
      mesh.rotation.y = lookAngle;
      // const material = mesh.material;
      material.uniforms.tilt.value = speed * 1.15;
      material.uniforms.rotationAngle.value = lookAngle;
      material.uniforms.elapsed.value += dt;
      material.uniforms.glowIntensity.value = user.glowIntensity;
      material.uniforms.glowIntensity2.value = user.glowIntensity2;
      if (user.capeSpeed > 0) {
        material.uniforms.ripple.value += dt * user.capeSpeed;
      } else {
        material.uniforms.ripple.value += dt * MathUtil.lerp(0.2, 2, speed);
      }

      // });

      // if (effects.added.length > 0) {
      //   effectInTween.remove(Tags.TargetKeyTween);
      //   effectOutTween.remove(Tags.TargetKeyTween);

      //   setEntityTweenFromTo(
      //     effectInTween,
      //     material.uniforms.magicalEffect,
      //     "value",
      //     material.uniforms.magicalEffect.value,
      //     4,
      //     1,
      //     "sineOut",
      //     0
      //   );
      //   const t0 = effectInTween.get(Tags.TargetKeyTween);
      //   t0.killEntityOnFinish = false;
      //   t0.assignFromOnStart = true;

      //   const cur = effects.added[0];
      //   if (!cur.has(Tags.CapeMagicalEffectPersisted)) {
      //     animateOutMagic();
      //   }
      // } else if (effectsOff.removing.length > 0) {
      //   animateOutMagic(0);
      // }

      const hasMagic =
        outroState.length > 0 ||
        effectView.length > 0 ||
        world.findTag(Tags.DirectUserToOrigin);
      if (magicState.enabled !== hasMagic) {
        timeline.cancel().to(magicState, {
          value: hasMagic ? 4 : 0,
          duration: hasMagic ? 1 : 2,
          ease: "sineOut",
          // delay: hasMagic ? 0 : 2,
        });
        magicState.enabled = hasMagic;
      }

      // if (outroState.length > 0) {
      //   material.uniforms.magicalEffect.value = user.magicalEffect;
      // } else {
      material.uniforms.magicalEffect.value = magicState.value;
      // }

      // material.uniforms.magicalEffect.value = ;
    },
  };
}
