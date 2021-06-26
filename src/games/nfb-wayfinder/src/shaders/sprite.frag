#define GLSLIFY 1
varying vec2 originalUv;
varying vec2 vUv;
varying float vYGradient;
varying vec2 vGroundUv;
uniform sampler2D map;
uniform sampler2D noiseMap;
uniform float time;
uniform bool useMapDiscard;
varying vec3 vObjectCoord;
varying vec2 vScreenScale;
uniform vec3 color;
uniform float aspect;
uniform float spriteHeight;
varying vec3 vWorldPosition;
varying vec3 vGroundColor;
varying float vDataScale;
varying vec3 vBaseWorldPosition;
varying vec3 vCenterWorldPos;
uniform sampler2D groundMap;
uniform bool silhouette;
uniform vec3 tintColor;
uniform vec3 shadowColor;
// varying float vSpin;
// void main () {
  //   gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
//   gl_FragColor += texture2D(map, vUv);
// }
void main () {
    gl_FragColor = texture2D(map, vUv);
  gl_FragColor.rgb *= tintColor;
  // gl_FragColor.a = 1.0;
  float alphaMap = gl_FragColor.a;
  if (alphaMap < 0.5) discard;
  if (silhouette) {
      // float vYGrad0 = 1.0 - pow(clamp(vYGradient / 1.0, 0.0, 1.0), 1.0);
    // gl_FragColor.a *= 1.0 - clamp(distance(vCenterWorldPos, vWorldPosition) / 1.0, 0.0, 0.5);

    float falloff = 1.0 - clamp(pow(vWorldPosition.y / 1.0, 1.0), 0.0, 1.0);
    // float falloff = 1.0 - clamp(pow(distance(vCenterWorldPos, vWorldPosition) / 2.75, 1.0), 0.0, 1.0);
    float shadowOpacity = 0.25;
    gl_FragColor.rgb = mix(vec3(1.0), shadowColor, alphaMap * falloff * shadowOpacity);
    gl_FragColor.a = 1.0;
    // gl_FragColor.rgb = vec3(shadowColor);
    // gl_FragColor.a *= ;
    // gl_FragColor.rgb *= gl_FragColor.a;
    // gl_FragColor.a = 1.0;
    // gl_FragColor.a *= vUv.y;
  }
  // else {
      // vec3 fogColor = texture2D(groundMap, vGroundUv).rgb;
    // vec3 fogColor = vGroundColor;
    // gl_FragColor.rgb *= color;
    // gl_FragColor.rgb = mix(gl_FragColor.rgb, fogColor, 0.2);
    // gl_FragColor.rgb = gl_FragColor.rgb + fogColor * 0.1;
    // gl_FragColor.rgb = mix(gl_FragColor.rgb, gl_FragColor.rgb + fogColor, 0.2);
    // float vFog0 = 1.0 - pow(clamp(vWorldPosition.y / 0.5, 0.0, 1.0), 0.25);
    // float yoff = sin(time + fract(vCenterWorldPos.x * 100.0 + vCenterWorldPos.z * 100.0));
    // float ypos = max(0.0, vWorldPosition.y + yoff * 0.0);
    // float vFog1 = 1.0 - pow(clamp(ypos / 4.0, 0.0, 1.0), 0.5);
    // gl_FragColor.rgb = mix(gl_FragColor.rgb, fogColor, vFog0);
    // float vStr = 0.33;
    // gl_FragColor.rgb = mix(gl_FragColor.rgb, fogColor + 0.1, vFog1 * vStr);
  // }
  // TODO: Screen door
  // Will have to be done with another render target perhaps? render character
  // and other key features (tokens) to it as black/white mask, then texture fetch
  // the mask in this shader to see if we need to do transparency or not
  // screenDoor(0.65);
}
