module.exports="#define GLSLIFY 1\nvarying vec2 vUv;\nvarying vec2 vTextureUv;\nvarying vec2 vSurfUv;\nvarying vec3 vWorldPosition;\n\nuniform sampler2D worldDataMap;\n\nuniform vec3 centroidPosition;\nuniform sampler2D waterDistortMap;\nuniform sampler2D waterNoiseMap;\nuniform sampler2D dataMapColor;\nuniform sampler2D dataMapLake;\nuniform sampler2D dataMapLakeBlur;\nuniform sampler2D groundMap;\nuniform vec3 colorA;\nuniform vec3 colorB;\nuniform float lakeSize;\nuniform float time;\nvarying float vAngle;\nvarying vec2 vDataUv;\nvarying vec2 vGroundUv;\n\n#define distortionScale 1.0\n#define waterScale 2.5\n\n// #define WATER 1\n\nvoid main2 () {\n  float lake = 1.0-texture2D(dataMapLake, vUv).r;\n  float lakeBlur = 1.0-texture2D(dataMapLakeBlur, vUv).r;\n  vec3 groundColor = texture2D(dataMapColor, vUv).rgb;\n  vec4 wakeData = texture2D(worldDataMap, vDataUv).rgba;\n\n  vec4 tex = texture2D(waterNoiseMap, vTextureUv * waterScale).rgba;\n\n  gl_FragColor = vec4(vec3(colorB.rgb), 1.0);\n}\n\nvoid main () {\n  // float lake = texture2D(dataMapLake, vUv).r;\n  float lake = 1.0-texture2D(dataMapLake, vUv).r;\n  float lakeBlur = 1.0-texture2D(dataMapLakeBlur, vUv).r;\n  // vec3 groundColor = texture2D(dataMapColor, vUv).rgb;\n  vec3 groundColor = texture2D(groundMap, vGroundUv).rgb;\n\n  vec4 wakeData = texture2D(worldDataMap, vDataUv).rgba;\n  // float foam = smoothstep(1.0, 0.85, lake);\n\n  // float ld = 0.2 + sin(time + vAngle) * 0.1;\n  // float foam = smoothstep(1.0, ld, lake);\n  // gl_FragColor = vec4(color + vec3(foam), 1.0);\n\n  float dst = smoothstep(0.0, 0.5, lake);\n  // float off = 0.0;\n  // // float off = sin(vAngle + time) * (1.0 / steps) * 0.1;\n  // dst = abs(fract((dst + 0.05 * time + off) * steps) - 0.5)*2.0;\n  // dst *= smoothstep(0.1, 0.75, lake);\n\n  vec2 uvDistort = vec2(0.0);\n\n  float wakeStrength = wakeData.r;\n\n  \n  #ifdef WATER\n  vec2 wakeDirection = wakeData.gb * 0.2 * wakeStrength;\n  uvDistort -= wakeDirection;\n  float timeOff = time;\n  #else\n  vec2 wakeDirection = vec2(0.0);\n  float timeOff = 0.0;\n  #endif\n\n  vec2 uvDistortOff = vec2(timeOff * 0.1, timeOff * -0.1);\n  vec2 distortion = texture2D(waterDistortMap, uvDistortOff + vTextureUv * distortionScale).rg * 2.0 - 1.0;\n  uvDistort += distortion.rg * 0.05;\n\n  vec4 waterColorMap = texture2D(waterNoiseMap, vTextureUv * waterScale + uvDistort);\n  float foam = waterColorMap.r;\n\n  float lakeCentroidDepth = distance(centroidPosition, vWorldPosition)/lakeSize;\n  lakeCentroidDepth = smoothstep(0.0, 1.0, lakeCentroidDepth);\n\n  float lakeBlurDepth = lakeBlur;\n  // float lakeBlurDepth = smoothstep(0.0, 1.0, lakeBlur);\n\n  float depth = smoothstep(0.0, 0.75, lake);\n  vec3 col = mix(colorA, colorB, lakeBlurDepth);\n\n  vec2 edgeOff2D = texture2D(waterDistortMap, vec2(0.0, 0.0) + vTextureUv * distortionScale + distortion.rg * 0.02 - wakeDirection).rg * 2.0 - 1.0;\n  float edgeOff = edgeOff2D.r;\n  float strongEdge = smoothstep(0.4, 0.55, lake + edgeOff2D.g * 0.05);\n\n  float ft0 = 0.4;\n  float ftf = 0.3;\n  // float edgeFalloff = 1.0 - smoothstep(0.8, 0.0, lake);\n  float edgeFalloff = smoothstep(ft0-ftf, ft0+ftf, lake + edgeOff2D.r * 0.05);\n\n  #ifdef WATER\n  col += foam * 0.1 * lakeBlurDepth + foam * 0.2 * wakeStrength;\n  col = mix(col, groundColor, edgeFalloff);\n  #else\n  col += foam * mix(0.0, 0.1, lakeBlurDepth) + foam * 0.2 * wakeStrength;\n  col = mix(col, groundColor, edgeFalloff);\n  #endif\n\n  col *= (1.0 - wakeStrength * 0.05);\n  // col = mix(col, groundColor, strongEdge);\n  // col = mix(col, col + 0.1, strongEdge);\n  \n\n  float steps = 4.0 + edgeOff2D.g * 0.2;\n  // float waves = sin(distortion.r * 0.25 + edgeOff2D. + timeOff * -0.05);\n  float worldOff = 0.0;\n  float waves = fract(edgeOff2D.r * 0.1 + edgeOff2D.g * 0.1 + timeOff * 0.1 + worldOff);\n  // waves -= sin(length(vUv - 0.5) * 10.0 + timeOff);\n  float movingDst = smoothstep(0.0, 0.7, lake + edgeOff2D.r * 0.05);\n  movingDst = smoothstep(0.5, 0.0, abs(fract((movingDst + waves) * steps) - 0.5) * 2.0);\n  movingDst *= depth;\n  // movingDst *= sin(length(vUv - 0.5) * 10.0 + timeOff);\n\n  // movingDst = mix(movingDst, 1.0, strongEdge);\n  // movingDst = mix(movingDst, 1.0, smoothstep(0.5, 0.55, lake + edgeOff2D.g * 0.05));\n\n  float et = 0.4;\n  float ef = 0.05;\n  float sharpFoam = smoothstep(et-ef,et+ef, movingDst + edgeOff2D.r * 0.6) * smoothstep(et-ef,et+ef, movingDst + edgeOff2D.g * 0.6);\n  sharpFoam = clamp(sharpFoam, 0.0, 1.0);\n  // sharpFoam *= smoothstep(-0.2, -0.0, edgeOff2D.r);\n  // sharpFoam *= smoothstep(-0.3, -0.2, edgeOff2D.g);\n\n  #ifdef WATER\n  float et0 = 0.4;\n  float ef0 = 0.05;\n  col = mix(col, vec3(col + 0.4 *(edgeOff2D.r*0.5+0.5)), (1.0-strongEdge) * sharpFoam);\n  #else\n  float et0 = 0.4;\n  float ef0 = 0.05;\n  col += 1.0 * mix(col, vec3(col + 0.4 *(edgeOff2D.r*0.5+0.5)), (1.0-strongEdge) * sharpFoam) * foam;\n  #endif\n  // col = mix(col, mix(col, vec3(0.8), smoothstep(et0+ef0, et0-ef0, lake)), sharpFoam);\n  \n  float strongEdge2 = smoothstep(0.4, 0.55, lake +edgeOff2D.r * 0.1);\n  // col = mix(col, groundColor, strongEdge2);\n  \n  // col += sharpFoam * 0.5 * (smoothstep(0.5, 0.3, lake));\n  // col += step(0.4, lake + edgeOff2D.r * 0.6) * step(0.4, lake + edgeOff2D.g * 0.6);\n  // col += smoothstep(et-ef, et+ef, edgeOff2D.g) * movingDst * depth;\n  // col = vec3(movingDst);\n  // col += step(0.6, lake + edgeOff);\n\n  // float edgeFoam01 = step(0.5, lake + distortion.r);\n  // float edgeFoam02 = step(0.5, lake + distortion.g);\n  // col += edgeFoam01 * edgeFoam02;\n\n  // col = vec3(smoothstep(0.0, 0.7, lake));\n  // col += smoothstep(0.1, 0.5, lake);\n\n  // col = vec3(lakeBlurDepth);\n\n   \n  #ifdef WATER\n  ft0 = 0.5;\n  ftf = 0.1;\n  float edgeAlpha = smoothstep(ft0+ftf, ft0-ftf, lake + edgeOff2D.r * 0.05);\n  gl_FragColor = vec4(mix(groundColor, col, edgeAlpha), 1.0);\n  #else\n  ftf = 0.4;\n  ft0 = 0.1;\n  float edgeAlpha = smoothstep(ftf+ft0, ftf-ft0, lake + (waterColorMap.g*2.0-1.0) * 0.25);\n  // gl_FragColor = vec4(vec3(step(0.25, lake)), 1.0);\n  gl_FragColor = vec4(col, edgeAlpha);\n  // gl_FragColor = vec4(mix(groundColor, col, edgeAlpha), 1.0);\n  #endif\n  \n  // gl_FragColor = vec4(vec3(col), edgeAlpha);\n  gl_FragColor = clamp(gl_FragColor.rgba, 0.0, 1.0);\n  // vec3 distortion = texture2D(mapWaterNormal, vTextureUv * distortionScale).rgb * 2.0 - 1.0;\n\n  // gl_FragColor = vec4(vec3(wakeData.r), 1.0);\n  // dst *= sin(vTextureUv.x * 4.0 + timeOff);\n\n  // gl_FragColor = vec4(vec3(distortion.r), 1.0);\n  // gl_FragColor = vec4(vec3(1.0-lake), 1.0);\n}";