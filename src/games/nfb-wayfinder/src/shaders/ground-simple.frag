  #define GLSLIFY 1

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
    float luma(vec3 color) {
        return dot(color, vec3(0.299, 0.587, 0.114));
    }
    float luma(vec4 color) {
        return dot(color.rgb, vec3(0.299, 0.587, 0.114));
    }
    varying vec2 vUv;
    varying vec2 vDataUv;
    varying vec2 vShadowUv;
    varying vec2 vTextureUv;
    varying vec3 vShadowClipPos;
    uniform sampler2D dataMapBiome;
    uniform sampler2D dataMapColor;
    uniform sampler2D dataMapLake;
    uniform float overlayOpacity;
    uniform float time;
    #ifdef USE_MAP_OVERRIDE
    uniform sampler2D overrideMap;
    #endif
    uniform sampler2D shadowMap;
    uniform mat4 worldFogProjection;
    uniform sampler2D worldFogMap;
    uniform vec3 clearColor;
    #ifdef USE_MAP_OVERRIDE
    uniform bool useOverrideMap;
    #endif
    uniform bool useOverrideColor;
    uniform vec3 overrideColor;
    uniform float solved;
    uniform vec3 originColor;
    uniform sampler2D worldDataMap;
    // uniform sampler2D map0;
    // uniform sampler2D map1;
    // uniform sampler2D map2;
    // uniform sampler2D map3;
    // uniform sampler2D mapPath;
    uniform sampler2D mapGround;
    uniform sampler2D mapGroundPath;
    uniform sampler2D mapOverlay;
    uniform float tutorial;
    // vec3 blend(vec4 texture1, float a1, vec4 texture2, float a2) {
      //     float depth = 0.2;
    //     float ma = max(texture1.a + a1, texture2.a + a2) - depth;
    //     float b1 = max(texture1.a + a1 - ma, 0);
    //     float b2 = max(texture2.a + a2 - ma, 0);
    //     return (texture1.rgb * b1 + texture2.rgb * b2) / (b1 + b2);
    // }
    vec3 blend(vec4 texture1, float a1, vec4 texture2, float a2) {
        return texture1.a > texture2.a ? texture1.rgb : texture2.rgb;
  }
    vec4 textureLuma(sampler2D tex, vec2 uv) {
        vec3 rgb = texture2D(tex, uv).rgb;
      float d = dot(rgb, vec3(0.299, 0.587, 0.114));
      return vec4(rgb, d);
  }
    // vec3 splat (float m, float e, float p, vec2 uv) {
      //   vec3 tex0 = texture2D(map0, uv).rgb;
    //   vec3 tex1 = texture2D(map1, uv).rgb;
    //   vec3 tex2 = texture2D(map2, uv).rgb;
    //   vec3 tex3 = texture2D(map3, uv).rgb;
    //   vec3 texPath = texture2D(mapPath, uv).rgb;
    //   //   mix(tex0, tex1, m),
    //   //   mix(tex2, tex3, e),
    //   //   p);
    //   // return tex;
    //   // vec3 tex;
    //   // if (m < 0.5 && e >= 0.5) {
      //   //   // dry, high
    //   //   tex = tex0;
    //   // } else if (m < 0.5 && e < 0.5) {
      //   //   // dry, low
    //   //   tex = tex1;
    //   // } else if (m >= 0.5 && e >= 0.5) {
      //   //   // wet, high
    //   //   tex = tex2;
    //   // } else {
      //   //   // wet, low
    //   //   tex = tex3;
    //   // }
    //   // return mix(tex, texPath, step(0.4, p));
    //   float w0 = 0.0;
    //   float w1 = 0.0;
    //   float w2 = 0.0;
    //   float w3 = 0.0;
    //   float feather = 0.1;
    //   float t = 0.5;
    //   w0 = smoothstep(t + feather, t - feather, m) * smoothstep(t - feather, t + feather, e);
    //   w1 = smoothstep(t + feather, t - feather, m) * smoothstep(t + feather, t - feather, e);
    //   w2 = smoothstep(t - feather, t + feather, m) * smoothstep(t - feather, t + feather, e);
    //   w3 = smoothstep(t - feather, t + feather, m) * smoothstep(t + feather, t - feather, e);
    //   vec3 tex = vec3(0.0);
    //   // tex = tex0 * w0;
    //   tex += tex0 * w0 + tex1 * w1;
    //   tex += tex2 * w2 + tex3 * w3;
    //   float pt = 0.35;
    //   float pf = 0.5;
    //   return mix(tex * 0.5, tex, smoothstep(pt - pf, pt + pf, p));
    //   // return mix(mix(tex, texPath.r * tex, 0.15), tex, smoothstep(pt - pf, pt + pf, p));
    //   // return mix(tex, texPath.rgb, smoothstep(pt - pf, pt + pf, p));
    // }
    // void main () {
      //   vec3 dataColor = texture2D(worldDataMap, vDataUv).rgb;
    //   vec3 biome = texture2D(dataMapBiome, vUv).rgb;
    //   vec3 worldColor = texture2D(dataMapColor, vUv).rgb;
    //   if (useOverrideColor) {
      //     worldColor = overrideColor;
    //   }
    //   vec3 overlay = texture2D(mapOverlay, vTextureUv).rgb;
    //   vec3 groundTex = texture2D(mapGround, vTextureUv).rgb;
    //   vec3 pathTex = texture2D(mapGroundPath, vTextureUv * 2.0).rgb;
    //   gl_FragColor.rgb = vec3(worldColor);
    //   vec3 worldFogColor = texture2D(worldFogMap, vUv).rgb;
    //   gl_FragColor.rgb *= worldFogColor;
    //   gl_FragColor.a = 1.0;
    // }
    float sdBox( in vec2 p, in vec2 b )
    {
          vec2 d = abs(p)-b;
        return length(max(d,0.0)) + min(max(d.x,d.y),0.0);
  }
    void main2 () {
        vec3 dataColor = texture2D(worldDataMap, vDataUv).rgb;
      vec3 biome = texture2D(dataMapBiome, vUv).rgb;
      vec3 worldColor = texture2D(dataMapColor, vUv).rgb;
      gl_FragColor.rgb = worldColor;
      gl_FragColor.a = 1.0;
  }
    void main () {
        vec3 dataColor = texture2D(worldDataMap, vDataUv).rgb;
      vec3 biome = texture2D(dataMapBiome, vUv).rgb;
      vec3 worldColor = texture2D(dataMapColor, vUv).rgb;
      vec3 oWorldColor = worldColor;
      if (useOverrideColor) {
          worldColor = overrideColor;
    }
      vec3 overlay = texture2D(mapOverlay, vTextureUv).rgb;
      vec3 groundTex = texture2D(mapGround, vTextureUv).rgb;
      vec3 pathTex = texture2D(mapGroundPath, vTextureUv * 2.0).rgb;
      float wdist = 0.04;
      float wd = distance(vUv, vec2(0.5, 0.5)) / wdist;
      float wt = 0.5 + ((groundTex.x*2.0-1.0) * 0.5) + ((pathTex.x*2.0-1.0) * 0.5);
      float wg = 0.45;
      wd = smoothstep(wt - wg, wt + wg, wd);
      float distFromCenter = 1.0 - clamp(wd, 0.0, 1.0);
      // worldColor = mix(worldColor, vec3(0.45), distFromCenter);
      worldColor = mix(mix(worldColor, vec3(originColor), tutorial), vec3(originColor), distFromCenter);
      // worldColor = mix(worldColor, vec3(originColor), distFromCenter);

      // float boxLen = abs(vUv.x - 0.5) + abs(vUv.y - 0.5);
      float edgeThreshold = 0.5;
      float edgeGlow = 0.025;
      // worldColor = vec3(boxLen);
      // worldColor *= step(boxLen, 0.48);
      float edge0 = smoothstep(edgeThreshold, edgeThreshold-edgeGlow, abs(vUv.x - 0.5));
      float edge1 = smoothstep(edgeThreshold, edgeThreshold-edgeGlow, abs(vUv.y - 0.5));
      // worldColor = originColor;
      // worldColor = mix(originColor, worldColor, distFromCenter);
      // vec3 worldFogColor = texture2D(worldFogMap, vUv).rgb;
      // worldColor.rgb *= mix(1.0, 0.0, (1.0-distFromCenter) * (1.0-worldFogColor.r));
      float lake = texture2D(dataMapLake, vUv).r;
      float pathEdge = smoothstep(0.4, 0.75, biome.b + (biome.r * 2.0 - 1.0) * 0.1);
      pathEdge = clamp(pathEdge, 0.0, 1.0);
      vec3 tex = mix(groundTex, pathTex, pathEdge);
      vec3 col = worldColor;
      // #ifdef USE_MAP_OVERRIDE
      // vec3 overrideRGB = texture2D(overrideMap, vTextureUv).rgb;
      // if (useOverrideMap) {
        //   col *= overrideRGB;
      // } else {
          float darken = 0.45; //0.66;
        col = blendSoftLight(col, col + overlay, overlayOpacity * 0.3 * biome.b * (1.0 - darken * dataColor.r));
        col = mix(col, col * (1.0 - overlay), 0.075 * (biome.b));
        //blendSoftLight(col, col + overlay, overlayOpacity * biome.b * (1.0 - darken * dataColor.r));
        col = blendSoftLight(col, tex, 1.0 - darken * dataColor.r);
        // col = blendSoftLight(col, col + overlay, overlayOpacity * biome.b * 0.075);
        // col = blendSoftLight(col, tex, 1.0);
      // }
      // col = vec3(gl_FragCoord.x / 800.0);
      // vec2 shadowUv = (vShadowClipPos.xy / vShadowClipPos.z) * 0.5 + 0.5;
      // col *= 1.0 - 0.25 * texture2D(shadowMap, shadowUv).r;

      // col = texture2D(mapGround, vShadowUv).rgb;
      // float pt = 0.4;
      // float pf = 0.4;
      // float pathEdge = smoothstep(pt-pf, pt+pf, biome.b  );
      // col = mix(col * 0.75, col * 1.0, pathEdge);
      // col = vec3(pathEdge);
      gl_FragColor = vec4(vec3(col), 1.0);
      gl_FragColor = clamp(gl_FragColor, 0.0, 1.0);
      gl_FragColor.rgb = mix(clearColor, gl_FragColor.rgb, edge0 * edge1);
      // gl_FragColor.rgb = vec3(edge0);
      // gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(1.0), lake);
  }
