#define GLSLIFY 1
#ifdef HAS_INTENSITY
varying float vIntensity;
#endif
#ifdef HAS_VERTEX_COLORS
varying vec3 vVertexColor;
#endif
uniform bool ignoreGround;
varying vec2 vUv;
varying vec3 vViewPosition;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vWorldPosition;
varying vec2 vBillboardUV;
uniform float alphaTest;
uniform vec3 cameraDirection;
uniform vec3 lightDirection;
uniform vec3 lightPosition;
uniform mat3 normalMatrix;
uniform mat4 modelMatrix;
uniform mat4 modelViewMatrix;
uniform sampler2D map;
uniform sampler2D overlayMap;
uniform vec3 color;
uniform vec3 colorA;
uniform vec3 colorB;
uniform vec3 minBounds;
uniform vec3 maxBounds;
uniform vec3 overlayColor;
uniform vec2 resolution;
uniform float groundBounceStrength;
uniform float groundBounceLow;
uniform float groundBounceHigh;
uniform bool groundBounce;
varying vec2 vGroundUv;
uniform sampler2D groundTexture;
uniform bool groundTextureEnabled;
// uniform sampler2D noiseMap;
uniform sampler2D normalMap;
uniform bool flipNormalY;
uniform bool debugNormals;
uniform bool useNormalMap;
uniform bool diffuseShading;
uniform bool celShading;
uniform bool darkShading;
uniform bool vertexColors;
uniform bool useOverlayMap;
uniform bool useDiffuseMap;
float range(float vmin, float vmax, float value) {
    return (value - vmin) / (vmax - vmin);
}
vec2 range(vec2 vmin, vec2 vmax, vec2 value) {
    return (value - vmin) / (vmax - vmin);
}
vec3 range(vec3 vmin, vec3 vmax, vec3 value) {
    return (value - vmin) / (vmax - vmin);
}
vec4 range(vec4 vmin, vec4 vmax, vec4 value) {
    return (value - vmin) / (vmax - vmin);
}
float blendSoftLight(float base, float blend) {
  return (blend<0.5)?(2.0*base*blend+base*base*(1.0-2.0*blend)):(sqrt(base)*(2.0*blend-1.0)+2.0*base*(1.0-blend));
}
vec3 blendSoftLight(vec3 base, vec3 blend) {
  return vec3(blendSoftLight(base.r,blend.r),blendSoftLight(base.g,blend.g),blendSoftLight(base.b,blend.b));
}
vec3 blendSoftLight(vec3 base, vec3 blend, float opacity) {
  return (blendSoftLight(base, blend) * opacity + base * (1.0 - opacity));
}
float blendOverlay(float base, float blend) {
  return base<0.5?(2.0*base*blend):(1.0-2.0*(1.0-base)*(1.0-blend));
}
vec3 blendOverlay(vec3 base, vec3 blend) {
  return vec3(blendOverlay(base.r,blend.r),blendOverlay(base.g,blend.g),blendOverlay(base.b,blend.b));
}
vec3 blendOverlay(vec3 base, vec3 blend, float opacity) {
  return (blendOverlay(base, blend) * opacity + base * (1.0 - opacity));
}
//
// Description : Array and textureless GLSL 2D/3D/4D simplex
//               noise functions.
//      Author : Ian McEwan, Ashima Arts.
//  Maintainer : ijm
//     Lastmod : 20110822 (ijm)
//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
//               Distributed under the MIT License. See LICENSE file.
//               https://github.com/ashima/webgl-noise
//
vec3 mod289(vec3 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}
vec4 mod289(vec4 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}
vec4 permute(vec4 x) {
       return mod289(((x*34.0)+1.0)*x);
}
vec4 taylorInvSqrt(vec4 r)
{
    return 1.79284291400159 - 0.85373472095314 * r;
}
float snoise(vec3 v)
  {
    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
// First corner
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 =   v - i + dot(i, C.xxx) ;
// Other corners
  vec3 g_0 = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g_0;
  vec3 i1 = min( g_0.xyz, l.zxy );
  vec3 i2 = max( g_0.xyz, l.zxy );
  //   x0 = x0 - 0.0 + 0.0 * C.xxx;
  //   x1 = x0 - i1  + 1.0 * C.xxx;
  //   x2 = x0 - i2  + 2.0 * C.xxx;
  //   x3 = x0 - 1.0 + 3.0 * C.xxx;
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
  vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y
// Permutations
  i = mod289(i);
  vec4 p = permute( permute( permute(
               i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
// Gradients: 7x7 points over a square, mapped onto an octahedron.
// The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
  float n_ = 0.142857142857; // 1.0/7.0
  vec3  ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)
  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );
  //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
  //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);
//Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
// Mix final noise value
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                dot(p2,x2), dot(p3,x3) ) );
  }
float luma(vec3 color) {
    return dot(color, vec3(0.299, 0.587, 0.114));
}
float luma(vec4 color) {
    return dot(color.rgb, vec3(0.299, 0.587, 0.114));
}
float dither4x4_0(vec2 position, float brightness) {
    int x = int(mod(position.x, 4.0));
  int y = int(mod(position.y, 4.0));
  int index = x + y * 4;
  float limit = 0.0;
  if (x < 8) {
      if (index == 0) limit = 0.0625;
    if (index == 1) limit = 0.5625;
    if (index == 2) limit = 0.1875;
    if (index == 3) limit = 0.6875;
    if (index == 4) limit = 0.8125;
    if (index == 5) limit = 0.3125;
    if (index == 6) limit = 0.9375;
    if (index == 7) limit = 0.4375;
    if (index == 8) limit = 0.25;
    if (index == 9) limit = 0.75;
    if (index == 10) limit = 0.125;
    if (index == 11) limit = 0.625;
    if (index == 12) limit = 1.0;
    if (index == 13) limit = 0.5;
    if (index == 14) limit = 0.875;
    if (index == 15) limit = 0.375;
  }
  return brightness < limit ? 0.0 : 1.0;
}
vec3 dither4x4_0(vec2 position, vec3 color) {
    return color * dither4x4_0(position, luma(color));
}
vec4 dither4x4_0(vec2 position, vec4 color) {
    return vec4(color.rgb * dither4x4_0(position, luma(color)), 1.0);
}
vec3 faceNormals(vec3 pos) {
    vec3 fdx = dFdx(pos);
  vec3 fdy = dFdy(pos);
  return normalize(cross(fdx, fdy));
}
vec3 perturbNormal2Arb( vec3 eye_pos, vec3 surf_norm, vec3 mapN ) {
    // Workaround for Adreno 3XX dFd*( vec3 ) bug. See #9988
  vec3 q0 = vec3( dFdx( eye_pos.x ), dFdx( eye_pos.y ), dFdx( eye_pos.z ) );
  vec3 q1 = vec3( dFdy( eye_pos.x ), dFdy( eye_pos.y ), dFdy( eye_pos.z ) );
  vec2 st0 = dFdx( vUv.st );
  vec2 st1 = dFdy( vUv.st );
  float scale = sign( st1.t * st0.s - st0.t * st1.s ); // we do not care about the magnitude
  vec3 S = normalize( ( q0 * st1.t - q1 * st0.t ) * scale );
  vec3 T = normalize( ( - q0 * st1.s + q1 * st0.s ) * scale );
  vec3 N = normalize( surf_norm );
  mat3 tsn = mat3( S, T, N );
  mapN.xy *= ( float( gl_FrontFacing ) * 2.0 - 1.0 );
  return normalize( tsn * mapN );
}
float aastep(float threshold, float value) {
    float change = fwidth(value) * 0.5;
  float lo = threshold - change;
  float hi = threshold + change;
  return smoothstep(threshold - change, threshold + change, value);
}
float aastep1(float threshold, float value) {
    float change = fwidth(value) * 0.5;
  float lo = threshold - change;
  float hi = threshold + change;
  return clamp((value - lo) / (hi - lo), 0.0, 1.0);
}
// float aastep(float threshold, float value) {
  //   float change = fwidth(value) * 0.5;
//   // float change = fwidth(value) * 0.5;
//   // float change = fwidth(value) * 0.5;
//   // float change = 0.1;
//   float lo = threshold - change;
//   float hi = threshold + change;
//   return clamp((value - lo) / (hi - lo), 0.0, 1.0);
// }
vec4 blend(vec4 background, vec4 foreground) {
      return (foreground.rgba * foreground.a) + background.rgba * (1.0 - foreground.a);
}
float roundf (float f) {
    return floor(f + 0.5);
}
// float fastnoise3D(vec3 p)
// {
  //   p.z = fract(p.z)*256.0;
//   float iz = floor(p.z);
//   float fz = fract(p.z);
//   vec2 a_off = vec2(23.0, 29.0)*(iz)/256.0;
//   vec2 b_off = vec2(23.0, 29.0)*(iz+1.0)/256.0;
//   float a = texture2D(noiseMap, p.xy + a_off).r;
//   float b = texture2D(noiseMap, p.xy + b_off).r;
//   return mix(a, b, fz);
// }
float dither4x4(vec2 position, float brightness) {
    int x = int(mod(position.x, 4.0));
  int y = int(mod(position.y, 4.0));
  int index = x + y * 4;
  float limit = 0.0;
  if (x < 8) {
      if (index == 0) limit = 0.0625;
    if (index == 1) limit = 0.5625;
    if (index == 2) limit = 0.1875;
    if (index == 3) limit = 0.6875;
    if (index == 4) limit = 0.8125;
    if (index == 5) limit = 0.3125;
    if (index == 6) limit = 0.9375;
    if (index == 7) limit = 0.4375;
    if (index == 8) limit = 0.25;
    if (index == 9) limit = 0.75;
    if (index == 10) limit = 0.125;
    if (index == 11) limit = 0.625;
    if (index == 12) limit = 1.0;
    if (index == 13) limit = 0.5;
    if (index == 14) limit = 0.875;
    if (index == 15) limit = 0.375;
  }
  return brightness < limit ? 0.0 : 1.0;
}
float fcos( float x )
{
    float w = fwidth(x);
  // return cos(x) * smoothstep( 3.14*2.0, 0.0, w );
  return cos(x) * smoothstep(3.14*2.0, 0.0, w);
}
float hash(vec3 p) {
    // return fract(sin(p.x * 1e2 + p.y) * 1e5 + sin(p.y * 1e3) * 1e3 + sin(p.x * 735. + p.y * 11.1) * 1.5e2);
  float a = 0.0;
  a += 0.25 * cos(p.x * 10.0 + 20.0);
  a += 0.5 * cos(p.y * 10.0 + 40.0);
  // a += 0.33 * cos(p.z * 10.0 + 60.0);
  return a;
}
// GLSL smootherstep [smthrstp] from http://graphicscodex.com for reference
float smootherstep(float start, float end, float t) {
     t = max(0.0, min(1.0, (t - start) / (end - start)));
   return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}
float Value3D( vec3 P )
{
    //  https://github.com/BrianSharpe/Wombat/blob/master/Value3D.glsl
  // establish our grid cell and unit position
  vec3 Pi = floor(P);
  vec3 Pf = P - Pi;
  vec3 Pf_min1 = Pf - 1.0;
  // clamp the domain
  Pi.xyz = Pi.xyz - floor(Pi.xyz * ( 1.0 / 69.0 )) * 69.0;
  vec3 Pi_inc1 = step( Pi, vec3( 69.0 - 1.5 ) ) * ( Pi + 1.0 );
  // calculate the hash
  vec4 Pt = vec4( Pi.xy, Pi_inc1.xy ) + vec2( 50.0, 161.0 ).xyxy;
  Pt *= Pt;
  Pt = Pt.xzxz * Pt.yyww;
  vec2 hash_mod = vec2( 1.0 / ( 635.298681 + vec2( Pi.z, Pi_inc1.z ) * 48.500388 ) );
  vec4 hash_lowz = fract( Pt * hash_mod.xxxx );
  vec4 hash_highz = fract( Pt * hash_mod.yyyy );
  // blend the results and return
  vec3 blend = Pf * Pf * Pf * (Pf * (Pf * 6.0 - 15.0) + 10.0);
  vec4 res0 = mix( hash_lowz, hash_highz, blend.z );
  vec4 blend2 = vec4( blend.xy, vec2( 1.0 - blend.xy ) );
  return dot( res0, blend2.zxzx * blend2.wwyy ) * 2.0 - 1.0;
}
// void main () {
  //   gl_FragColor = vec4(1.0);
// }
void main () {
    #ifdef HAS_INTENSITY
  float intensity = vIntensity;
  #else
  float intensity = 1.0;
  #endif
  vec3 vLightDir = -lightDirection;
  vec3 L = normalize(vLightDir);
  vec3 V = normalize(vViewPosition);
  vec3 N = vNormal;
  vec4 diffuseColorRGBA = texture2D(map, vUv).rgba;
  vec3 diffuseColor = diffuseColorRGBA.rgb;
  float H = hash(vWorldPosition.xyz);
  vec3 mapN = texture2D(normalMap, vUv).xyz;
  if (flipNormalY) mapN.y = 1.0 - mapN.y;
  mapN = mapN * 2.0 - 1.0;
  vec3 fdx = vec3( dFdx( vViewPosition.x ), dFdx( vViewPosition.y ), dFdx( vViewPosition.z ) );
vec3 fdy = vec3( dFdy( vViewPosition.x ), dFdy( vViewPosition.y ), dFdy( vViewPosition.z ) );
// N = normalize( cross( fdx, fdy ) );
  if (useNormalMap) {
      N = normalize(perturbNormal2Arb( -vViewPosition, N, mapN ));
  }
  // vec3 normalized = range(minBounds, maxBounds, vWorldPosition);
  vec3 minGrounded = minBounds;
  minGrounded.y = max(0.0, minGrounded.y);
  vec3 maxGrounded = maxBounds;
  maxGrounded.y = max(0.0, maxGrounded.y);
  vec3 normalized = range(minGrounded, maxGrounded, vWorldPosition);
  float diffuse = (0.5 * dot(N, L)) + 0.5;

  // vec3 randomNoise3 = vec3(texture2D(noiseMap, vBillboardUV)).xyz * 2.0 - 1.0;
  vec3 randomNoise3 = vec3(0.0);
  float randomNoise = randomNoise3.x * 0.01;

  float hNoise = Value3D(vWorldPosition.xyz * 30.0);
  float diffuseStep = 0.0;
  // diffuseStep *= aastep(0.25, diffuse);
  // diffuseStep = mix(diffuseStep, 0.5, aastep(0.5, diffuse));
  // diffuseStep = aastep(0.75, diffuse + diffuseColor.r * 0.02);
  // diffuseStep += aastep(0.25, diffuse + diffuseColor.g * 0.02) * 0.5;
  // diffuseStep = min(diffuseStep, 1.0);
  // diffuseStep = aastep(0.25, diffuse);
  // diffuseStep *= dither(vPosition.xz * 10.0, diffuse);
  // if (diffuse <= 0.2) {
    //   diffuseStep = 0.0;
  // } else if (diffuse <= 0.25) {
    //   diffuseStep = 1.0;
  // }
  // float highlightLow = 0.5;
  // float highlightHigh = 0.75;
  // float diffuseStepHigh = aastep(0.5, smoothstep(
    //   0.5, 0.75, diffuse
  // ));
  // float diffuseStepLow = aastep(0.5, smoothstep(
    //   0.0, 0.25, diffuse
  // ));
  vec3 camUpWorld = vec3(viewMatrix[0].y, viewMatrix[1].y, viewMatrix[2].y);
  vec3 VC = normalize(camUpWorld);
  // vec3 VC = normalize(cross(camRightWorld, camUpWorld));
  // vec3 VC = normalize(cameraDirection);
  float vDotN = 1.0 - clamp(dot(V, N), 0.0, 1.0);
  float rim = aastep(0.5, vDotN + hNoise * 0.05);
  // float gradient = pow(clamp(vWorldPosition.y / 2.0, 0.0, 1.0), 1.0);
  // float ramp = intensity;
  // if (diffuseShading) {
    //   ramp = diffuse;
  // } else {
    //   ramp = diffuseStep;
  //   // if (celShading) ramp = mix(intensity * 0.75, 1.0, diffuseStep);
  //   // if (darkShading) ramp = mix(0.0, ramp, rim);
  // }
  vec3 gtex = texture2D(groundTexture, vGroundUv).rgb;
// gl_FragColor.rgb = mix(gl_FragColor.rgb, gl_FragColor.rgb * diffuse, 0.5);
  float highCut = 0.75;
  float lowCut = 0.15;
  // float midRangeOpacity = 0.33;
  // float lowRangeOpacity = 0.5;
  // gl_FragColor.rgb = mix(gl_FragColor.rgb, gl_FragColor.rgb * (aastep(highCut, diffuse)), midRangeOpacity);
  // gl_FragColor.rgb = mix(gl_FragColor.rgb, gl_FragColor.rgb * rim, lowRangeOpacity);
  // gl_FragColor.rgb = mix(gl_FragColor.rgb, gl_FragColor.rgb * (aastep(lowCut, diffuse)), lowRangeOpacity);
  gl_FragColor.rgb = vec3(1.0);
  // gl_FragColor.rgb = diffuseShading ? vec3(diffuse) : vec3(1.0);
  // gl_FragColor.rgb = diffuseShading ? vec3(diffuse) : vec3(1.0);
  if (useDiffuseMap) gl_FragColor.rgb *= diffuseColor.rgb;
  // float highCutStep = smoothstep(0.75, 1.0, diffuse);
  float bounce = 0.75;
  float bounceCut = smoothstep(0.5, 0.25, diffuse);
  // float lowCutStep = 1.0 - rim;
  float lowCutStep = 1.0 - smoothstep(groundBounceLow, groundBounceHigh, diffuse + hNoise * 0.01);
  // float lowCutStep = 1.0 - aastep(0.1, diffuse + hNoise * 0.01);
  // float highCutStep = aastep(0.75, diffuse + hNoise * 0.01);
  // float bounceCut = 1.0-aastep(0.25, diffuse);
  // if (groundBounce) gl_FragColor.rgb = mix(gl_FragColor.rgb, gl_FragColor.rgb * gtex.rgb, lowCutStep * groundBounceStrength);
  // gl_FragColor.rgb = mix(gl_FragColor.rgb, gl_FragColor.rgb * gtex.rgb * 0.35, (1.0 - rim) * 1.0);
  // float overlay = texture2D(overlayMap, vUv).r;
  // if (useDiffuseMap) {
    //   gl_FragColor.rgb *= diffuseColor;
  // }
  // if (diffuseShading) gl_FragColor.rgb *= diffuse;
  // else gl_FragColor.rgb = blendOverlay(gl_FragColor.rgb, mix(colorA, colorB, diffuseStep));
  // if (useOverlayMap) {
    //   vec4 overlayColor4 = vec4(vec3(overlayColor), (1.0 - overlay) * rim);
  //   gl_FragColor = blend(gl_FragColor, overlayColor4);
  // }
  if (groundTextureEnabled && !ignoreGround) {
      // float ny = normalized.y;
    float ny = vWorldPosition.y / 0.75 + hNoise * 0.1;
    // float ny = normalized.y + (useDiffuseMap ? -0.01*(diffuseColor.r) : 0.0);
    float pv = smootherstep(0.0, 0.35, ny);
    // float pv = aastep(0.5, smootherstep(0.05, 0.5, ny));
    // gl_FragColor.rgb = vec3(pv);
    gl_FragColor.rgb = mix(gtex, gl_FragColor.rgb, pv);
  }
  // gl_FragColor.rgb = vec3(hNoise);
  if (debugNormals) gl_FragColor.rgb = N * 0.5 + 0.5;

  gl_FragColor.a = 1.0;
  if (diffuseColorRGBA.a < alphaTest) discard;
  // gl_FragColor.rgb = vec3(randomNoise3.x * 0.5 + 0.5);
}
// void mai2n () {
  //   float noff = 0.0;//noise(vec3(vPosition * 12.0));
//   // float noff = noise(vec3(vPosition * 12.0));
//   vec3 col = texture2D(map, vUv).rgb;
//   // vec3 col = texture2D(map, vUv + vec2(0.0, noff * 0.03)).rgb;
//   float y0, y1;
//   // if (vUv.y <= (550.0/1024.0)) {
  //   //   y0 = 576.0/1024.0;
//   //   y1 = 1.0;
//   // } else {
  //   //   y0 = 64.0/1024.0;
//   //   y1 = 512.0/1024.0;
//   // }
//   float py = vUv.y * 1024.0;
//   float intensity = range(
  //     576.0,
//     1024.0,
//     py
//   );
//   // float intensity = vUv.y >= 0.5 ? 1.0 : 0.0;
//   // intensity = 1.0;

//   #ifdef HAS_INTENSITY
//     intensity = vIntensity;
//   #endif
//   intensity = pow(intensity, 1.0 / 2.2);
//   vec3 vLightDir = -lightDirection;
//   // vec3 vLightDir = (viewMatrix * vec4(lightDirection, 1.0)).xyz;
//   // vec3 vLightDir = (viewMatrix * vec4(normalize(vec3(-2.0, 1.0, 2.0)), 1.0)).xyz;
//   vec3 L = normalize(vLightDir);
//   vec3 V = normalize(vViewPosition);
//   vec3 normalized = range(minBounds, maxBounds, vWorldPosition);
//   float cylindricalHeight = normalized.y;
//   float theta = atan(normalized.z, normalized.x);
//   float angle01 = range(-3.14, 3.14, theta);

//   // float n = normalized.y;
//   // float n = texture2D(noise1DMap, vec2(0.0, normalized.y * 0.005 + sin(vWorldPosition.x) * 0.5)).r;
//   // n = smoothstep(0.4, 0.45, n);
//   // n = texture2D(noise1DMap, vec2(0.5, col.r + 1.0 / 512.0 * n)).r;
//   vec3 N = vNormal;
//   // vec3 N = normalize(colnorm * 2.0 - 1.0);
//   // float n0 = texture2D(noise1DMap, vec2(0.5, normalized.y + vWorldPosition.y)).r;
//   // float n1 = texture2D(noise1DMap, vec2(0.5, normalized.y + vWorldPosition.y + vWorldPosition.x)).r;
//   float diffuse = (0.5 * dot(N, L)) + 0.5;
//   float ndotl = diffuse;
//   float i = 1.0;
//   // if (diffuse >= 0.5) {
  //   //   i = 0.75;
//   // } else {
  //   //   i = 0.25;
//   // }
//   // float doff = (n0 * 2.0 - 1.0) * 0.05;

//   // i = mix(0.25, 0.75, clamp(step(0.65, diffuse + doff), 0.0, 1.0));
//   // diffuse = i;
//   float ux = 0.5;

//   float dstep = aastep(0.5, smoothstep(0.5, 0.75, diffuse + noff * 0.025));
//   // float dstep = aastep(0.5, diffuse + noff * 0.1);
//   diffuse = mix(0.0, 1.0, dstep);
//   // if (diffuse >= 0.66) {
  //   //   diffuse = 0.85;
//   // } else {
  //   //   diffuse = 0.2;
//   // }
//   // if (diffuse >= 0.75) {
  //   //   diffuse = 0.8;
//   // } else if (diffuse >= 0.5) {
  //   //   diffuse = 0.5;
//   // } else {
  //   //   diffuse = 0.2;
//   // }
//   // diffuse += (n0 * 2.0 - 1.0) * 0.025 / 4.0;
//   // diffuse += (n1 * 2.0 - 1.0) * 0.025 / 4.0;
//   // if (diffuse >= 0.5) {
  //   //   // i = 1.0;
//   //   i = step(0.75, diffuse + (n0 * 2.0 - 1.0) * 0.1);
//   // } else if (diffuse >= 0.25) {
  //   //   i = step(0.5, diffuse + (n1 * 2.0 - 1.0) * 0.1);
//   // } else {
  //   //   i = 0.25;
//   // }
//   // diffuse = i;
//   // intensity += (n * 2.0 - 1.0) * 0.025;
//   // if (intensity >= 0.5) {
  //   //   i = 1.0;
//   // } else if (intensity >= 0.25) {
  //   //   i = 0.5;
//   // } else {
  //   //   i = 0.25;
//   // }
//   // intensity = i;
  // vec3 camRightWorld = vec3(viewMatrix[0].x, viewMatrix[1].x, viewMatrix[2].x);
  // vec3 camUpWorld = vec3(viewMatrix[0].y, viewMatrix[1].y, viewMatrix[2].y);
  // vec3 VC = normalize(camUpWorld);
//   // vec3 VC = normalize(cross(camRightWorld, camUpWorld));
//   // vec3 VC = normalize(cameraDirection);
  // float vDotN = 1.0 - clamp(dot(VC, vNormal), 0.0, 1.0);
//   float rim = aastep(0.5, vDotN + noff * 0.025);
//   // float ink01 = 0.0;
//   // ink01 += 0.5 * clamp(step(0.5, vDotN + (n0 * 2.0 - 1.0) * 0.05), 0.0, 1.0);
//   // ink01 += 0.5 * clamp(step(0.5, vDotN + (n1 * 2.0 - 1.0) * 0.05), 0.0, 1.0);
//   // ink01 += 0.33 * clamp(step(0.5, vDotN), 0.0, 1.0);
//   // VC = normalize(camUpWorld);
//   // vDotN = 1.0 - clamp(dot(VC, N), 0.0, 1.0);
//   // float ink02 = step(0.5, vDotN);
//   // diffuse += 1.0-n;
//   // vec3 styleColor = blendSoftLight(vec3(intensity), vec3(diffuse), 1.0);
//   float intensityAmount = 0.75;
//   // vec3 styleColor = vec3(mix(diffuse, intensity, intensityAmount));
//   vec3 solidColor = vec3(intensity);
//   // vec3 styleColor = vec3(mix(intensity, 0.5, 0.5) + diffuse * 0.5);
//   float gradient = pow(clamp(vWorldPosition.y / 2.0, 0.0, 1.0), 1.0);
//   float dsteprim = aastep(0.5, smoothstep(0.1, 0.25, ndotl + noff * 0.025));
//   // float dstep = aastep(0.5, diffuse + noff * 0.1);
//   float drim = mix(0.0, 1.0, dsteprim);

//   float ramp = mix(intensity * 0.75, 1.0, diffuse);
//   ramp = mix(0.0, ramp, rim);
//   gl_FragColor.rgb = vec3(ramp);
//   vec2 nuv = vec2(0.0);

//   float py2 = (576.0 / 1024.0) * 1024.0;
//   // float nv = clamp(range(
  //   //   576.0,
//   //   1024.0,
//   //   py2 + 448.0 * ramp
//   // ), 0.0, 1.0);
//   // nuv.x = vUv.x;
//   // nuv.y = nv;
//   y1 = ((579.0 + 439.0) / 1024.0);
//   y0 = 579.0 / 1024.0;
//   vec3 color0 = texture2D(map, vec2(vUv.x, y0)).rgb;
//   vec3 color1 = texture2D(map, vec2(vUv.x, y1)).rgb;
//   gl_FragColor.rgb = mix(color0, color1, ramp);
//   // gl_FragColor.rgb = color1;
//   // vec3 solidFlat = color * 1.0;
//   // gl_FragColor.rgb = mix(color * solidColor, solidFlat, diffuse);
//   // gl_FragColor.rgb = mix(color * 0.5, gl_FragColor.rgb, gradient);
//   // gl_FragColor.rgb = mix(
  //   //   vec3(22.0,29.0,40.0)/255.0,
//   //   vec3(132.0,165.0,164.0)/255.0,
//   //   gl_FragColor.r
//   // );
//   // gl_FragColor.rgb = mix(vec3(0.0), gl_FragColor.rgb, drim);

//   gl_FragColor.a = 1.0;
//   // vec3 lineColor = vec3(1.0) * (1.0 - n);

//   // gl_FragColor.rgb = blendSoftLight(gl_FragColor.rgb, lineColor, 0.2);
//   // gl_FragColor.rgba = blend(gl_FragColor.rgba, vec4(vec3(1.0), n));
//   gl_FragColor.a = 1.0;
//   gl_FragColor.rgb = vec3(vIntensity);
//   // gl_FragColor.rgb = vec3(intensity);
// }
