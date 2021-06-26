#define GLSLIFY 1
attribute vec2 offset;
attribute float scale;
attribute vec4 spriteCoords;
attribute float spriteAspect;
uniform bool useSpriteAtlas;
uniform float spriteMapAspect;
uniform sampler2D groundMap;
uniform sampler2D worldDataMap;
uniform sampler2D waterMap;
// uniform sampler2D worldGrassMap;
uniform bool worldDataMapEnabled;
uniform float time;
uniform float globalSpriteScale;
uniform vec2 spriteTextureAtlasSize;
uniform vec2 spriteTextureSize;
uniform float spriteTextureAtlasColumns;
uniform mat4 groundProjectionMatrix;
uniform vec2 worldMapSize;
uniform vec3 userTargetWorldPosition;
uniform mat4 worldDataProjection;
uniform mat4 worldDataView;
varying float vDataScale;
varying vec2 vDataUv;
varying vec3 vGroundColor;
// varying float vSpriteIndex;
varying vec2 vUv;
varying vec2 vScreenUv;
varying vec2 vGroundUv;
varying vec2 vWorldUv;
varying vec2 vOriginalUv;
varying float vHighlight;
varying float gradientY;
varying vec3 vGrassColor;
// #pragma glslify: noise = require('glsl-noise/simplex/3d')
#define TRUE_FIXED_BLEND
//returns -1.0 if x < 0, and 1.0 if x >= 0
float sign01 (float x) {
    return x < 0.0 ? -1.0 : 1.0;
  // return step(0.0, x) * 2.0 - 1.0;
}
float hash(vec2 p)  // replace this by something better
{
    p  = 50.0*fract( p*0.3183099 + vec2(0.71,0.113));
  return -1.0+2.0*fract( p.x*p.y*(p.x+p.y) );
}
float fastnoise( in vec2 p )
{
    vec2 i = floor( p );
  vec2 f = fract( p );
  vec2 u = f*f*(3.0-2.0*f);
  return mix( mix( hash( i + vec2(0.0,0.0) ),
                   hash( i + vec2(1.0,0.0) ), u.x),
              mix( hash( i + vec2(0.0,1.0) ),
                   hash( i + vec2(1.0,1.0) ), u.x), u.y);
}
float smoothCurve(float x)
{
  return x * x * (3.0 - 2.0 * x);
}
float triangleWave(float x)
{
  return abs(fract(x + 0.5) * 2.0 - 1.0);
}
float smoothTriangleWave(float x)
{
    // return sin(x);
return smoothCurve(triangleWave(x)) * 2.0 - 1.0;
}
vec2 range(vec2 vmin, vec2 vmax, vec2 value) {
    return (value - vmin) / (vmax - vmin);
}
float manhattanDistance(vec2 p1, vec2 p2) {
    float d1 = abs(p1.x - p2.x);
  float d2 = abs(p1.y - p2.y);
  return d1 + d2;
}
float insideBox(vec2 v, vec2 bottomLeft, vec2 topRight) {
    vec2 s = step(bottomLeft, v) - step(topRight, v);
  return s.x * s.y;
}
vec3 opCheapBend( vec3 p, float angle )
{
      float c = cos(angle*p.y);
    float s = sin(angle*p.y);
    mat2  m = mat2(c,-s,s,c);
    return vec3(m*p.xy,p.z);
}
mat3 rotationMatrix(vec3 axis, float angle)
{
      axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;

    return mat3(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,
                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,
                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c);
}
mat3 rotation3dY(float angle) {
    float s = sin(angle);
  float c = cos(angle);
  return mat3(
      c, 0.0, -s,
    0.0, 1.0, 0.0,
    s, 0.0, c
  );
}
mat3 rotation3dX(float angle) {
  float s = sin(angle);
float c = cos(angle);
return mat3(
  1.0, 0.0, 0.0,
0.0, c, s,
0.0, -s, c
);
}
mat3 rotation3dZ(float angle) {
  float s = sin(angle);
float c = cos(angle);
return mat3(
  c, s, 0.0,
-s, c, 0.0,
0.0, 0.0, 1.0
);
}
void main() {
    float absScale = abs(scale);
  vec3 offsetPos = vec3(offset.x, 0.0, offset.y);
  vec2 spriteRepeat = useSpriteAtlas ? spriteCoords.xy : vec2(1.0);
  vec2 spriteOffset = useSpriteAtlas ? spriteCoords.zw : vec2(0.0);
  vec2 spriteCoord = uv;
  if (scale < 0.0) spriteCoord.x = (1.0 - spriteCoord.x);
  spriteCoord *= spriteRepeat;
  spriteCoord += spriteOffset;
  vOriginalUv = uv;
  // if (scale < 0.0) spriteCoord.x = 1.0 - spriteCoord.x;
  // spriteCoord.x += spriteIndex;
  // spriteCoord.x *= 1.0 / spriteTextureAtlasColumns;
  // if (spriteIndex < 1.5) gradientY += 0.15;
  vec3 centerWorldPos = (modelMatrix * vec4(offsetPos, 1.0)).xyz;
  vec3 camRightWorld = vec3(viewMatrix[0].x, viewMatrix[1].x, viewMatrix[2].x);
  vec3 camUpWorld = vec3(viewMatrix[0].y, viewMatrix[1].y, viewMatrix[2].y);
  vWorldUv = range(
      -vec2(worldMapSize / 2.0),
    vec2(worldMapSize / 2.0),
    centerWorldPos.xz
  );
  vWorldUv.y = 1.0 - vWorldUv.y;
  // float wdist = 0.1;
  // float wd = distance(vWorldUv, vec2(0.5)) / wdist;
  // float wt = 0.4;
  // float wg = 0.1;
  // wd = smoothstep(wt - wg, wt + wg, wd);
  // float distFromCenter = clamp(wd, 0.0, 1.0);
  // absScale *= distFromCenter;
  float water = texture2D(waterMap, vWorldUv).r;
  absScale *= 1.0 - water;
  float wdist = 0.04;
  float wd = distance(vWorldUv, vec2(0.5, 0.5)) / wdist;
  float wt = 0.5;
  float wg = 0.45;
  wd = smoothstep(wt - wg, wt + wg, wd);
  float distFromCenter = clamp(wd, 0.0, 1.0);
  absScale *= distFromCenter;
  // camRightWorld *= rotation3dZ(sin(time) * position.y);

  // vec2 centerWorldUv = range(
    //   -vec2(worldMapSize / 2.0),
  //   vec2(worldMapSize / 2.0),
  //   centerWorldPos.xz
  // );
  // centerWorldUv.y = 1.0 - centerWorldUv.y;
  // vec2 envPosInWorldPos = (centerWorldUv * 2.0 - 1.0) * worldMapSize / 2.0;
  vec4 vDataUvPos4 = worldDataProjection * worldDataView * vec4(centerWorldPos.xz, 0.0, 1.0);
  vec2 vDataScreen = vDataUvPos4.xy / vDataUvPos4.w;
  vDataUv = vDataScreen.xy * 0.5 + 0.5;
  // vec3
  // vec4 centerClipPos = projectionMatrix * viewMatrix * vec4(centerWorldPos, 1.0);
  // vec2 center2D = centerClipPos.xy / centerClipPos.w;
  // float distanceScale = manhattanDistance(center2D.xy, vec2(0.0));
  // vec4 dataColor = texture2D(worldDataMap, centerWorldUv);
  vec3 dCol = texture2D(worldDataMap, vDataUv).rgb;
  // float dirAngle = (dCol.g * 2.0 - 1.0) * 3.14;
  vec2 curDirection2D = vec2(dCol.gb) * 2.0 - 1.0;
  vec3 curDirection = vec3(curDirection2D.x, 0.0, curDirection2D.y);

  float dScale = dCol.r;
  // float dScale = 0.0;
  float dataScale = 1.0 + dScale * 0.0;
  vDataScale = dScale;
  // float dataScale = 1.0; // green is leaf growth
  float dataMove = 1.0;

  vec3 grassColor = vec3(1.0);
  vGrassColor = grassColor;
  // dataScale = smoothstep(1.75, 1.25, dataScale);
  // float worldRadius = 30.0;
  // float dataScale = 1.0 - clamp(distance(centerWorldPos, userTargetWorldPosition) / worldRadius, 0.0, 1.0);
  // dataScale = smoothstep(0.0, 0.5, dataScale);
  // vec3 modifiedCamUpWorld = normalize(camUpWorld + curDirection * 0.25);
  // float aspect = 418.0/419.0;
  // float aspect = spriteRepeat.x / spriteRepeat.y;
  float aspect = useSpriteAtlas ? spriteAspect : spriteMapAspect;
  float billboardSize01 = globalSpriteScale * absScale;
  float billboardSize = dataScale * billboardSize01;
  vec3 vertexStraightWorldPos = (centerWorldPos)
    + camRightWorld * position.x * billboardSize * aspect
    + camUpWorld * position.y * billboardSize;
  float moveGradientY = clamp(vertexStraightWorldPos.y / 0.5, 0.0, 1.0);
  gradientY = pow(clamp(vertexStraightWorldPos.y / 1.0, 0.0, 1.0), 1.25);
  float scaleTime = time * 0.1;
  // float noiseValue = (
    //   smoothTriangleWave(scaleTime + centerWorldPos.x * 0.05 + centerWorldPos.z * -0.01) * 0.5 +
  //   smoothTriangleWave(scaleTime + centerWorldPos.z * 0.05) * 0.25 +
  //   sin(scaleTime + centerWorldPos.y * 0.1) * 0.25
  // );
  float noiseValue = 0.0;
  noiseValue += cos(time * 2.0 + centerWorldPos.x * 0.5) * 0.33;
  noiseValue += sin(time + centerWorldPos.z * 0.25) * 0.33;
  noiseValue += sin(time + centerWorldPos.x * 0.25) * 0.33;
  noiseValue = clamp(noiseValue, -1.0, 1.0);
  float invDScale = 1.0;
  camUpWorld *= rotation3dZ(noiseValue * 3.14 * 0.25 * moveGradientY * invDScale);
  vec3 vertexWorldPos = (centerWorldPos)
    + camRightWorld * position.x * billboardSize * aspect
    + camUpWorld * position.y * billboardSize;

  // vec3 axisDirection =

  // noiseValue += sin(time * 0.75 + centerWorldPos.x * 0.2) * 0.25;
  // noiseValue += sin(time * 0.75 + centerWorldPos.z * 0.2) * 0.25;
  // noiseValue += sin(time * 0.85 + centerWorldPos.z * 0.2) * 0.25;
  // noiseValue += cos(time * 0.25 + centerWorldPos.x * 0.1) * 0.25;
  // noiseValue = smoothstep(0.2, 0.8, noiseValue * 0.5 + 0.5) * 2.0 - 1.0;
  float skewValue = gradientY * noiseValue;
  float skewScaled = skewValue * 0.25* invDScale;

  // vertexWorldPos *= rotationMatrix(vec3(0.0, 1.0, 0.0), sin(time) * 2.0);
  vertexWorldPos += camRightWorld * skewScaled;
  vertexWorldPos.xyz += curDirection * 0.1 * dScale;
  vertexWorldPos.xyz += curDirection * gradientY * 0.66 * dScale;
  // vertexWorldPos += dScale * moveGradientY * camRightWorld * curDirection.xyz * 1.0;
  // vertexWorldPos += dScale * moveGradientY * camRightWorld * curDirection.xyz * 0.5;
  vec3 vertexWorldBasePos = (centerWorldPos)
    + camRightWorld * position.x * billboardSize * aspect
    + camUpWorld * position.y * billboardSize;

  // vec3 vertexWorldBasePos = centerWorldPos;

  vec4 baseClipPos = groundProjectionMatrix * viewMatrix * vec4(vertexWorldBasePos, 1.0);
  vec4 clipPos = projectionMatrix * viewMatrix * vec4(vertexWorldPos, 1.0);
  vGroundUv = baseClipPos.xy / baseClipPos.w * 0.5 + 0.5;
  // vGroundUv = clamp(vGroundUv, 0.0, 1.0);
  vGroundColor = texture2D(groundMap, vGroundUv).rgb;
  // vGroundUv = baseClipPos.xy / baseClipPos.w * 0.5 + 0.5;
  // vGroundUv = floor(vGroundUv / 0.05) * 0.05;

  // if (absScale > 2.35) vGroundColor = vec3(1.0,0.0,0.0);
  vUv = spriteCoord;
  // if (scale < 0.0) vUv.x = 1.0 - vUv.x;
  gl_Position = clipPos;
  // vec4 mvPosition = modelViewMatrix * vec4(offsetPos, 1.0);
  // vec2 mvScale;
  // mvScale.x = length(modelMatrix[0].xyz);
  // mvScale.y = length(modelMatrix[1].xyz);
  // mvScale *= globalSpriteScale * absScale;
  // vec2 mvOffset = mvScale * position.xy;
  // vec3 worldPos = centerWorldPos;
  // worldPos.xy += mvOffset;
  // vec4 groundPoint = mvPosition;
  // mvPosition.xy += mvOffset;
  // mvPosition.x -= skewScaled * mvScale.x;
  // #if defined(TRUE_BLEND)
  // groundPoint.x += mvScale.x * position.x - skewScaled * mvScale.x;
  // #elif defined(TRUE_FIXED_BLEND)
  // groundPoint.x += mvScale.x * position.x;
  // #endif
  // vec4 screenPointSolid = groundProjectionMatrix * groundPoint;
  // vGroundUv = screenPointSolid.xy / screenPointSolid.w * 0.5 + 0.5;
  // gl_Position = projectionMatrix * mvPosition;

  // vec3 worldPos =
  // const x = (u * environment.size) / 2;
  // const z = (v * environment.size) / 2;
  // vWorldUv =
  // inverseLerp(-environment.size / 2, environment.size / 2, position.x) *
  //         2 -
  //       1;

  // vSpriteIndex = spriteIndex;
  vHighlight = noiseValue * 0.5 + 0.5;
  vScreenUv = gl_Position.xy / gl_Position.w * 0.5 + 0.5;
}
