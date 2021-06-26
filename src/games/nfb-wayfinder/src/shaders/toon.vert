#define GLSLIFY 1
#ifdef HAS_INTENSITY
attribute float intensity;
varying float vIntensity;
#endif
#ifdef HAS_VERTEX_COLORS
attribute vec3 vertexColor;
varying vec3 vVertexColor;
#endif
varying vec2 vGroundUv;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec3 vPosition;
varying vec3 vWorldPosition;
varying vec2 vBillboardUV;
uniform vec3 minBounds;
uniform mat4 groundProjectionMatrix;
uniform vec3 maxBounds;
uniform vec2 resolution;
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
// modified from http://graphics.cs.williams.edu/papers/HashedAlphaI3D17/
// fixed4 tex2DConstScale(sampler2D tex, float texSize, float2 uv)
// {
  //   // Find the discretized derivatives of our coordinates
//   float maxDeriv = max( length(ddx(uv)), length(ddy(uv)) );
//   float pixScale = 1.0 / (texSize * maxDeriv);
//   // Find two nearest log-discretized noise scales
//   float2 pixScales = float2(
  //       exp2(floor(log2(pixScale))),
//       exp2( ceil(log2(pixScale)))
//       );
//   // Factor to interpolate lerp with
//   float lerpFactor = frac( log2(pixScale) );
//   return lerp(
  //       tex2D(tex, pixScales.x * uv),
//       tex2D(tex, pixScales.y * uv),
//       lerpFactor
//       );
// }
//
vec2 getScreenUV (vec2 clipPos, float uvScale) {
    // vec3 boxCenter = (minBounds + maxBounds) * 0.5;
  // vec4 SSobjectPosition = projectionMatrix * viewMatrix * vec4(boxCenter, 1.0);
  vec4 SSobjectPosition = projectionMatrix * modelViewMatrix * vec4(vec3(0.0), 1.0);
  vec2 screenUV = vec2(clipPos.xy);
  float screenRatio = resolution.y/resolution.x;
  screenUV.x -= SSobjectPosition.x/(SSobjectPosition.w);
  screenUV.y -= SSobjectPosition.y/(SSobjectPosition.w);
  screenUV.y *= screenRatio;
  screenUV *= 1.0/uvScale;
  screenUV *= SSobjectPosition.z; // or z
  return screenUV;
}
void main () {
    vUv = uv;
  vec3 objectNormal = normal;
  vec3 transformedNormal = objectNormal;
  transformedNormal = normalMatrix * transformedNormal;
  transformedNormal = normalize(transformedNormal);
  vNormal = transformedNormal;
  vec3 transformed = position.xyz;
  // transformed += normal.xyz * 0.1;
  vPosition = transformed.xyz;
  vec4 worldPos = modelMatrix * vec4(transformed, 1.0);
  vec4 mvPosition = viewMatrix * worldPos;
  gl_Position = projectionMatrix * mvPosition;

  vViewPosition = -mvPosition.xyz;
  vWorldPosition = worldPos.xyz;
  #ifdef HAS_INTENSITY
  vIntensity = intensity;
  #endif
  #ifdef HAS_VERTEX_COLORS
  vVertexColor = vertexColor;
  #endif
  vec3 gPos = worldPos.xyz;
  gPos.y *= 0.0;
  vec4 baseClipPos = groundProjectionMatrix * viewMatrix * vec4(gPos, 1.0);
  vGroundUv = baseClipPos.xy / baseClipPos.w * 0.5 + 0.5;
  // vec3 bpoint = range()
  // vec4 vpos = projectionMatrix * modelMatrix * vec4(transformed.xyz, 1.0);
  // vec3 boxCenter = (minBounds + maxBounds) * 0.5;
  // vec3 centerWorldPos = (modelMatrix * vec4(boxCenter, 1.0)).xyz;
  // vec3 npos = transformed.xyz;
  // vec4 clipCur = projectionMatrix * modelMatrix * vec4(npos, 1.0);
  // vec4 clipCur = projectionMatrix * modelMatrix * vec4(position.xyz, 1.0);
  // vec4 clipMin = projectionMatrix * modelViewMatrix * vec4(minBounds.xyz, 1.0);
  // vec4 clipMax = projectionMatrix * modelViewMatrix * vec4(maxBounds.xyz, 1.0);
  // vec4 clipCenter = (projectionMatrix * viewMatrix * vec4(centerWorldPos, 1.0));
  // clipCur.xy -= clipCenter.xy / clipCenter.w;
  // vec2 clipCur2D = clipCur.xy / clipCur.w * 0.5 + 0.5;
  // clipCur2D.xy -= clipCenter.xy / clipCenter.w * 0.5 + 0.5;
  // vec2 clipMin2D = clipMin.xy / clipMin.w;
  // vec2 clipMax2D = clipMax.xy / clipMax.w;
  // vBillboardUV = getScreenUV(gl_Position.xy / gl_Position.w, 40.0);
  // vBillboardUV = mix(clipMin2D, clipMax2D, range(minBounds, maxBounds, position.xyz));
  // vec3 bWorldPos = worldPos.xyz + boxCenter.xyz;
  // vec4 bClipPos = projectionMatrix * viewMatrix * vec4(bWorldPos, 1.0);
  // vBillboardUV = bClipPos.xy / bClipPos.w * 0.5 + 0.5;

  // vec3 camRightWorld = vec3(viewMatrix[0].x, viewMatrix[1].x, viewMatrix[2].x);
  // vec3 camUpWorld = vec3(viewMatrix[0].y, viewMatrix[1].y, viewMatrix[2].y);

  // float billboardSize = 1.0 * globalSpriteScale * absScale;
  // vec3 vertexWorldPos = boxCenter
  //   + camRightWorld * position.x * billboardSize
  //   + camUpWorld * position.y * billboardSize;
}
