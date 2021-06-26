#define GLSLIFY 1
uniform highp sampler2D map;
uniform sampler2D noiseMap;
uniform sampler2D lutMap;
uniform sampler2D glowMap;
uniform float fadeToBlack;
uniform vec3 fadeToBlackColor;
uniform vec2 resolution;
uniform vec3 rampColor0;
uniform vec3 rampColor1;
uniform float time;
uniform float rampStrength;
uniform float lightColor;
varying vec2 vUv;
// uniform vec3 colorGradientA;
// vec3 texGlowMap(vec2 uv);
// #pragma glslify: blur = require('glsl-hash-blur', sample=texGlowMap, iterations=20)
// vec3 texGlowMap(vec2 uv) {
  //   return texture2D(glowMap, uv).rgb;
// }
float blendOverlay(float base, float blend) {
  return base<0.5?(2.0*base*blend):(1.0-2.0*(1.0-base)*(1.0-blend));
}
vec3 blendOverlay(vec3 base, vec3 blend) {
  return vec3(blendOverlay(base.r,blend.r),blendOverlay(base.g,blend.g),blendOverlay(base.b,blend.b));
}
vec3 blendOverlay(vec3 base, vec3 blend, float opacity) {
  return (blendOverlay(base, blend) * opacity + base * (1.0 - opacity));
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
// #define LUT_FLIP_Y
highp vec3 colorLUT(in highp vec3 textureColor, in highp sampler2D lookupTable) {
    textureColor = clamp(textureColor, 0.0, 1.0);
  highp float blueColor = textureColor.b * 63.0;
  highp vec2 quad1;
  quad1.y = floor(floor(blueColor) / 8.0);
  quad1.x = floor(blueColor) - (quad1.y * 8.0);
  highp vec2 quad2;
  quad2.y = floor(ceil(blueColor) / 8.0);
  quad2.x = ceil(blueColor) - (quad2.y * 8.0);
  highp vec2 texPos1;
  texPos1.x = (quad1.x * 0.125) + 0.5/512.0 + ((0.125 - 1.0/512.0) * textureColor.r);
  texPos1.y = (quad1.y * 0.125) + 0.5/512.0 + ((0.125 - 1.0/512.0) * textureColor.g);
  // #ifdef LUT_FLIP_Y
  texPos1.y = 1.0-texPos1.y;
  // #endif
  highp vec2 texPos2;
  texPos2.x = (quad2.x * 0.125) + 0.5/512.0 + ((0.125 - 1.0/512.0) * textureColor.r);
  texPos2.y = (quad2.y * 0.125) + 0.5/512.0 + ((0.125 - 1.0/512.0) * textureColor.g);
  // #ifdef LUT_FLIP_Y
  texPos2.y = 1.0-texPos2.y;
  // #endif
  highp vec3 newColor1 = texture2D(lookupTable, texPos1).rgb;
  highp vec3 newColor2 = texture2D(lookupTable, texPos2).rgb;
  highp vec3 newColor = mix(newColor1, newColor2, fract(blueColor));
  return newColor;
}
/**
Basic FXAA implementation based on the code on geeks3d.com with the
modification that the texture2DLod stuff was removed since it's
unsupported by WebGL.
--
From:
https://github.com/mitsuhiko/webgl-meincraft
Copyright (c) 2011 by Armin Ronacher.
Some rights reserved.
Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are
met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above
      copyright notice, this list of conditions and the following
      disclaimer in the documentation and/or other materials provided
      with the distribution.
    * The names of the contributors may not be used to endorse or
      promote products derived from this software without specific
      prior written permission.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
\"AS IS\" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
#ifndef FXAA_REDUCE_MIN
    #define FXAA_REDUCE_MIN   (1.0/ 128.0)
#endif
#ifndef FXAA_REDUCE_MUL
    #define FXAA_REDUCE_MUL   (1.0 / 8.0)
#endif
#ifndef FXAA_SPAN_MAX
    #define FXAA_SPAN_MAX     8.0
#endif
//optimized version for mobile, where dependent
//texture reads can be a bottleneck
vec4 fxaa(sampler2D tex, vec2 fragCoord, vec2 resolution,
            vec2 v_rgbNW, vec2 v_rgbNE,
            vec2 v_rgbSW, vec2 v_rgbSE,
            vec2 v_rgbM) {
      vec4 color;
    mediump vec2 inverseVP = vec2(1.0 / resolution.x, 1.0 / resolution.y);
    vec3 rgbNW = texture2D(tex, v_rgbNW).xyz;
    vec3 rgbNE = texture2D(tex, v_rgbNE).xyz;
    vec3 rgbSW = texture2D(tex, v_rgbSW).xyz;
    vec3 rgbSE = texture2D(tex, v_rgbSE).xyz;
    vec4 texColor = texture2D(tex, v_rgbM);
    vec3 rgbM  = texColor.xyz;
    vec3 luma = vec3(0.299, 0.587, 0.114);
    float lumaNW = dot(rgbNW, luma);
    float lumaNE = dot(rgbNE, luma);
    float lumaSW = dot(rgbSW, luma);
    float lumaSE = dot(rgbSE, luma);
    float lumaM  = dot(rgbM,  luma);
    float lumaMin = min(lumaM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE)));
    float lumaMax = max(lumaM, max(max(lumaNW, lumaNE), max(lumaSW, lumaSE)));

    mediump vec2 dir;
    dir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));
    dir.y =  ((lumaNW + lumaSW) - (lumaNE + lumaSE));

    float dirReduce = max((lumaNW + lumaNE + lumaSW + lumaSE) *
                          (0.25 * FXAA_REDUCE_MUL), FXAA_REDUCE_MIN);

    float rcpDirMin = 1.0 / (min(abs(dir.x), abs(dir.y)) + dirReduce);
    dir = min(vec2(FXAA_SPAN_MAX, FXAA_SPAN_MAX),
              max(vec2(-FXAA_SPAN_MAX, -FXAA_SPAN_MAX),
              dir * rcpDirMin)) * inverseVP;

    vec3 rgbA = 0.5 * (
          texture2D(tex, fragCoord * inverseVP + dir * (1.0 / 3.0 - 0.5)).xyz +
        texture2D(tex, fragCoord * inverseVP + dir * (2.0 / 3.0 - 0.5)).xyz);
    vec3 rgbB = rgbA * 0.5 + 0.25 * (
          texture2D(tex, fragCoord * inverseVP + dir * -0.5).xyz +
        texture2D(tex, fragCoord * inverseVP + dir * 0.5).xyz);
    float lumaB = dot(rgbB, luma);
    if ((lumaB < lumaMin) || (lumaB > lumaMax))
        color = vec4(rgbA, texColor.a);
    else
        color = vec4(rgbB, texColor.a);
    return color;
}
//To save 9 dependent texture reads, you can compute
//these in the vertex shader and use the optimized
//frag.glsl function in your frag shader.
//This is best suited for mobile devices, like iOS.
void texcoords(vec2 fragCoord, vec2 resolution,
out vec2 v_rgbNW, out vec2 v_rgbNE,
out vec2 v_rgbSW, out vec2 v_rgbSE,
out vec2 v_rgbM) {
  vec2 inverseVP = 1.0 / resolution.xy;
v_rgbNW = (fragCoord + vec2(-1.0, -1.0)) * inverseVP;
v_rgbNE = (fragCoord + vec2(1.0, -1.0)) * inverseVP;
v_rgbSW = (fragCoord + vec2(-1.0, 1.0)) * inverseVP;
v_rgbSE = (fragCoord + vec2(1.0, 1.0)) * inverseVP;
v_rgbM = vec2(fragCoord * inverseVP);
}
vec4 apply(sampler2D tex, vec2 fragCoord, vec2 resolution) {
  mediump vec2 v_rgbNW;
mediump vec2 v_rgbNE;
mediump vec2 v_rgbSW;
mediump vec2 v_rgbSE;
mediump vec2 v_rgbM;
//compute the texture coords
texcoords(fragCoord, resolution, v_rgbNW, v_rgbNE, v_rgbSW, v_rgbSE, v_rgbM);

//compute FXAA
return fxaa(tex, fragCoord, resolution, v_rgbNW, v_rgbNE, v_rgbSW, v_rgbSE, v_rgbM);
}
#define gamma 2.2
vec2 rotateAround (vec2 vec, vec2 center, float angle) {
    float c = cos( angle );
  float s = sin( angle );
  float x = vec.x - center.x;
  float y = vec.y - center.y;
  vec2 outVec;
  outVec.x = x * c - y * s + center.x;
  outVec.y = x * s + y * c + center.y;
  return outVec;
}
float linearGradient (vec2 uv, vec2 start, vec2 end) {
    vec2 gradientDirection = end - start;
  float gradientLenSq = dot(gradientDirection, gradientDirection);
  vec2 relCoords = uv - start;
  float t = dot(relCoords, gradientDirection);
  if (gradientLenSq != 0.0) t /= gradientLenSq;
  return t;
}
vec4 texLinear (sampler2D image, vec2 uv) {
    return texture2D(image, uv);
  // return GammaToLinear(texture2D(image, uv), gamma);
}
vec4 chromatic (sampler2D image, vec2 uv, vec2 direction) {
    vec4 col = vec4( 0.0 );
  vec2 off = vec2( 1.3333333333333333 ) * direction;
  col.a = 1.0;
  col.r = texture2D( image, uv ).r;
  col.g = texture2D( image, uv - ( off / resolution ) ).g;
  col.b = texture2D( image, uv - 2.0 * ( off / resolution ) ).b;
  return col;
}
vec3 linearToneMapping(vec3 color)
{
    float exposure = 1.;
  color = clamp(exposure * color, 0., 1.);
  color = pow(color, vec3(1. / gamma));
  return color;
}
vec3 simpleReinhardToneMapping(vec3 color)
{
    float exposure = 1.5;
  color *= exposure/(1. + color / exposure);
  color = pow(color, vec3(1. / gamma));
  return color;
}
vec3 lumaBasedReinhardToneMapping(vec3 color)
{
  float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
float toneMappedLuma = luma / (1. + luma);
color *= toneMappedLuma / luma;
color = pow(color, vec3(1. / gamma));
return color;
}
vec3 whitePreservingLumaBasedReinhardToneMapping(vec3 color)
{
  float white = 2.;
float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
float toneMappedLuma = luma * (1. + luma / (white*white)) / (1. + luma);
color *= toneMappedLuma / luma;
color = pow(color, vec3(1. / gamma));
return color;
}
vec3 RomBinDaHouseToneMapping(vec3 color)
{
      color = exp( -1.0 / ( 2.72*color + 0.15 ) );
color = pow(color, vec3(1. / gamma));
return color;
}
vec3 filmicToneMapping(vec3 color)
{
  color = max(vec3(0.), color - vec3(0.004));
color = (color * (6.2 * color + .5)) / (color * (6.2 * color + 1.7) + 0.06);
return color;
}
vec4 sharpen(in sampler2D tex, in vec2 coords, in vec2 renderSize) {
    float dx = 1.0 / renderSize.x;
  float dy = 1.0 / renderSize.y;
  vec4 sum = vec4(0.0);
  sum += -1. * texture2D(tex, coords + vec2( -1.0 * dx , 0.0 * dy));
  sum += -1. * texture2D(tex, coords + vec2( 0.0 * dx , -1.0 * dy));
  sum += 5. * texture2D(tex, coords + vec2( 0.0 * dx , 0.0 * dy));
  sum += -1. * texture2D(tex, coords + vec2( 0.0 * dx , 1.0 * dy));
  sum += -1. * texture2D(tex, coords + vec2( 1.0 * dx , 0.0 * dy));
  return sum;
}
void main2 () {
    gl_FragColor = texture2D(map, vUv);
}
void main () {
    vec2 nq = vUv / (20.0 / resolution.xy);
  float aspect = resolution.x / resolution.y;
  // if (aspect > 1.0) nq.x *= aspect;
  // else nq.y /= aspect;
  vec4 noise = texture2D(noiseMap, nq);
  vec2 q = vUv - 0.5;
  float d = length(q);
  float caVig = smoothstep(0.3, 0.75, d);
  vec2 direction = ( vUv - 0.5 ) * mix(0.5, 4.0, caVig) * noise.r * 1.0;
  // vec2 direction = ( vUv - 0.5 ) * caVig * noise.r * 4.0;
  // vec2 direction = ( vUv - 0.5 ) * 2.0 * noise.r;
  // vec3 colorTex = mix(
    //   chromatic(map, vUv, direction).rgb,
  //   sharpen(map, vUv, resolution).rgb,
  //   0.25
  // );
vec2 fragCoord = vUv * resolution;
// vec3 colorTex = mix(
    //   fxaa(map, fragCoord, resolution).rgb,
  //   sharpen(map, vUv, resolution).rgb,
  //   0.25
  // );
  // vec3 colorTex = fxaa(map, fragCoord, resolution).rgb;
  vec3 colorTex = clamp(chromatic(map, vUv, direction).rgb, 0.0, 1.0);
  // vec3 colorTex = texture2D(map, vUv).rgb;
  // vec3 colorTex = mix(
    //   chromatic(map, vUv, direction).rgb,
  //   fxaa(map, fragCoord, resolution).rgb,
  //   1.0-caVig
  // );
  // vec3 raw = colorTex;
  vec2 corner = vec2(1.0, 1.0);
  vec2 delta = vUv - corner;
  if (aspect < 1.0) delta.x *= aspect;
  else delta.y /= aspect;
  float gradDist = clamp(1.0 - length(delta), 0.0, 1.0);
  // colorTex.rgb += mix(rampColor0, rampColor1, vUv.y) * 0.1;
  // colorTex.rgb = blendSoftLight(colorTex, colorTex + mix(rampColor0, rampColor1, vUv.y), 0.25);
  // colorTex += gradDist * 0.1;
  // colorTex = blendOverlay(colorTex, colorTex + gradDist , 0.05);
  // colorTex += mix(rampColor0, rampColor1, vUv.y) * 0.05;
  // colorTex.rgb = blendSoftLight(colorTex, mix(rampColor0, rampColor1, vUv.y), 0.1);
  float vignetteStrength = 1.0;
  float vignetteDarken = 0.2;
  colorTex = blendSoftLight(colorTex, (noise.rgb*2.0-1.0), 0.05);
  // colorTex.rgb = colorLUT(colorTex.rgb, lutMap);
  colorTex = mix(colorTex, colorTex * smoothstep(1.0, 0.35, d), vignetteStrength * vignetteDarken);
  colorTex = blendOverlay(colorTex, colorTex * 1.0, smoothstep(0.3, 1.0, d) * vignetteStrength);
  colorTex = blendOverlay(colorTex, colorTex * 0.5, smoothstep(0.4, 0.9, d) * vignetteStrength);
  gl_FragColor = vec4(vec3(colorTex), 1.0);
  // color ramp
  // vec3 colorRamp = mix(rampColor0, rampColor1, linearGradient(
    //   vUv + noise.rg * 0.05,
  //   vec2(1.0, 0.0),
  //   vec2(0.0, 1.0)
  // ));
  // gl_FragColor.rgb = blendOverlay(gl_FragColor.rgb, colorRamp, rampStrength);
  gl_FragColor.rgb = colorLUT(gl_FragColor.rgb, lutMap);

  // float lightRamp = linearGradient(
    //   vUv + noise.ba * 0.05,
  //   vec2(0.0, 0.0),
  //   vec2(1.0, 1.0)
  // );
  // lightRamp = pow(lightRamp, 3.5);
  // float sa = sin(vUv.x * 10.0 + vUv.y * -5.0 + 0.5);
  // float sb = sin(vUv.x * 7.0 + vUv.y * -7.0 + time * 0.0);
  // float str = 1.0;//. mix(0.0, 1.0, sin(time * 0.25 + vUv.x * 3.5)*0.5+0.5);
  // float lightStr = lightRamp;
  // float lightStr = step(0.5, ((sa * sb) * 0.5 + 0.5));
  // lightRamp = smoothstep(0.5, 1.0, lightRamp);
  // gl_FragColor.rgb = blendSoftLight(gl_FragColor.rgb, vec3(1.5), rampStrength * lightStr);
  // gl_FragColor.rgb = blendSoftLight(gl_FragColor.rgb, vec3(1.0), rampStrength * lightStr * 0.1 * lightRamp);
  #ifdef HAS_FLOAT
  gl_FragColor.rgb += clamp(texture2D(glowMap, vUv).rgb, 0.0, 1.0);
  #endif
  // gl_FragColor.rgb += vec3(lightStr);
  gl_FragColor.rgb = clamp(gl_FragColor.rgb, 0.0, 1.0);
  gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(fadeToBlackColor), fadeToBlack);
  // gl_FragColor.rgb = texture2D(glowMap, vUv).rgb;
  // gl_FragColor.rgb += blur(vUv,10.0/resolution.x, 1.0);
}
//524b19
// 47411A";
