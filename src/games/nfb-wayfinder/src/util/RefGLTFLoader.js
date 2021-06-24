import * as Tags from "../tags";
import * as THREE from "three";
import { GLTFLoader } from "../util/GLTFLoader";
import files from "../assets/gltf/*.{gltf,glb,png,jpg}";
import {
  createMeshMaterial,
  createSpriteMaterial,
  getEmptyTexture,
} from "./materials";
import { loadTexture } from "./load";
import { setMeshToSprite } from "./EditorWayfinderSprite";
import metas from "../assets/gltf/meta.json";
import * as Helpers from "./helpers";
import { ShaderMaterial } from "three";
import Assets from "../util/Assets";
import spritesData from "../assets/gltf/sprites-*.json";
import spriteURLObject from "../assets/gltf/sprites-*.png";
import { detachObject, shareAtlasTexture } from "./three-util";
import { getWeightedSets } from "../systems/environment/asset-types";
import ObjectPool from "./ObjectPool";
import { addFrameTask } from "./addFrameTasks";

let spriteAtlasURLs = {};
// Object.entries(spriteURLObject).forEach(([id, urls]) => {
Object.keys(spriteURLObject).forEach((id) => {
  const urls = spriteURLObject[id];
  const typeMatch = id.match(/([^\-]+)\-/);
  let type = typeMatch ? typeMatch[1] : "";
  const index = parseInt(id.replace(/[^\d]+/g, ""), 10);
  if (!(type in spriteAtlasURLs)) {
    spriteAtlasURLs[type] = [];
  }
  spriteAtlasURLs[type][index] = urls;
  if (type === "forest") {
    const id = Assets.urlToID(urls);
    Assets.prepare(id);
  }
});

// let spriteURLs = Object.entries(spriteURLObject);
// spriteURLs.sort((a, b) => parseInt(a[0], 10) - parseInt(b[0], 10));
// spriteURLs = spriteURLs.map((e) => e[1]);

// pre-fetch the assets for the world
// let spriteURLIDs = spriteURLs.map((url) => {
// const id = Assets.urlToID(url);
// Assets.prepare(id);
//   return id;
// });

const images = getURLMap(files, ["jpg", "png"], "map-");
const scenes = getURLMap(files, ["gltf", "glb"]);
// const scenes = getURLMap(files, ["gltf", "glb"], "scene-");

// need to fix this with proper box test on sprites
const boundingBoxYPadding = 19;
Object.keys(metas).forEach((k) => {
  // clamp to ground so that we don't pick up any out of frame
  metas[k].boundingBox[0][1] = 0;
  // pad a bit more for tall tree sprites, this is because
  // trees are not actually vertical in world space but
  // aligned to the camera direction, which means sometimes
  // they poke out of the bbox... this is arbitrary
  // and could probably be computed more accurately
  metas[k].boundingBox[1][1] += boundingBoxYPadding;
  // metas[k].boundingCircle.radius += 2;
});

export const MetaData = metas;

// export const AssetURLs = {
//   scenes,
//   geometries,
//   images,
// };

export default async function RefLoader(world) {
  const mapCache = new Map();
  // const geometryCache = new Map();
  const sceneCache = new Map();
  const patchInstanceCache = new Map();
  const emptyGeometry = new THREE.BufferGeometry();
  const emptyTexture = getEmptyTexture();
  const tmpWorldScale = new THREE.Vector3();
  // const container = new THREE.Group();
  // container.name = "gltf-refs";
  // world.entity().add(Tags.Object3D, container);

  const renderer = world.findTag(Tags.Renderer);
  const spritesUUIDMap = new Map();

  const spriteAtlasTextures = {};
  for (let [type, sheets] of Object.entries(spriteAtlasURLs)) {
    spriteAtlasTextures[type] = sheets.map((urls) => {
      // const tex = new THREE.Texture();
      const id = Assets.urlToID(urls);
      // Assets.loadGPUTexture(renderer, tex, id);
      return Assets.createGPUTextureTask(renderer, id);
    });
    // console.log(type, spriteAtlasTextures[type]);
  }

  // console.log("Loading textures...");
  // const atlasTextures = await Promise.all(
  //   spriteURLIDs.map((id) => {
  //     return Assets.createGPUTexture(renderer, id);
  //   })
  // );

  Object.entries(spritesData).forEach(([type, data]) => {
    const atlasTasks = spriteAtlasTextures[type];
    data.frames.forEach((frames, sheetIndex) => {
      frames.forEach((frame) => {
        if (!spritesUUIDMap.has(frame.id)) {
          const { width, height } = data.images[sheetIndex];
          const repeat = new THREE.Vector2();
          const offset = new THREE.Vector2();

          repeat.set(frame.w / width, frame.h / height);
          offset.x = frame.x / width;
          offset.y = 1 - frame.h / height - frame.y / height;

          const atlasTask = atlasTasks[sheetIndex];
          const obj = {
            ...frame,
            repeat,
            offset,
            atlas: atlasTask[0],
            atlasPromise: atlasTask[1],
            sheetIndex,
          };
          delete obj.id;
          spritesUUIDMap.set(frame.id, obj);
        } else {
          console.error("WARN: Clashing UUIDs in GLTF sprite sheet data");
        }
      });
    });
  });

  // TODO: this should be cleaned up so we aren't waiting
  // on all item set assets upfront...
  const pools = new Map();
  const itemsMap = new Map();

  // await Promise.all(["forest", "origin", "grasslands", "tundra"].map(
  //   (type) => {
  //     return loadGLTFScenesByType(type);
  //   }
  // ));
  await Promise.all(
    [
      "forest-items-dry",
      "forest-items-autumn",
      "forest-items-triangle",
      "grasslands-items-water",
      "grasslands-items-yellow",
      "grasslands-items-wet",
      "grasslands-items-field",
      "tundra-items-basic",
      "tundra-items-ice",
    ].map(async (name) => {
      const scene = await loadSceneByName(name, false, false);
      // console.log("GOT ITEM SCENE", scene);
      const type = name.replace(/^items\-/i, "");
      const sets = getWeightedSets(scene.children);
      const items = GLTFItems(sets);
      itemsMap.set(type, items);

      // TODO: Here we actually preload / fetch pools
      // for each item... this needs to be done
      // per-environment instead
      sets.forEach((set) => {
        set.value.forEach((item) => {
          // setTimeout(() => {
          items.getPool(item, 10);
          // }, 100);
        });
      });
    })
  );

  // console.log("LOADING GLTF");
  world.entity().add(Tags.GLTFSpawnItemsMap, itemsMap);

  return {
    killEntities,
    nextPooledByName,
    loadSceneByName,
    // prepareSceneByName,
  };

  function GLTFItems(sets) {
    return {
      sets,
      getPool,
      next(instance) {
        return nextPooledInstance(instance);
      },
    };
  }

  function getPool(instance, initialCapacity = 1) {
    let pool;
    if (!pools.has(instance)) {
      pool = createInstancePool(instance, initialCapacity);
      pools.set(instance, pool);
    } else {
      pool = pools.get(instance);
    }
    return pool;
  }

  function nextPooledInstance(instance) {
    return getPool(instance).next();
  }

  function createInstancePool(instance, initialCapacity = 1) {
    const id = instance.name;
    // console.log("Creating pool", id, instance.uuid);
    return new ObjectPool({
      initialCapacity,
      name: `GLTFMesh-${id}`,
      create() {
        const m = fastCloneScene(instance);
        m.userData._pool = this;
        return m;
      },
      renew(m) {
        if (m.userData) m.userData._pool = this;
        createEntities(m);
        // if (m.parent) {
        //   throw new Error("wtf has a parent");
        // }
        // container.add(m);
        return m;
      },
      release(m) {
        // detachObject(m);
        if (m.userData) m.userData._pool = null;
        killEntities(m);
      },
    });
  }

  function killEntities(scene) {
    // console.log("killing scene", scene.name);
    scene.traverse((child) => {
      if (child.userData && child.userData._entity) {
        // console.log("killing child entity", child.name);
        child.userData._entity.kill();
        child.userData._entity = null;
      }
    });
  }

  function createEntities(scene) {
    // let count = 0;
    // scene.traverse((child) => {
    //   if (child.isMesh) {
    //     count++;
    //     createChildEntity(child);
    //   }
    // });

    scene.traverse((child) => {
      if (child.isMesh) {
        createChildEntity(child);
      }
    });

    // on profiling this is a big cause of jank
    // so we split the work up across several frames
    // const maxPerFrame = 1;
    // let i = 0;
    // while (i < children.length) {
    //   const remaining = children.length - i;
    //   const count = Math.min(remaining, maxPerFrame);
    //   let start = i;
    //   let end = i + count;
    //   addFrameTask(() => {
    //     for (let c = start; c < end; c++) {
    //       createChildEntity(children[c]);
    //     }
    //   });
    //   i += count;
    // }
    // setTimeout(() => {
    //   scene.traverse((child) => {
    //     if (child.isMesh) {
    //       count++;
    //       createChildEntity(child);
    //     }
    //   });
    // }, 1000);
    // console.log("got count", count, scene.children.length);
  }

  function nextPooledByName(name, debounceCreate) {
    return loadSceneByName(name, true, debounceCreate);
  }

  // function prepareSceneByName(name) {
  //   if (!sceneCache.has(name)) {
  //     // addFrameTask(() => {

  //     // });
  //     // name = name.replace(/^scene\-/, "").replace(/\.(gltf|glb)$/i, "");
  //     const sceneUrl = scenes.get(name);
  //     const meta = name in metas ? metas[name] : null;
  //     const promise = loadScene(name, sceneUrl, meta);
  //     sceneCache.set(name, promise);
  //   }
  // }

  async function loadGLTFScenesByType(type) {
    if (!type || !scenes.has(type)) {
      console.warn(`No scene by ID prefix ${type}`);
      return null;
    }

    // Now load it, assuming it's not yet cached
    const url = scenes.get(type);
    let p;
    if (sceneCache.has(url)) {
      p = sceneCache.get(url);
    } else {
      p = loadGLTF(url).then((gltf) => {
        const map = {};
        gltf.scenes.forEach((scene) => {
          map[scene.name] = scene;
        });
        return map;
      });
      sceneCache.set(url, p);
    }
    return p;
  }

  async function loadSceneByName(name, pooling, debounceCreate) {
    let instance;
    if (patchInstanceCache.has(name)) {
      instance = patchInstanceCache.get(name);
    } else {
      // First extract the type of scene we need to load
      const typeMatch = name.match(/([^\-]+)\-/);
      let type = typeMatch ? typeMatch[1] : "";
      // Now get the map of scenes from that set
      const map = await loadGLTFScenesByType(type);
      if (!map) {
        console.warn(`No scene by ID prefix ${type}`);
        return new THREE.Scene();
      }
      if (!(name in map)) {
        console.warn(`Missing patch ${name} in ${type}`);
        return new THREE.Scene();
      }

      // And load/process the actual instance
      instance = map[name];
      // here's where we lazily pick up images and such
      const meta = metas[name];
      if (!meta) {
        console.warn(`No Meta for ${name}`);
      }
      await loadSceneInstance(instance, meta);
      patchInstanceCache.set(name, instance);
    }

    const needsClone = true;
    if (pooling) {
      const pool = getPool(instance);
      return pool.next();
    } else {
      if (needsClone) return fastCloneScene(instance);
      else return instance;
    }
  }

  async function loadSceneInstance(scene, meta) {
    const childrenToLoad = [];
    scene.traverse((child) => {
      if (child.isMesh) {
        childrenToLoad.push(child);
      }
    });
    // now fetch all assets
    await Promise.all(
      childrenToLoad.map(async (child) => {
        const isSprite =
          child.isSprite || child.userData.type === "WayfinderSprite";

        // if (child.userData.$g) {
        //   // a geometry asset
        //   console.log("FETCH GEOMETRY!");
        //   // child.geometry = await fetchGeometry(child.userData.$g);
        //   delete child.userData.$g;
        // }
        if (child.userData.$m) {
          // a sprite asset?
          const map = await fetchMap(child.userData.$m);
          if (child.material.uniforms) child.material.uniforms.map.value = map;
          else child.material.map = map;
          if (!isSprite && map) map.flipY = false;
          delete child.userData.$m;
        }

        createSceneChild(child, meta);
      })
    );
    return scene;
  }

  function fastCloneScene(scene) {
    // let count = 0;
    const newScene = scene.clone(true);
    const name = scene.name;
    const meta = name in metas ? metas[name] : null;
    newScene.traverse((child) => {
      if (child.isMesh) {
        createSceneChild(child, meta);
      }
      // count++;
    });
    // console.log("Scene node Count", name, count);
    return newScene;
  }

  async function fetchMap(id) {
    if (mapCache.has(id)) {
      return mapCache.get(id);
    }
    // first see if it exists in the sprite sheet
    // rather than being a opaque texture map for 3D mesh
    if (spritesUUIDMap.has(id)) {
      const frame = spritesUUIDMap.get(id);
      await frame.atlasPromise;
      const texture = new THREE.Texture();

      texture.repeat.copy(frame.repeat);
      texture.offset.copy(frame.offset);
      shareAtlasTexture(renderer, frame.atlas, texture);
      // texture.needsUpdate = true;
      // frame.atlas.needsUpdate = true;
      return texture;
    }
    // if we get here it must be map- prefixed that is lazy loaded
    if (!images.has(id)) {
      console.warn(`Could not find map by UUID ${id}`);
      return emptyTexture;
    }
    const url = images.get(id);
    const promise = loadTexture(url);
    mapCache.set(id, promise);
    return promise;
  }

  // async function fetchGeometry(id) {
  //   if (geometryCache.has(id)) {
  //     return geometryCache.get(id);
  //   }
  //   if (!geometries.has(id)) {
  //     console.warn(`Could not find geometry by UUID ${id}`);
  //     return emptyGeometry;
  //   }

  //   const url = geometries.get(id);
  //   const promise = loadGLTF(url).then((gltf) => {
  //     let geometry;
  //     if (
  //       !gltf.scene ||
  //       !gltf.scene.children ||
  //       gltf.scene.children.length !== 1
  //     ) {
  //       console.warn(`Geometry contains more than one mesh at UUID ${id}`);
  //     } else {
  //       const mesh = gltf.scene.children[0];
  //       geometry = mesh.geometry;
  //     }
  //     geometry = geometry || emptyGeometry;
  //     geometry.computeBoundingBox();
  //     return geometry;
  //   });
  //   geometryCache.set(id, promise);
  //   return promise;
  // }

  async function loadSceneOld(name, url, meta) {
    const gltf = await loadGLTF(url);
    const childrenToLoad = [];
    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        childrenToLoad.push(child);
      }
    });
    // now fetch all assets
    await Promise.all(
      childrenToLoad.map(async (child) => {
        const isSprite =
          child.isSprite || child.userData.type === "WayfinderSprite";

        if (child.userData.$g) {
          // a geometry asset
          // child.geometry = await fetchGeometry(child.userData.$g);
          delete child.userData.$g;
        }
        if (child.userData.$m) {
          // a sprite asset
          child.material.map = await fetchMap(child.userData.$m);
          if (!isSprite) child.material.map.flipY = false;
          delete child.userData.$m;
        }

        createSceneChild(child, meta);
      })
    );
    const scene = gltf.scene;
    scene.name = name;
    return scene;
  }

  function createChildEntity(child) {
    const isSprite =
      child.isSprite || child.userData.type === "WayfinderSprite";
    if (child.userData._entity) {
      child.userData._entity.kill();
      console.error("ERROR: Entity already existed on child, removing it.");
    }

    const tag = child.userData ? child.userData.tag : null;
    const ignoreShadow = tag ? tag.includes("noshadow") : false;
    if (isSprite) {
      const spriteScaleY = child.getWorldScale(tmpWorldScale).y;
      child.userData._entity = world
        .entity()
        .add(Tags.Object3D, child)
        .add(Tags.Object3DKeepAlive)
        .add(Tags.ShaderUniformTime, {
          uniform: child.material.uniforms.time,
        });
      if (!ignoreShadow)
        child.userData._entity.add(Tags.ShadowCaster, { sprite: true });

      if (tag && tag === "origin_tree") {
        child.userData._entity.add(Tags.SpriteAnimation, {
          key: child.userData.tag,
        });
        child.userData._entity.add(Tags.SpriteAnimationOriginTreeTag);
      }

      if (tag !== "origin_tree") {
        if (spriteScaleY > 5) {
          // TODO: use a tag in the editor instead of checking height
          child.userData._entity.add(Tags.WillTriggerAudio);
        }
      }
    } else {
      child.userData._entity = world
        .entity()
        .add(Tags.Object3D, child)
        .add(Tags.Object3DKeepAlive);

      if (!ignoreShadow)
        child.userData._entity.add(Tags.ShadowCaster, { sprite: false });
    }

    if (tag) {
      if (tag === "fox") {
        child.userData._entity.add(Tags.FoxSpriteTag);
      }
    }
  }

  function createSceneChild(child, meta) {
    const isSprite =
      child.isSprite || child.userData.type === "WayfinderSprite";

    if (
      meta &&
      meta.type === "origin" &&
      child.name &&
      child.name.endsWith("origin-0-ORIGIN_TREE")
    ) {
      child.userData.animation = "origin-0";
    }

    if (isSprite) {
      setMeshToSprite(world, child);
    } else {
      const map =
        child.material.uniforms && child.material.uniforms.map
          ? child.material.uniforms.map.value
          : child.material.map;

      const tag = child.userData ? child.userData.tag : null;
      const ignoreGround = tag
        ? tag.includes("noshadow") || tag.includes("noground")
        : false;
      if (ignoreGround) {
        child.material.alphaTest = 0.5;
        child.material.transparent = true;
      }
      child.material = createMeshMaterial(world, child, { map, ignoreGround });
      map.minFilter = THREE.LinearFilter;
      map.generateMipmaps = false;
    }
  }
}

async function loadGLTF(url) {
  return new Promise((resolve) => {
    const manager = new THREE.LoadingManager();
    const loader = new GLTFLoader(manager);
    loader.setCrossOrigin("anonymous");
    // console.log(`Loading GLTF ${url}`);
    loader.load(url, (gltf) => {
      resolve(gltf);
    });
  });
}

function getURLMap(files, extensions, prefix) {
  extensions = [].concat(extensions);
  const matching = Object.keys(files).filter((key) => {
    if (prefix && !key.startsWith(prefix)) return false;
    return Object.keys(files[key]).some((type) => extensions.includes(type));
  });
  return matching.reduce((map, key) => {
    const id = key
      .replace(/^map\-/, "")
      .replace(/^geometry\-/, "")
      .replace(/^scene\-/, "");
    const obj = files[key];
    const firstKey = Object.keys(obj)[0];
    if (firstKey) {
      map.set(id, obj[firstKey]);
    } else {
      console.warn("Object does not have any URL keys");
    }
    if (Object.keys(obj).length > 1) {
      console.log("Object has more than one URL key");
    }
    return map;
  }, new Map());
}

// .map((n) => n.replace(regex, ""));
