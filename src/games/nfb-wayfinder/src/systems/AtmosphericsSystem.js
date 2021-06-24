import * as Tags from "../tags";
import * as THREE from "three";
import Assets from "../util/Assets";

export default function AtmosphericsSystem(world) {
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -10, 10);
  const atmospherics = world.tag(Tags.Atmospherics, {
    scene,
    camera,
  });
  const renderer = world.findTag(Tags.Renderer);
  const [map] = Assets.createGPUTextureTask(renderer, "image/data/lightray", {
    wrapS: THREE.RepeatWrapping,
    wrapT: THREE.RepeatWrapping,
  });

  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map,
      depthTest: false,
      depthWrite: false,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    })
  );
  sprite.scale.setScalar(2);
  sprite.position.set(0.5, 0.5, 0);
  scene.add(sprite);

  return (dt) => {};
}
