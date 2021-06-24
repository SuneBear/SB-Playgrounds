import * as THREE from "three";
import * as ShaderManager from "./ShaderManager";

let planeGeo;

export default function createSprite(opts = {}) {
  const {
    map = new THREE.Texture(),
    scale = 1,
    opacity = 1,
    color = "white",
  } = opts;
  let planeGeo = opts.geometry;
  if (!planeGeo) {
    planeGeo = new THREE.PlaneGeometry(1, 1, 1, 1);
    planeGeo.translate(0, 0.5, 0);
  }
  const isMultiply = opts.blending === THREE.MultiplyBlending;
  const rgba = opts.rgba;
  const isGroundMap =
    opts.groundMap != null && opts.groundProjectionMatrix != null;
  const matOpts = { ...opts };
  delete matOpts.geometry;
  delete matOpts.groundMap;
  delete matOpts.groundProjectionMatrix;
  delete matOpts.color;
  delete matOpts.rgba;
  delete matOpts.opacity;
  delete matOpts.map;
  delete matOpts.scale;
  const material = ShaderManager.create({
    name: "createPlaneSprite",
    // extensions: {
    //   derivatives: true,
    // },
    ...matOpts,
    defines: {
      IS_RGBA: rgba,
      IS_MULTIPLY: isMultiply,
      IS_GROUND_MAP: isGroundMap,
    },
    fragmentShader: /* glsl */ `
      varying vec2 vUv;
      uniform sampler2D map;
      uniform vec3 color;
      uniform float opacity;
      #ifdef IS_GROUND_MAP
      uniform sampler2D groundMap;
      varying vec3 vGroundColor;
      varying vec2 vGroundUv;
      varying float vGroundY;
      #endif
      void main () {
        vec4 tcol = texture2D(map, vUv);
        #if defined(IS_RGBA)
        gl_FragColor.rgba = tcol;
        gl_FragColor.rgb *= color;
        gl_FragColor.a *= opacity;
        #elif defined(IS_MULTIPLY)
        gl_FragColor.rgb = mix(vec3(1.0), tcol.rgb * color, tcol.a * opacity);
        gl_FragColor.a = 1.0;
        #else
        gl_FragColor.rgba = tcol;
        gl_FragColor.rgb *= color;
        gl_FragColor.a *= opacity;
        #endif
        #ifdef IS_GROUND_MAP
        // vec3 vGroundColor = texture2D(groundMap, vGroundUv).rgb;
        gl_FragColor.rgb = mix(vGroundColor, gl_FragColor.rgb, vGroundY);
        gl_FragColor.a = tcol.a * opacity;
        #endif

      }
    `,
    vertexShader: /* glsl */ `
      #include <common>
      uniform float rotation;
      uniform vec2 repeat;
      uniform vec2 offset;
      uniform float globalScale;
      uniform float flip;
      uniform vec2 translate;
      varying vec3 vObjectCoord;
      varying vec2 vScreenScale;
      varying vec2 vUv;
      #ifdef IS_GROUND_MAP
      varying float vGroundY;
      uniform mat4 groundProjectionMatrix;
      uniform sampler2D groundMap;
      varying vec3 vGroundColor;
      varying vec2 vGroundUv;
      uniform float groundYDistance;
      #endif
      void main () {
        vUv = uv;
        vUv *= repeat;
        vUv += offset;
        
        vec3 centerWorldPos = (modelMatrix * vec4(vec3(0.0), 1.0)).xyz;
        vec3 camRightWorld = vec3(viewMatrix[0].x, viewMatrix[1].x, viewMatrix[2].x);
        vec3 camUpWorld = vec3(viewMatrix[0].y, viewMatrix[1].y, viewMatrix[2].y);

        vec2 scale;
        scale.x = length( vec3( modelMatrix[ 0 ].x, modelMatrix[ 0 ].y, modelMatrix[ 0 ].z ) );
        scale.y = length( vec3( modelMatrix[ 1 ].x, modelMatrix[ 1 ].y, modelMatrix[ 1 ].z ) );
        scale.x *= flip;
        scale *= globalScale;
        vScreenScale = scale.xy;

        vec3 vertexWorldPos = centerWorldPos
          + camRightWorld * position.x * scale.x
          + camUpWorld * position.y * scale.y;

        #ifdef IS_GROUND_MAP
          vec3 vertexCenterWorldPos = centerWorldPos;
          vec4 baseClipPos = groundProjectionMatrix * viewMatrix * vec4(vertexCenterWorldPos, 1.0);
          vGroundUv = baseClipPos.xy / baseClipPos.w * 0.5 + 0.5;
          vGroundColor = texture2D(groundMap, vGroundUv).rgb;
          vGroundY = vertexWorldPos.y / groundYDistance;
        #endif

        vertexWorldPos += camRightWorld * translate.x * scale.x;
        vertexWorldPos += camUpWorld * translate.y * scale.y;

        gl_Position = projectionMatrix * viewMatrix * vec4(vertexWorldPos, 1.0);
        vObjectCoord = vec3(position.xy, 0.0);
      }
    `,
    uniforms: {
      map: { value: map || new THREE.Texture() },
      groundMap: { value: opts.groundMap || new THREE.Texture() },
      groundProjectionMatrix: {
        value: opts.groundProjectionMatrix || new THREE.Matrix4(),
      },
      groundYDistance: { value: 0.5 },
      flip: { value: 1 },
      globalScale: { value: scale },
      color: { value: new THREE.Color(color) },
      translate: { value: new THREE.Vector2(0, 0) },
      repeat: { value: new THREE.Vector2(1, 1) },
      offset: { value: new THREE.Vector2(0, 0) },
      opacity: { value: opacity },
    },
  });
  return new THREE.Mesh(planeGeo, material);
}
