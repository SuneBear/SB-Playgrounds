import {
  TextureLoader,
  ShaderMaterial,
  LinearFilter,
  Vector2,
  DoubleSide,
} from "three";

function NOOP() {}

const vs = `
#include <common>
varying vec2 vUv;
uniform bool uLeft;
uniform float uRotation;

void main() {


  // vec3 centerWorldPos = (modelMatrix * vec4(vec3(0.0), 1.0)).xyz;
  // vec3 camRightWorld = vec3(viewMatrix[0].x, viewMatrix[1].x, viewMatrix[2].x);
  // vec3 camUpWorld = vec3(viewMatrix[0].y, viewMatrix[1].y, viewMatrix[2].y);

  // vec2 scale;
  // scale.x = length( vec3( modelMatrix[ 0 ].x, modelMatrix[ 0 ].y, modelMatrix[ 0 ].z ) );
  // scale.y = length( vec3( modelMatrix[ 1 ].x, modelMatrix[ 1 ].y, modelMatrix[ 1 ].z ) );
  
  // vec3 vertexWorldPos = centerWorldPos
  //   + camRightWorld * position.x * scale.x
  //   + camUpWorld * position.y * scale.y;

  vec2 center = vec2(0.5);
  vec4 mvPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );

	vec2 scale;
	scale.x = length( vec3( modelMatrix[ 0 ].x, modelMatrix[ 0 ].y, modelMatrix[ 0 ].z ) );
	scale.y = length( vec3( modelMatrix[ 1 ].x, modelMatrix[ 1 ].y, modelMatrix[ 1 ].z ) );
  if (uLeft) scale.x *= -1.0;

  vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;

  vec2 rotatedPosition;
  float rot = uRotation * (uLeft ? -1.0 : 1.0);
  rotatedPosition.x = cos( rot ) * alignedPosition.x - sin( rot ) * alignedPosition.y;
  rotatedPosition.y = sin( rot ) * alignedPosition.x + cos( rot ) * alignedPosition.y;

  mvPosition.xy += rotatedPosition;

  gl_Position = projectionMatrix * mvPosition;
  vUv = uv;
  // if (uLeft) vUv.x = 1.0 - vUv.x;
}
`;

const fs = `
uniform sampler2D tSprite;

uniform vec2 uSize;
uniform vec2 uOffset;

varying vec2 vUv;

void main() {

  // get single sprite UV
  vec2 newUV = vUv * uSize;
  newUV += uOffset;
  newUV.y -= uSize.y;

  vec4 spriteColor = texture2D(tSprite, newUV);

  if ( spriteColor.a < 0.5 ) discard;

  gl_FragColor = vec4(spriteColor.rgb, spriteColor.a);
}
`;

const texLoader = new TextureLoader();

class SpriteAnimation {
  /**
   * @param {JSON} data - data from texture packer
   * @param {String} spriteURL - spritesheet url
   * @param {Object} opts
   *   @param {Number} framerate
   *   @param {Boolean} loop
   *   @param {Array} skipFrames
   */
  constructor(data, spriteURL, opts) {
    this.data = data;
    this.spriteURL = spriteURL;

    this.texture = null;

    this.isLoaded = false;

    this.isPlaying = true;

    this.elapsed = 0;
    this.framerate = (opts && opts.framerate) || 1 / 12;
    this.loop = (opts && opts.loop) || true;
    this.skipFrames = (opts && opts.skipFrames) || [];
    this.currentFrame = 0;
    this.currentFrameData = this.data.frames[0];

    this.material = null;

    window.addEventListener("keyup", () => {
      // this.update(0.16);
      // console.log(this.currentFrame)
    });
  }

  async load() {
    return new Promise((resolve, reject) => {
      texLoader.load(
        // url
        this.spriteURL,
        // success
        (texture) => {
          this.texture = texture;
          this.onLoaded();
          resolve();
        },
        // progress
        NOOP,
        // error
        (evt) => {
          reject(evt);
        }
      );
    });
  }

  onLoaded() {
    this.isLoaded = true;
    this.material = this.makeMaterial();
  }

  play() {
    this.isPlaying = true;
  }

  pause() {
    this.isPlaying = false;
  }

  stop() {
    this.pause();
    this.currentFrame = 0;
  }

  gotoFrame(frame) {
    this.currentFrame = frame;
  }

  update(dt) {
    // if (!this.isLoaded || !this.isPlaying) return
    if (!this.isPlaying) return;

    let hasUpdated = false;

    this.elapsed += dt;

    const totalFrames = this.data.frames.length;
    const endFrame = this.loop && this.loopEnd ? this.loopEnd : totalFrames - 1;

    if (this.elapsed >= this.framerate) {
      this.elapsed = 0;
      this.currentFrame++;
      hasUpdated = true;
      if (this.isFrameValid(this.currentFrame))
        this.currentFrameData = this.data.frames[this.currentFrame];
    }

    if (this.currentFrame >= endFrame && this.loop) {
      this.currentFrame = this.loopStart ? this.loopStart : 0;
      this.currentFrameData = this.data.frames[this.currentFrame];
    }

    this.currentFrame = Math.max(0, Math.min(this.currentFrame, totalFrames));

    const data = this.data;
    const currentFrameData = this.currentFrameData;

    if (currentFrameData && this.currentFrame != 0) {
      this.material.uniforms.uSize.value.x =
        currentFrameData.sourceSize.w / data.meta.size.w;
      this.material.uniforms.uSize.value.y =
        currentFrameData.sourceSize.h / data.meta.size.h;
      this.material.uniforms.uOffset.value.x =
        currentFrameData.frame.x / data.meta.size.w;
      this.material.uniforms.uOffset.value.y =
        1 - currentFrameData.frame.y / data.meta.size.h;
    }

    // console.log(this.currentFrame,currentFrameData)
    // console.log(this.material.uniforms.uOffset.value.x, this.material.uniforms.uOffset.value.y)
    return hasUpdated;
  }

  isFrameValid(frameIdx) {
    let res = true;
    for (let i = 0; i < this.skipFrames.length; i++) {
      if (this.skipFrames[i] == frameIdx) res = false;
    }

    return res;
  }

  makeMaterial() {
    this.texture.minFilter = LinearFilter;
    this.texture.magFilter = LinearFilter;

    const m = new ShaderMaterial({
      uniforms: {
        tSprite: { value: this.texture },
        uSize: { value: new Vector2() },
        uOffset: { value: new Vector2() },
        uFlip: { value: 0 },
        uRotation: { value: 0 },
        uLeft: { value: true, type: "i" },
      },
      side: DoubleSide,
      vertexShader: vs,
      fragmentShader: fs,
      // transparent: true,
      // depthTest: false,
      // depthWrite: false,
    });

    this.material = m;

    return m;
  }

  getMaterial() {
    return this.material;
  }
}

export default SpriteAnimation;
