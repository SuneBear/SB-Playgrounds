import fontUrl from "../assets/font/SilkaMono/silkamono-regularitalic-webfont.woff2";
import * as Tags from "../tags";
import * as THREE from "three";
import createPlaneSprite from "../util/createPlaneSprite";
import { detachObject } from "../util/three-util";
import Text3DOverlay from "../overlays/Text3DOverlay.svelte";
import { writable } from "svelte/store";
import ObjectPool from "../util/ObjectPool";
import { setEntityTweenFromTo, tweenTo } from "./AnimationSystem";

export default function DOMTextSystem(world) {
  world.system.info({ hidden: true });
  const events = world.listen(Tags.TextSprite3D);
  const sprites = world.view(Tags.TextSprite3D);

  const hintEvents = world.listen(Tags.TextHint);
  const hintKillEvents = world.listen([
    Tags.KillTextHint,
    Tags.TextHint,
    Tags.Object3D,
  ]);
  const hintView = world.view(Tags.TextHint);

  const state = writable(sprites);
  world.entity().add(Tags.ViewLayer, {
    id: "text-3d-overlay",
    component: Text3DOverlay,
    props: {
      world,
      state,
    },
  });

  // const textGroup = new THREE.Group();
  // const textEntity = world
  //   .entity()
  //   .add(Tags.TextSprite3D)
  //   .add(Tags.Object3D, textGroup);

  // const textData = textEntity.get(Tags.TextSprite3D);
  // textData.text = "hihihi";
  // textData.parent = textGroup;
  // textData.fontSize = 18;
  // textData.opacity = 1;

  // const sphere = new THREE.Mesh(
  //   new THREE.SphereGeometry(0.1, 32, 32),
  //   new THREE.MeshBasicMaterial({ color: "pink" })
  // );
  // world.entity().add(Tags.Object3D, sphere);

  const objectPool = new ObjectPool({
    create() {
      return new THREE.Group();
    },
  });

  return function textSystem(dt) {
    // const user = world.findTag(Tags.UserCharacter).position;
    // textGroup.position.copy(user);
    // textGroup.position.y += 2;
    // sphere.position.copy(textGroup.position);

    hintEvents.added.forEach((e) => {
      const group = objectPool.next();
      e.add(Tags.Object3D, group);
      const hint = e.get(Tags.TextHint);

      const startY = hint.position.y - 0.5;
      const endY = hint.position.y;
      const endZ = hint.position.z;
      const startZ = hint.position.z - 1;
      group.position.copy(hint.position);
      group.position.y = startY;
      group.position.z = startZ;

      // const planeMat = new THREE.MeshBasicMaterial({ color: "red" });
      // const mesh = new THREE.Mesh(plane, planeMat);
      // mesh.position.copy(group.position);
      // world.entity().add(Tags.Object3D, mesh);

      e.add(Tags.TextSprite3D);

      const textData = e.get(Tags.TextSprite3D);
      textData.text = hint.text;
      textData.depth = false;
      textData.fontStyle = "italic";
      textData.fontSize = 14;
      textData.parent = group;
      textData.opacity = 0;
      textData.culling = false;
      const delay = hint.delay;
      tweenTo(world, group.position, "y", endY, 1.5, "sineOut", delay);
      tweenTo(world, group.position, "z", endZ, 1.5, "sineOut", delay);
      tweenTo(world, textData, "opacity", 1, 2, "linear", delay);
    });
    hintKillEvents.added.forEach((e) => {
      const hint = e.get(Tags.TextHint);
      const textData = e.get(Tags.TextSprite3D);
      const startY = hint.position.y - 0.5;
      const endY = hint.position.y;
      const group = e.get(Tags.Object3D);
      tweenTo(world, group.position, "y", startY, 1, "sineOut", 0);
      setEntityTweenFromTo(e, textData, "opacity", 1, 0, 1, "quadOut", 0);
      const t = e.get(Tags.TargetKeyTween);
      t.killEntityOnFinish = true;
      t.assignFromOnStart = true;
    });
    hintView.forEach((e) => {
      const hint = e.get(Tags.TextHint);
      if (hint.killing && !e.has(Tags.KillTextHint)) {
        hint.time += dt;
        if (hint.time - hint.delay >= hint.duration) {
          e.add(Tags.KillTextHint);
        }
      }
    });
    hintEvents.removing.forEach((e) => {
      const obj = e.get(Tags.Object3D);
      detachObject(obj);
      e.remove(Tags.Object3D);
      objectPool.release(obj);
    });
    // trigger UI update each frame
    // if (events.changed || sprites.length > 0) {
    //   state.update((d) => d);
    // }

    // view.map()

    // events.added.forEach((e) => {
    //   const opt = e.get(Tags.TextSprite3D);

    // });
    // events.removing.forEach((e) => {
    //   // const opt = e.get(Tags.TextSprite3D);
    //   // if (opt.sprite && opt.sprite.parent) detachObject(opt.sprite);
    // });
    // sprites.forEach((e) => {
    // const data = e.get(Tags.TextSprite3D);
    // if (data.sprite) {
    //   data.sprite.material.uniforms.opacity.value = data.opacity;
    //   data.sprite.material.uniforms.color.value.copy(data.color);
    // }
    // });
  };
}
