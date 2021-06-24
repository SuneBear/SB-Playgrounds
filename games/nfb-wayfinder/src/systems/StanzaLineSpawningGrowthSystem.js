import * as Tags from "../tags";
import * as THREE from "three";
import { createMeshMaterial, createSpriteMaterial } from "../util/materials";
import { setMeshToSprite, createSprite } from "../util/EditorWayfinderSprite";
import { loadTexture } from "../util/load";
// import grassUrl1 from "../assets/textures/grass/GRASSLAND-FLOWER-1.png";
// import grassUrl2 from "../assets/textures/grass/GRASSLAND-FLOWER-2.png";
// import grassUrl3 from "../assets/textures/grass/GRASSLAND-FLOWER-white-1.png";
// import grassUrl4 from "../assets/textures/grass/GRASSLAND-FLOWER-white-2.png";
import { tweenFromTo } from "./AnimationSystem";
import Random from "../util/Random";
import Assets from "../util/Assets";

export default function StanzaLineSpawningGrowthSystem(world) {
  const random = Random();

  const ids = [
    "GRASSLAND-FLOWER-1",
    "GRASSLAND-FLOWER-2",
    "GRASSLAND-FLOWER-white-1",
    "GRASSLAND-FLOWER-white-2",
  ].map((id) => {
    return `image/stanza-spawn/${id}`;
  });
  const renderer = world.findTag(Tags.Renderer);
  const textures = ids.map((id) => {
    const [tex] = Assets.createGPUTextureTask(renderer, id);
    return tex;
  });

  const assetView = world.view(Tags.StanzaLineSpawningAsset);
  const assetEvents = world.listen(Tags.StanzaLineSpawningAsset);
  return function stanzaLineGrowthSystem(dt) {
    assetEvents.added.forEach((e) => {
      const assetData = e.get(Tags.StanzaLineSpawningAsset);

      const height = random.gaussian(1, 1 / 4);
      const tex = random.pick(textures);

      if (tex && tex.image && tex.image.width > 0 && tex.image.height > 0) {
        const sprite = createSprite(world, tex, height);
        sprite.position.set(assetData.x, 0, assetData.z);
        sprite.scale.y = 0;

        e.add(Tags.Object3D, sprite)
          .add(Tags.ShaderUniformTime, {
            uniform: sprite.material.uniforms.time,
          })
          .add(Tags.ShadowCaster, { sprite: true });

        tweenFromTo(
          world,
          sprite.scale,
          "y",
          0,
          height,
          1,
          "sineOut",
          random.range(0, 1)
        );
      }
    });
    assetView.forEach((e) => {
      if (e.has(Tags.Object3D)) {
        const sprite = e.get(Tags.Object3D);
        const map = sprite.material.uniforms.map.value;
        const aspect = map.image.width / map.image.height;
        const height = sprite.scale.y;
        const width = height * aspect;
        sprite.scale.x = width;
      }
    });
  };
}
