import * as THREE from "three";
import Assets from "./Assets";

import { loadTexture } from "./load";

export default async function SpriteManager(sheets, renderer, opts = {}) {
  let atlases;
  if (typeof sheets === "string") {
    // asset ID
    const id = sheets;

    console.log("[sprites] Loading Sprite Sheet", id);
    const results = await Assets.load(id);

    sheets = results.map(([data]) => {
      return { data };
    });

    atlases = results.map(([data, image]) => {
      const texture = new THREE.Texture();
      texture.image = image;
      texture.needsUpdate = true;
      renderer.initTexture(texture);
      if (opts.release !== false) {
        texture.image = {
          width: image.width,
          height: image.height,
        };
      }
      return texture;
    });

    // release cached item now that it's loaded
    if (opts.release !== false) Assets.release(id);
  } else {
    sheets = await Promise.all(
      sheets.map(async (s) => {
        if (typeof s.data === "string") {
          const resp = await fetch(s.data);
          let data = await resp.json();
          s = { ...s, data };
        }
        return s;
      })
    );
    atlases = await Promise.all(
      sheets.map(({ url }) => {
        return loadTexture(url);
      })
    );
    atlases.forEach((atlas) => renderer.initTexture(atlas));
  }

  const spriteMap = {};
  sheets.forEach(({ data }, sheetIndex) => {
    // console.log(data, sheetIndex);
    data.frames.forEach((item, itemIndex) => {
      const frame = item.frame;
      const file = item.filename;
      const texture = new THREE.Texture();
      const spriteTextureSize = data.meta.size;
      const { w, h } = spriteTextureSize;
      texture.repeat.set(frame.w / w, frame.h / h);
      texture.offset.x = frame.x / w;
      texture.offset.y = 1 - frame.h / h - frame.y / h;

      let type = "";
      const id = file.toLowerCase().replace(/\.(png|jpg|jpeg)$/i, "");
      let basename = id;
      const slashIdx = id.lastIndexOf("/");
      if (slashIdx >= 0) {
        type = id.substring(0, slashIdx).toLowerCase();
        basename = id.substring(slashIdx + 1);
      }

      // const endpath = file.includes("/") ? file.split("/").pop() : file;
      // const id = endpath.toLowerCase().replace(/\.(png|jpg|jpeg)$/i, "");

      const frameNumMatch = id.match(/(^|[^\d])(\d+)$/);
      let idCount = itemIndex;
      if (frameNumMatch) {
        idCount = parseInt(frameNumMatch[2], 10);
      }

      const spriteItem = {
        // data,
        atlas: atlases[sheetIndex],
        sheetIndex,
        name: id,
        basename,
        data: frame,
        width: frame.w,
        height: frame.h,
        offset: texture.offset.clone(),
        repeat: texture.repeat.clone(),
        texture,
        type,
        idCount,
      };

      if (item.trimmed) {
        // spriteItem.trimmed = true;
        // spriteItem.width = item.sourceSize.w;
        // spriteItem.height = item.sourceSize.h;
        // spriteItem.offset.x -= item.spriteSourceSize.x / w;
        // spriteItem.offset.y -= item.spriteSourceSize.y / h;
        // spriteItem.repeat.x /= item.frame.w / item.sourceSize.w;
        // spriteItem.repeat.y /= item.frame.h / item.sourceSize.h;
        // "frame": {"x":2737,"y":2124,"w":391,"h":478},
        // "rotated": false,
        // "trimmed": true,
        // "spriteSourceSize": {"x":65,"y":49,"w":391,"h":478},
        // "sourceSize": {"w":540,"h":540}
      }
      spriteMap[id] = spriteItem;
    });
  });

  const values = Object.values(spriteMap);
  const frames = values.slice().sort((a, b) => {
    return a.idCount - b.idCount;
  });

  return {
    atlases,
    map: spriteMap,
    frames,
    values,
  };
}
