module.exports="#define GLSLIFY 1\n#ifdef HAS_INTENSITY\nvarying float vIntensity;\n#endif\n\n#ifdef HAS_VERTEX_COLORS\nvarying vec3 vVertexColor;\n#endif\n\nuniform bool ignoreGround;\nvarying vec2 vUv;\nvarying vec3 vViewPosition;\nvarying vec3 vNormal;\nvarying vec3 vPosition;\nvarying vec3 vWorldPosition;\nvarying vec2 vBillboardUV;\n\nuniform float alphaTest;\n\nuniform vec3 cameraDirection;\nuniform vec3 lightDirection;\nuniform vec3 lightPosition;\nuniform mat3 normalMatrix;\nuniform mat4 modelMatrix;\nuniform mat4 modelViewMatrix;\nuniform sampler2D map;\nuniform sampler2D overlayMap;\nuniform vec3 color;\nuniform vec3 colorA;\nuniform vec3 colorB;\nuniform vec3 minBounds;\nuniform vec3 maxBounds;\nuniform vec3 overlayColor;\nuniform vec2 resolution;\nuniform float groundBounceStrength;\nuniform float groundBounceLow;\nuniform float groundBounceHigh;\nuniform bool groundBounce;\n\nvarying vec2 vGroundUv;\nuniform sampler2D groundTexture;\nuniform bool groundTextureEnabled;\n\n// uniform sampler2D noiseMap;\nuniform sampler2D normalMap;\n\nuniform bool flipNormalY;\nuniform bool debugNormals;\nuniform bool useNormalMap;\nuniform bool diffuseShading;\nuniform bool celShading;\nuniform bool darkShading;\nuniform bool vertexColors;\nuniform bool useOverlayMap;\nuniform bool useDiffuseMap;\n\nfloat range(float vmin, float vmax, float value) {\n  return (value - vmin) / (vmax - vmin);\n}\n\nvec2 range(vec2 vmin, vec2 vmax, vec2 value) {\n  return (value - vmin) / (vmax - vmin);\n}\n\nvec3 range(vec3 vmin, vec3 vmax, vec3 value) {\n  return (value - vmin) / (vmax - vmin);\n}\n\nvec4 range(vec4 vmin, vec4 vmax, vec4 value) {\n  return (value - vmin) / (vmax - vmin);\n}\n\nfloat blendSoftLight(float base, float blend) {\n\treturn (blend<0.5)?(2.0*base*blend+base*base*(1.0-2.0*blend)):(sqrt(base)*(2.0*blend-1.0)+2.0*base*(1.0-blend));\n}\n\nvec3 blendSoftLight(vec3 base, vec3 blend) {\n\treturn vec3(blendSoftLight(base.r,blend.r),blendSoftLight(base.g,blend.g),blendSoftLight(base.b,blend.b));\n}\n\nvec3 blendSoftLight(vec3 base, vec3 blend, float opacity) {\n\treturn (blendSoftLight(base, blend) * opacity + base * (1.0 - opacity));\n}\n\nfloat blendOverlay(float base, float blend) {\n\treturn base<0.5?(2.0*base*blend):(1.0-2.0*(1.0-base)*(1.0-blend));\n}\n\nvec3 blendOverlay(vec3 base, vec3 blend) {\n\treturn vec3(blendOverlay(base.r,blend.r),blendOverlay(base.g,blend.g),blendOverlay(base.b,blend.b));\n}\n\nvec3 blendOverlay(vec3 base, vec3 blend, float opacity) {\n\treturn (blendOverlay(base, blend) * opacity + base * (1.0 - opacity));\n}\n\n//\n// Description : Array and textureless GLSL 2D/3D/4D simplex\n//               noise functions.\n//      Author : Ian McEwan, Ashima Arts.\n//  Maintainer : ijm\n//     Lastmod : 20110822 (ijm)\n//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.\n//               Distributed under the MIT License. See LICENSE file.\n//               https://github.com/ashima/webgl-noise\n//\n\nvec3 mod289(vec3 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec4 mod289(vec4 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec4 permute(vec4 x) {\n     return mod289(((x*34.0)+1.0)*x);\n}\n\nvec4 taylorInvSqrt(vec4 r)\n{\n  return 1.79284291400159 - 0.85373472095314 * r;\n}\n\nfloat snoise(vec3 v)\n  {\n  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;\n  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);\n\n// First corner\n  vec3 i  = floor(v + dot(v, C.yyy) );\n  vec3 x0 =   v - i + dot(i, C.xxx) ;\n\n// Other corners\n  vec3 g_0 = step(x0.yzx, x0.xyz);\n  vec3 l = 1.0 - g_0;\n  vec3 i1 = min( g_0.xyz, l.zxy );\n  vec3 i2 = max( g_0.xyz, l.zxy );\n\n  //   x0 = x0 - 0.0 + 0.0 * C.xxx;\n  //   x1 = x0 - i1  + 1.0 * C.xxx;\n  //   x2 = x0 - i2  + 2.0 * C.xxx;\n  //   x3 = x0 - 1.0 + 3.0 * C.xxx;\n  vec3 x1 = x0 - i1 + C.xxx;\n  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y\n  vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y\n\n// Permutations\n  i = mod289(i);\n  vec4 p = permute( permute( permute(\n             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))\n           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))\n           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));\n\n// Gradients: 7x7 points over a square, mapped onto an octahedron.\n// The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)\n  float n_ = 0.142857142857; // 1.0/7.0\n  vec3  ns = n_ * D.wyz - D.xzx;\n\n  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)\n\n  vec4 x_ = floor(j * ns.z);\n  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)\n\n  vec4 x = x_ *ns.x + ns.yyyy;\n  vec4 y = y_ *ns.x + ns.yyyy;\n  vec4 h = 1.0 - abs(x) - abs(y);\n\n  vec4 b0 = vec4( x.xy, y.xy );\n  vec4 b1 = vec4( x.zw, y.zw );\n\n  //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;\n  //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;\n  vec4 s0 = floor(b0)*2.0 + 1.0;\n  vec4 s1 = floor(b1)*2.0 + 1.0;\n  vec4 sh = -step(h, vec4(0.0));\n\n  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;\n  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;\n\n  vec3 p0 = vec3(a0.xy,h.x);\n  vec3 p1 = vec3(a0.zw,h.y);\n  vec3 p2 = vec3(a1.xy,h.z);\n  vec3 p3 = vec3(a1.zw,h.w);\n\n//Normalise gradients\n  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));\n  p0 *= norm.x;\n  p1 *= norm.y;\n  p2 *= norm.z;\n  p3 *= norm.w;\n\n// Mix final noise value\n  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);\n  m = m * m;\n  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),\n                                dot(p2,x2), dot(p3,x3) ) );\n  }\n\nfloat luma(vec3 color) {\n  return dot(color, vec3(0.299, 0.587, 0.114));\n}\n\nfloat luma(vec4 color) {\n  return dot(color.rgb, vec3(0.299, 0.587, 0.114));\n}\n\nfloat dither4x4_0(vec2 position, float brightness) {\n  int x = int(mod(position.x, 4.0));\n  int y = int(mod(position.y, 4.0));\n  int index = x + y * 4;\n  float limit = 0.0;\n\n  if (x < 8) {\n    if (index == 0) limit = 0.0625;\n    if (index == 1) limit = 0.5625;\n    if (index == 2) limit = 0.1875;\n    if (index == 3) limit = 0.6875;\n    if (index == 4) limit = 0.8125;\n    if (index == 5) limit = 0.3125;\n    if (index == 6) limit = 0.9375;\n    if (index == 7) limit = 0.4375;\n    if (index == 8) limit = 0.25;\n    if (index == 9) limit = 0.75;\n    if (index == 10) limit = 0.125;\n    if (index == 11) limit = 0.625;\n    if (index == 12) limit = 1.0;\n    if (index == 13) limit = 0.5;\n    if (index == 14) limit = 0.875;\n    if (index == 15) limit = 0.375;\n  }\n\n  return brightness < limit ? 0.0 : 1.0;\n}\n\nvec3 dither4x4_0(vec2 position, vec3 color) {\n  return color * dither4x4_0(position, luma(color));\n}\n\nvec4 dither4x4_0(vec2 position, vec4 color) {\n  return vec4(color.rgb * dither4x4_0(position, luma(color)), 1.0);\n}\n\nvec3 faceNormals(vec3 pos) {\n  vec3 fdx = dFdx(pos);\n  vec3 fdy = dFdy(pos);\n  return normalize(cross(fdx, fdy));\n}\n\nvec3 perturbNormal2Arb( vec3 eye_pos, vec3 surf_norm, vec3 mapN ) {\n\n  // Workaround for Adreno 3XX dFd*( vec3 ) bug. See #9988\n\n  vec3 q0 = vec3( dFdx( eye_pos.x ), dFdx( eye_pos.y ), dFdx( eye_pos.z ) );\n  vec3 q1 = vec3( dFdy( eye_pos.x ), dFdy( eye_pos.y ), dFdy( eye_pos.z ) );\n  vec2 st0 = dFdx( vUv.st );\n  vec2 st1 = dFdy( vUv.st );\n\n  float scale = sign( st1.t * st0.s - st0.t * st1.s ); // we do not care about the magnitude\n\n  vec3 S = normalize( ( q0 * st1.t - q1 * st0.t ) * scale );\n  vec3 T = normalize( ( - q0 * st1.s + q1 * st0.s ) * scale );\n  vec3 N = normalize( surf_norm );\n\n  mat3 tsn = mat3( S, T, N );\n\n  mapN.xy *= ( float( gl_FrontFacing ) * 2.0 - 1.0 );\n\n  return normalize( tsn * mapN );\n\n}\nfloat aastep(float threshold, float value) {\n  float change = fwidth(value) * 0.5;\n  float lo = threshold - change;\n  float hi = threshold + change;\n  return smoothstep(threshold - change, threshold + change, value);\n}\n\nfloat aastep1(float threshold, float value) {\n  float change = fwidth(value) * 0.5;\n  float lo = threshold - change;\n  float hi = threshold + change;\n  return clamp((value - lo) / (hi - lo), 0.0, 1.0);\n}\n// float aastep(float threshold, float value) {\n//   float change = fwidth(value) * 0.5;\n//   // float change = fwidth(value) * 0.5;\n//   // float change = fwidth(value) * 0.5;\n//   // float change = 0.1;\n//   float lo = threshold - change;\n//   float hi = threshold + change;\n//   return clamp((value - lo) / (hi - lo), 0.0, 1.0);\n// }\n\nvec4 blend(vec4 background, vec4 foreground) {\n    return (foreground.rgba * foreground.a) + background.rgba * (1.0 - foreground.a);\n}\n\nfloat roundf (float f) {\n  return floor(f + 0.5);\n}\n\n// float fastnoise3D(vec3 p)\n// {\n//   p.z = fract(p.z)*256.0;\n//   float iz = floor(p.z);\n//   float fz = fract(p.z);\n//   vec2 a_off = vec2(23.0, 29.0)*(iz)/256.0;\n//   vec2 b_off = vec2(23.0, 29.0)*(iz+1.0)/256.0;\n//   float a = texture2D(noiseMap, p.xy + a_off).r;\n//   float b = texture2D(noiseMap, p.xy + b_off).r;\n//   return mix(a, b, fz);\n// }\n\nfloat dither4x4(vec2 position, float brightness) {\n  int x = int(mod(position.x, 4.0));\n  int y = int(mod(position.y, 4.0));\n  int index = x + y * 4;\n  float limit = 0.0;\n\n  if (x < 8) {\n    if (index == 0) limit = 0.0625;\n    if (index == 1) limit = 0.5625;\n    if (index == 2) limit = 0.1875;\n    if (index == 3) limit = 0.6875;\n    if (index == 4) limit = 0.8125;\n    if (index == 5) limit = 0.3125;\n    if (index == 6) limit = 0.9375;\n    if (index == 7) limit = 0.4375;\n    if (index == 8) limit = 0.25;\n    if (index == 9) limit = 0.75;\n    if (index == 10) limit = 0.125;\n    if (index == 11) limit = 0.625;\n    if (index == 12) limit = 1.0;\n    if (index == 13) limit = 0.5;\n    if (index == 14) limit = 0.875;\n    if (index == 15) limit = 0.375;\n  }\n\n  return brightness < limit ? 0.0 : 1.0;\n}\n\nfloat fcos( float x )\n{\n  float w = fwidth(x);\n  // return cos(x) * smoothstep( 3.14*2.0, 0.0, w );\n  return cos(x) * smoothstep(3.14*2.0, 0.0, w);\n}\nfloat hash(vec3 p) {\n  // return fract(sin(p.x * 1e2 + p.y) * 1e5 + sin(p.y * 1e3) * 1e3 + sin(p.x * 735. + p.y * 11.1) * 1.5e2);\n  float a = 0.0;\n  a += 0.25 * cos(p.x * 10.0 + 20.0);\n  a += 0.5 * cos(p.y * 10.0 + 40.0);\n  // a += 0.33 * cos(p.z * 10.0 + 60.0);\n  return a;\n}\n\n// GLSL smootherstep [smthrstp] from http://graphicscodex.com for reference\nfloat smootherstep(float start, float end, float t) {\n   t = max(0.0, min(1.0, (t - start) / (end - start)));\n   return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\n}\n\nfloat Value3D( vec3 P )\n{\n  //  https://github.com/BrianSharpe/Wombat/blob/master/Value3D.glsl\n  // establish our grid cell and unit position\n  vec3 Pi = floor(P);\n  vec3 Pf = P - Pi;\n  vec3 Pf_min1 = Pf - 1.0;\n\n  // clamp the domain\n  Pi.xyz = Pi.xyz - floor(Pi.xyz * ( 1.0 / 69.0 )) * 69.0;\n  vec3 Pi_inc1 = step( Pi, vec3( 69.0 - 1.5 ) ) * ( Pi + 1.0 );\n\n  // calculate the hash\n  vec4 Pt = vec4( Pi.xy, Pi_inc1.xy ) + vec2( 50.0, 161.0 ).xyxy;\n  Pt *= Pt;\n  Pt = Pt.xzxz * Pt.yyww;\n  vec2 hash_mod = vec2( 1.0 / ( 635.298681 + vec2( Pi.z, Pi_inc1.z ) * 48.500388 ) );\n  vec4 hash_lowz = fract( Pt * hash_mod.xxxx );\n  vec4 hash_highz = fract( Pt * hash_mod.yyyy );\n\n  // blend the results and return\n  vec3 blend = Pf * Pf * Pf * (Pf * (Pf * 6.0 - 15.0) + 10.0);\n  vec4 res0 = mix( hash_lowz, hash_highz, blend.z );\n  vec4 blend2 = vec4( blend.xy, vec2( 1.0 - blend.xy ) );\n  return dot( res0, blend2.zxzx * blend2.wwyy ) * 2.0 - 1.0;\n}\n// void main () {\n//   gl_FragColor = vec4(1.0);\n// }\n\nvoid main () {\n  #ifdef HAS_INTENSITY\n  float intensity = vIntensity;\n  #else\n  float intensity = 1.0;\n  #endif\n\n  vec3 vLightDir = -lightDirection;\n  vec3 L = normalize(vLightDir);\n  vec3 V = normalize(vViewPosition);\n  vec3 N = vNormal;\n  vec4 diffuseColorRGBA = texture2D(map, vUv).rgba;\n  vec3 diffuseColor = diffuseColorRGBA.rgb;\n  float H = hash(vWorldPosition.xyz);\n\n  vec3 mapN = texture2D(normalMap, vUv).xyz;\n  if (flipNormalY) mapN.y = 1.0 - mapN.y;\n  mapN = mapN * 2.0 - 1.0;\n\n  vec3 fdx = vec3( dFdx( vViewPosition.x ), dFdx( vViewPosition.y ), dFdx( vViewPosition.z ) );\n\tvec3 fdy = vec3( dFdy( vViewPosition.x ), dFdy( vViewPosition.y ), dFdy( vViewPosition.z ) );\n\t// N = normalize( cross( fdx, fdy ) );\n\n  if (useNormalMap) {\n    N = normalize(perturbNormal2Arb( -vViewPosition, N, mapN ));\n  }\n\n  // vec3 normalized = range(minBounds, maxBounds, vWorldPosition);\n\n  vec3 minGrounded = minBounds;\n  minGrounded.y = max(0.0, minGrounded.y);\n  vec3 maxGrounded = maxBounds;\n  maxGrounded.y = max(0.0, maxGrounded.y);\n  vec3 normalized = range(minGrounded, maxGrounded, vWorldPosition);\n\n  float diffuse = (0.5 * dot(N, L)) + 0.5;\n  \n  // vec3 randomNoise3 = vec3(texture2D(noiseMap, vBillboardUV)).xyz * 2.0 - 1.0;\n  vec3 randomNoise3 = vec3(0.0);\n  float randomNoise = randomNoise3.x * 0.01;\n\n  \n  float hNoise = Value3D(vWorldPosition.xyz * 30.0);\n\n  float diffuseStep = 0.0;\n  // diffuseStep *= aastep(0.25, diffuse);\n  // diffuseStep = mix(diffuseStep, 0.5, aastep(0.5, diffuse));\n  // diffuseStep = aastep(0.75, diffuse + diffuseColor.r * 0.02);\n  // diffuseStep += aastep(0.25, diffuse + diffuseColor.g * 0.02) * 0.5;\n  // diffuseStep = min(diffuseStep, 1.0);\n\n  // diffuseStep = aastep(0.25, diffuse);\n\n  // diffuseStep *= dither(vPosition.xz * 10.0, diffuse);\n\n  // if (diffuse <= 0.2) {\n  //   diffuseStep = 0.0;\n  // } else if (diffuse <= 0.25) {\n  //   diffuseStep = 1.0;\n  // }\n\n  // float highlightLow = 0.5;\n  // float highlightHigh = 0.75;\n  // float diffuseStepHigh = aastep(0.5, smoothstep(\n  //   0.5, 0.75, diffuse\n  // ));\n  // float diffuseStepLow = aastep(0.5, smoothstep(\n  //   0.0, 0.25, diffuse\n  // ));\n\n  vec3 camUpWorld = vec3(viewMatrix[0].y, viewMatrix[1].y, viewMatrix[2].y);\n  vec3 VC = normalize(camUpWorld);\n  // vec3 VC = normalize(cross(camRightWorld, camUpWorld));\n  // vec3 VC = normalize(cameraDirection);\n  float vDotN = 1.0 - clamp(dot(V, N), 0.0, 1.0);\n  float rim = aastep(0.5, vDotN + hNoise * 0.05);\n\n  // float gradient = pow(clamp(vWorldPosition.y / 2.0, 0.0, 1.0), 1.0);\n\n  // float ramp = intensity;\n  // if (diffuseShading) {\n  //   ramp = diffuse;\n  // } else {\n  //   ramp = diffuseStep;\n  //   // if (celShading) ramp = mix(intensity * 0.75, 1.0, diffuseStep);\n  //   // if (darkShading) ramp = mix(0.0, ramp, rim);\n  // }\n\n  vec3 gtex = texture2D(groundTexture, vGroundUv).rgb;\n\n// gl_FragColor.rgb = mix(gl_FragColor.rgb, gl_FragColor.rgb * diffuse, 0.5);\n\n  float highCut = 0.75;\n  float lowCut = 0.15;\n  // float midRangeOpacity = 0.33;\n  // float lowRangeOpacity = 0.5;\n  // gl_FragColor.rgb = mix(gl_FragColor.rgb, gl_FragColor.rgb * (aastep(highCut, diffuse)), midRangeOpacity);\n  // gl_FragColor.rgb = mix(gl_FragColor.rgb, gl_FragColor.rgb * rim, lowRangeOpacity);\n  // gl_FragColor.rgb = mix(gl_FragColor.rgb, gl_FragColor.rgb * (aastep(lowCut, diffuse)), lowRangeOpacity);\n\n  gl_FragColor.rgb = vec3(1.0);\n  // gl_FragColor.rgb = diffuseShading ? vec3(diffuse) : vec3(1.0);\n  // gl_FragColor.rgb = diffuseShading ? vec3(diffuse) : vec3(1.0);\n  if (useDiffuseMap) gl_FragColor.rgb *= diffuseColor.rgb;\n  // float highCutStep = smoothstep(0.75, 1.0, diffuse);\n  float bounce = 0.75;\n  float bounceCut = smoothstep(0.5, 0.25, diffuse);\n\n  // float lowCutStep = 1.0 - rim;\n  float lowCutStep = 1.0 - smoothstep(groundBounceLow, groundBounceHigh, diffuse + hNoise * 0.01);\n  // float lowCutStep = 1.0 - aastep(0.1, diffuse + hNoise * 0.01);\n  // float highCutStep = aastep(0.75, diffuse + hNoise * 0.01);\n  // float bounceCut = 1.0-aastep(0.25, diffuse);\n\n  // if (groundBounce) gl_FragColor.rgb = mix(gl_FragColor.rgb, gl_FragColor.rgb * gtex.rgb, lowCutStep * groundBounceStrength);\n  // gl_FragColor.rgb = mix(gl_FragColor.rgb, gl_FragColor.rgb * gtex.rgb * 0.35, (1.0 - rim) * 1.0);\n\n  // float overlay = texture2D(overlayMap, vUv).r;\n  // if (useDiffuseMap) {\n  //   gl_FragColor.rgb *= diffuseColor;\n  // }\n\n  // if (diffuseShading) gl_FragColor.rgb *= diffuse;\n  // else gl_FragColor.rgb = blendOverlay(gl_FragColor.rgb, mix(colorA, colorB, diffuseStep));\n\n  // if (useOverlayMap) {\n  //   vec4 overlayColor4 = vec4(vec3(overlayColor), (1.0 - overlay) * rim);\n  //   gl_FragColor = blend(gl_FragColor, overlayColor4);\n  // }\n\n  if (groundTextureEnabled && !ignoreGround) {\n    // float ny = normalized.y;\n    float ny = vWorldPosition.y / 0.75 + hNoise * 0.1;\n    // float ny = normalized.y + (useDiffuseMap ? -0.01*(diffuseColor.r) : 0.0);\n    float pv = smootherstep(0.0, 0.35, ny);\n    // float pv = aastep(0.5, smootherstep(0.05, 0.5, ny));\n    // gl_FragColor.rgb = vec3(pv);\n    gl_FragColor.rgb = mix(gtex, gl_FragColor.rgb, pv);\n  }\n\n  // gl_FragColor.rgb = vec3(hNoise);\n  if (debugNormals) gl_FragColor.rgb = N * 0.5 + 0.5;\n  \n  gl_FragColor.a = 1.0;\n  if (diffuseColorRGBA.a < alphaTest) discard;\n  // gl_FragColor.rgb = vec3(randomNoise3.x * 0.5 + 0.5);\n\n}\n\n// void mai2n () {\n//   float noff = 0.0;//noise(vec3(vPosition * 12.0));\n//   // float noff = noise(vec3(vPosition * 12.0));\n//   vec3 col = texture2D(map, vUv).rgb;\n//   // vec3 col = texture2D(map, vUv + vec2(0.0, noff * 0.03)).rgb;\n\n//   float y0, y1;\n//   // if (vUv.y <= (550.0/1024.0)) {\n//   //   y0 = 576.0/1024.0;\n//   //   y1 = 1.0;\n//   // } else {\n//   //   y0 = 64.0/1024.0;\n//   //   y1 = 512.0/1024.0;\n//   // }\n//   float py = vUv.y * 1024.0;\n//   float intensity = range(\n//     576.0,\n//     1024.0,\n//     py\n//   );\n\n//   // float intensity = vUv.y >= 0.5 ? 1.0 : 0.0;\n//   // intensity = 1.0;\n  \n//   #ifdef HAS_INTENSITY\n//     intensity = vIntensity;\n//   #endif\n//   intensity = pow(intensity, 1.0 / 2.2);\n\n//   vec3 vLightDir = -lightDirection;\n//   // vec3 vLightDir = (viewMatrix * vec4(lightDirection, 1.0)).xyz;\n//   // vec3 vLightDir = (viewMatrix * vec4(normalize(vec3(-2.0, 1.0, 2.0)), 1.0)).xyz;\n//   vec3 L = normalize(vLightDir);\n//   vec3 V = normalize(vViewPosition);\n\n//   vec3 normalized = range(minBounds, maxBounds, vWorldPosition);\n//   float cylindricalHeight = normalized.y;\n//   float theta = atan(normalized.z, normalized.x);\n//   float angle01 = range(-3.14, 3.14, theta);\n  \n//   // float n = normalized.y;\n//   // float n = texture2D(noise1DMap, vec2(0.0, normalized.y * 0.005 + sin(vWorldPosition.x) * 0.5)).r;\n//   // n = smoothstep(0.4, 0.45, n);\n//   // n = texture2D(noise1DMap, vec2(0.5, col.r + 1.0 / 512.0 * n)).r;\n\n//   vec3 N = vNormal;\n//   // vec3 N = normalize(colnorm * 2.0 - 1.0);\n\n//   // float n0 = texture2D(noise1DMap, vec2(0.5, normalized.y + vWorldPosition.y)).r;\n//   // float n1 = texture2D(noise1DMap, vec2(0.5, normalized.y + vWorldPosition.y + vWorldPosition.x)).r;\n\n//   float diffuse = (0.5 * dot(N, L)) + 0.5;\n//   float ndotl = diffuse;\n//   float i = 1.0;\n//   // if (diffuse >= 0.5) {\n//   //   i = 0.75;\n//   // } else {\n//   //   i = 0.25;\n//   // }\n//   // float doff = (n0 * 2.0 - 1.0) * 0.05;\n  \n//   // i = mix(0.25, 0.75, clamp(step(0.65, diffuse + doff), 0.0, 1.0));\n//   // diffuse = i;\n\n//   float ux = 0.5;\n  \n//   float dstep = aastep(0.5, smoothstep(0.5, 0.75, diffuse + noff * 0.025));\n//   // float dstep = aastep(0.5, diffuse + noff * 0.1);\n//   diffuse = mix(0.0, 1.0, dstep);\n//   // if (diffuse >= 0.66) {\n//   //   diffuse = 0.85;\n//   // } else {\n//   //   diffuse = 0.2;\n//   // }\n//   // if (diffuse >= 0.75) {\n//   //   diffuse = 0.8;\n//   // } else if (diffuse >= 0.5) {\n//   //   diffuse = 0.5;\n//   // } else {\n//   //   diffuse = 0.2;\n//   // }\n\n//   // diffuse += (n0 * 2.0 - 1.0) * 0.025 / 4.0;\n//   // diffuse += (n1 * 2.0 - 1.0) * 0.025 / 4.0;\n//   // if (diffuse >= 0.5) {\n//   //   // i = 1.0;\n//   //   i = step(0.75, diffuse + (n0 * 2.0 - 1.0) * 0.1);\n//   // } else if (diffuse >= 0.25) {\n//   //   i = step(0.5, diffuse + (n1 * 2.0 - 1.0) * 0.1);\n//   // } else {\n//   //   i = 0.25;\n//   // }\n//   // diffuse = i;\n\n//   // intensity += (n * 2.0 - 1.0) * 0.025;\n//   // if (intensity >= 0.5) {\n//   //   i = 1.0;\n//   // } else if (intensity >= 0.25) {\n//   //   i = 0.5;\n//   // } else {\n//   //   i = 0.25;\n//   // }\n//   // intensity = i;\n\n  // vec3 camRightWorld = vec3(viewMatrix[0].x, viewMatrix[1].x, viewMatrix[2].x);\n  // vec3 camUpWorld = vec3(viewMatrix[0].y, viewMatrix[1].y, viewMatrix[2].y);\n\n  // vec3 VC = normalize(camUpWorld);\n//   // vec3 VC = normalize(cross(camRightWorld, camUpWorld));\n//   // vec3 VC = normalize(cameraDirection);\n  // float vDotN = 1.0 - clamp(dot(VC, vNormal), 0.0, 1.0);\n//   float rim = aastep(0.5, vDotN + noff * 0.025);\n\n//   // float ink01 = 0.0;\n//   // ink01 += 0.5 * clamp(step(0.5, vDotN + (n0 * 2.0 - 1.0) * 0.05), 0.0, 1.0);\n//   // ink01 += 0.5 * clamp(step(0.5, vDotN + (n1 * 2.0 - 1.0) * 0.05), 0.0, 1.0);\n//   // ink01 += 0.33 * clamp(step(0.5, vDotN), 0.0, 1.0);\n\n//   // VC = normalize(camUpWorld);\n//   // vDotN = 1.0 - clamp(dot(VC, N), 0.0, 1.0);\n//   // float ink02 = step(0.5, vDotN);\n\n//   // diffuse += 1.0-n;\n//   // vec3 styleColor = blendSoftLight(vec3(intensity), vec3(diffuse), 1.0);\n//   float intensityAmount = 0.75;\n//   // vec3 styleColor = vec3(mix(diffuse, intensity, intensityAmount));\n//   vec3 solidColor = vec3(intensity);\n//   // vec3 styleColor = vec3(mix(intensity, 0.5, 0.5) + diffuse * 0.5);\n\n//   float gradient = pow(clamp(vWorldPosition.y / 2.0, 0.0, 1.0), 1.0);\n\n//   float dsteprim = aastep(0.5, smoothstep(0.1, 0.25, ndotl + noff * 0.025));\n//   // float dstep = aastep(0.5, diffuse + noff * 0.1);\n//   float drim = mix(0.0, 1.0, dsteprim);\n   \n\n//   float ramp = mix(intensity * 0.75, 1.0, diffuse);\n//   ramp = mix(0.0, ramp, rim);\n//   gl_FragColor.rgb = vec3(ramp);\n\n//   vec2 nuv = vec2(0.0);\n  \n//   float py2 = (576.0 / 1024.0) * 1024.0;\n//   // float nv = clamp(range(\n//   //   576.0,\n//   //   1024.0,\n//   //   py2 + 448.0 * ramp\n//   // ), 0.0, 1.0);\n//   // nuv.x = vUv.x;\n//   // nuv.y = nv;\n//   y1 = ((579.0 + 439.0) / 1024.0);\n//   y0 = 579.0 / 1024.0;\n//   vec3 color0 = texture2D(map, vec2(vUv.x, y0)).rgb;\n//   vec3 color1 = texture2D(map, vec2(vUv.x, y1)).rgb;\n//   gl_FragColor.rgb = mix(color0, color1, ramp);\n//   // gl_FragColor.rgb = color1;\n\n//   // vec3 solidFlat = color * 1.0;\n//   // gl_FragColor.rgb = mix(color * solidColor, solidFlat, diffuse);\n//   // gl_FragColor.rgb = mix(color * 0.5, gl_FragColor.rgb, gradient);\n\n//   // gl_FragColor.rgb = mix(\n//   //   vec3(22.0,29.0,40.0)/255.0,\n//   //   vec3(132.0,165.0,164.0)/255.0,\n//   //   gl_FragColor.r\n//   // );\n\n//   // gl_FragColor.rgb = mix(vec3(0.0), gl_FragColor.rgb, drim);\n  \n//   gl_FragColor.a = 1.0;\n\n//   // vec3 lineColor = vec3(1.0) * (1.0 - n);\n  \n//   // gl_FragColor.rgb = blendSoftLight(gl_FragColor.rgb, lineColor, 0.2);\n//   // gl_FragColor.rgba = blend(gl_FragColor.rgba, vec4(vec3(1.0), n));\n//   gl_FragColor.a = 1.0;\n//   gl_FragColor.rgb = vec3(vIntensity);\n//   // gl_FragColor.rgb = vec3(intensity);\n\n// }\n";