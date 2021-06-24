import * as Tags from "../tags";
import * as THREE from "three";
import * as Helpers from "../util/helpers";
import deepClone from "deep-clone";
import {
  clearGroup,
  detachObject,
  disposeTree,
  pruneUserData,
} from "../util/three-util";
import { traverseAndFixSprites } from "../util/EditorWayfinderSprite";
// import { Assets } from "./AssetLoaderSystem";
//
import RefGLTFLoader, { MetaData } from "../util/RefGLTFLoader";
import Random from "../util/Random";
import { circlesIntersect } from "../util/geometry";
import ObjectPool from "../util/ObjectPool";

export default async function LoadRefGLTFSystem(world) {
  const container = new THREE.Group();
  container.name = "loadrefgroup";
  world.entity().add(Tags.Object3D, container);
  // container.visible = false;

  const loader = await RefGLTFLoader(world);

  const refEvents = world.listen(Tags.GLTFRefAsset);
  const activeEnv = world.listen(Tags.ActiveEnvironmentState);
  const refView = world.view(Tags.GLTFRefAsset);
  const frustum = world.findTag(Tags.MainCameraFrustum);
  const tmpBox = new THREE.Box3();
  const p3d = new THREE.Vector3();
  const userPos2D = [0, 0];
  const tmpBounds = new THREE.Box3();

  const groupPool = new ObjectPool({
    initialCapacity: 50,
    create() {
      const g = new THREE.Group();
      g.userData._pool = this;
      // container.add(g);
      return g;
    },
    release(g) {
      // container.remove(g);
      clearGroup(g);
    },
  });
  // const random = Random(Random.getRandomState());
  // (async () => {
  //   const names = Object.keys(MetaData);
  //   const object = await loader.loadSceneByName(names[9]);
  //   group.add(object);
  //   // object.rotation.y = random.range(-1, 1) * Math.PI * 2;
  // })();

  // let a = true;
  // setInterval(() => {
  //   a = !a;
  //   load(a ? scene0 : scene1);
  // }, 1000);

  // (async () => {
  //   const resp = await fetch(testsceneUrl);
  //   const json = await resp.json();
  //   load(json);
  // })();

  // load(testscene);

  // window.printVisible = () => {
  //   const mainScene = world.findTag(Tags.MainScene);
  //   let vis = 0;
  //   mainScene.traverse((child) => {
  //     if (child.visible) {
  //       vis++;
  //       // if (!child.name) {
  //       //   if (child.isMesh) {
  //       //     console.log("untitled child", child.material.name);
  //       //   } else {
  //       //     console.log("untitled");
  //       //   }
  //       // } else {
  //       //   console.log(child.name);
  //       // }
  //     }
  //   });
  //   console.log("total visible", vis);
  // };

  return function loadRefGLTFSystem(dt) {
    if (!world.findTag(Tags.AppState).ready) return;
    const userPos = world.findTag(Tags.UserTarget).position;
    userPos2D[0] = userPos.x;
    userPos2D[1] = userPos.z;

    if (activeEnv.changed) {
      refView.forEach((e) => {
        const r = e.get(Tags.GLTFRefAsset);
        release(e, r);
        refView.forEach((e) => e.kill());
      });
    }

    refEvents.removing.forEach((e) => {
      const r = e.get(Tags.GLTFRefAsset);
      if (e.has(Tags.Object3D)) {
        const g = e.get(Tags.Object3D);
        detachObject(g);
        e.remove(Tags.Object3D);
      }
      // console.log("removing", r);
      if (r.group) {
        if (r.group.parent) {
          console.warn("GLTF Ref still has parent");
        }
        releaseLoaded(r.group);
        r.group = null;
      }
    });
    refView.forEach((e) => {
      const r = e.get(Tags.GLTFRefAsset);
      const p = r.position;
      const name = r.name;
      const data = MetaData[name];
      const x = p[0];
      const y = p[1];

      const patchRadius = data.boundingCircle.radius;

      const nearby = circlesIntersect(p, patchRadius, userPos2D, 50);
      let inFrustum = false;
      if (nearby) {
        // TODO: Currently, any item within a circle radius is 'in frustum'
        // for our purposes here, but in reality it might not be in frustum.
        // However ThreeJS will catch those during its render step, so we can just
        // set it to true and let ThreeJS cull away anything not in frustum.
        inFrustum = true;

        // Alternatively we might want to do manual frustum culling for some reason?
        // if (r.boundsSet) {
        //   tmpBox.min.copy(r.boundsMin);
        //   tmpBox.max.copy(r.boundsMax);
        // } else {
        //   p3d.set(p[0], 0, p[1]);
        //   tmpBox.min.fromArray(data.boundingBox[0]).add(p3d);
        //   tmpBox.max.fromArray(data.boundingBox[1]).add(p3d);
        // }
        // inFrustum = frustum.intersectsBox(tmpBox);

        // Another thing we can do is prepare scenes once they are in range
        // This reduces the chance of objects 'popping' into view,
        // but may create jank as you move.
        // loader.prepareSceneByName(name);
      }

      const curInFrustum = e.has(Tags.IsInFrustum);

      if (inFrustum !== curInFrustum) {
        // update visibility tag
        if (inFrustum) {
          e.add(Tags.IsInFrustum);
        } else {
          if (e.has(Tags.IsInFrustum)) {
            e.remove(Tags.IsInFrustum);
            release(e, r);
          }
        }

        // if in frustum, make sure we have something loaded
        // or if we need to load group initially
        if (e.has(Tags.IsInFrustum)) {
          // no object yet assigned
          if (!e.has(Tags.Object3D)) {
            next(e, r, name, x, y);
          }
        }

        if (e.has(Tags.Object3D)) {
          const d = e.get(Tags.Object3D);
          d.visible = inFrustum;
        }
      }
    });
  };

  function release(e, r) {
    if (r.group) {
      releaseLoaded(r.group);
    }
    if (e.has(Tags.Object3D)) {
      const g = e.get(Tags.Object3D);
      detachObject(g);
      e.remove(Tags.Object3D);
    }
    if (r.promise) {
      r.promise.then(releaseLoaded);
    }
    r.group = null;
    r.promise = null;
  }

  function releaseLoaded(object) {
    if (object && object.userData._pool) {
      object.userData._pool.release(object);
    }
  }

  function next(e, r, name, x, y) {
    if (r.group) {
      console.error("Group already exists");
      releaseLoaded(r.group);
      detachObject(r.group);
    }
    const parent = groupPool.next();
    // if (parent.parent) throw new Error("has parent!");
    // container.add(parent);
    r.group = parent;
    parent.name = name;
    r.promise = loader.nextPooledByName(name, true).then((object) => {
      // in case the object was destroyed before loading completed
      if (!r.group) {
        console.log("Early release", object);
        releaseLoaded(object);
        return null; // already released
      }

      const p = r.group;
      p.position.x = x;
      p.position.z = y;
      p.add(object);

      tmpBounds.setFromObject(p);
      r.boundsMin.copy(tmpBounds.min);
      r.boundsMax.copy(tmpBounds.max);
      r.boundsSet = true;

      // const data = MetaData[name];
      // const tmpBox = new THREE.Box3();
      // p3d.set(x, 0, y);
      // tmpBox.min.fromArray(data.boundingBox[0]).add(p3d);
      // tmpBox.max.fromArray(data.boundingBox[1]).add(p3d);

      // const box1 = new THREE.Box3Helper(tmpBox, "blue");
      // world.entity().add(Tags.Object3D, box1);

      // const box = new THREE.BoxHelper(p);
      // world.entity().add(Tags.Object3D, box);

      return object; // return object for future promise thens()
    });

    const object = r.group;
    e.add(Tags.Object3D, object);
  }
}
