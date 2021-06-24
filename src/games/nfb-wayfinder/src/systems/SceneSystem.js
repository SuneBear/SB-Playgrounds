import * as Tags from "../tags";
import * as THREE from "three";
import { detachObject } from "../util/three-util";

export default function SceneSystem(world) {
  world.system.info({ hidden: true });

  const events = world.listen(Tags.Object3D);
  const MainScene = world.query(Tags.MainScene);
  return function sceneSystem() {
    const scene = world.findTag(MainScene);
    if (!scene || !events.changed) return;
    events.added.forEach((e) => {
      if (!e.has(Tags.Object3D)) return;
      const obj = e.get(Tags.Object3D);
      if (obj && !obj.parent) {
        scene.add(obj);
        obj.updateMatrixWorld();
      }
    });
    events.removing.forEach((e) => {
      if (!e.has(Tags.Object3D)) return;
      const obj = e.get(Tags.Object3D);
      if (obj && !e.has(Tags.Object3DKeepAlive)) {
        detachObject(obj);
      }
    });
  };
}
