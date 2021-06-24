import fontUrl from "../assets/font/SilkaMono/silkamono-regularitalic-webfont.woff2";
import * as Tags from "../tags";
import * as THREE from "three";
import createPlaneSprite from "../util/createPlaneSprite";
import { detachObject } from "../util/three-util";

export default async function TextSpriteSystem(world) {
  world.system.info({ hidden: true });
  const events = world.listen(Tags.TextSprite3D);
  const sprites = world.view(Tags.TextSprite3D);
  const createSprite = await createFastTextSprites();
  return (dt) => {
    events.added.forEach((e) => {
      const opt = e.get(Tags.TextSprite3D);
      const sprite = createSprite(
        opt.text,
        opt.fontSize,
        opt.x,
        opt.y,
        opt.culling,
        opt.depth
      );
      opt.sprite = sprite;
      if (opt.parent) {
        opt.parent.add(opt.sprite);
      }
    });
    events.removing.forEach((e) => {
      const opt = e.get(Tags.TextSprite3D);
      if (opt.sprite && opt.sprite.parent) detachObject(opt.sprite);
    });
    sprites.forEach((e) => {
      const data = e.get(Tags.TextSprite3D);
      if (data.sprite) {
        data.sprite.material.uniforms.opacity.value = data.opacity;
        data.sprite.material.uniforms.color.value.copy(data.color);
      }
    });
  };
}

async function createFastTextSprites() {
  const font = new window.FontFace("SilkaMono", `url(${fontUrl})`, {
    family: "SilkaMono",
    style: "italic",
    weight: 400,
  });

  // We use async/await ES6 syntax to wait for the font to load
  await font.load();

  // Add the loaded font to the document
  document.fonts.add(font);

  const plane = new THREE.PlaneGeometry(1, 1, 1, 1);
  return (text, fontSize = 32, x = 0, y = 0, culling = true, depth = true) => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    const padding = 2.5;
    const font = `italic ${fontSize}px "SilkaMono", sans-serif`;
    context.font = font;
    context.textAlign = "center";
    context.textBaseline = "middle";
    const textWidth = context.measureText(text).width;
    const pixelRatio = 512 / textWidth;
    const width = Math.round(textWidth + padding * 2);
    const height = Math.round(fontSize + padding * 2);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    context.fillStyle = "white";
    context.font = font;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.save();
    context.scale(pixelRatio, pixelRatio);
    context.clearRect(0, 0, width, height);
    // context.fillStyle = inverse ? "white" : "black";
    // context.fillRect(0, 0, width, height);
    context.fillStyle = "white";
    context.fillText(text, width / 2, height / 2);
    context.restore();

    const map = new THREE.CanvasTexture(canvas);
    map.premultiplyAlpha = false;
    map.needsUpdate = true;
    map.generateMipmaps = false;
    map.minFilter = THREE.LinearFilter;

    // const sprite = new THREE.Sprite(
    //   new THREE.SpriteMaterial({
    // map,
    // blending: THREE.AdditiveBlending,
    // transparent: true,
    // opacity: 1,
    // depthTest: false,
    // depthWrite: false,
    // side: THREE.DoubleSide,
    //   })
    // );
    const sprite = createPlaneSprite({
      geometry: plane,
      map,
      rgba: true,
      // blending: inverse ? THREE.MultiplyBlending : THREE.AdditiveBlending,
      transparent: true,
      opacity: 1,
      depthTest: depth,
      depthWrite: depth,
      side: THREE.DoubleSide,
    });
    sprite.renderOrder = 20;
    sprite.material.uniforms.translate.value.x = x;
    sprite.material.uniforms.translate.value.y = y;
    sprite.frustumCulled = culling;
    const aspect = width / height;
    const visibleScale = textWidth * 0.02;
    sprite.scale.set(1, 1 / aspect, 1).multiplyScalar(visibleScale);
    return sprite;
  };
}
