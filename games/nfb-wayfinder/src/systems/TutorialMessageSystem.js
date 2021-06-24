import * as Tags from "../tags";
import * as THREE from "three";
import TutorialMessage from "../overlays/TutorialMessage.svelte";
import { writable } from "svelte/store";

export default function TutorialMessageSystem(world) {
  const messages = world.view(Tags.TutorialMessage);

  let canShow = !Boolean(world.findTag(Tags.IsGameUIActive));
  const canShowStore = writable(canShow);
  canShowStore.subscribe((v) => {
    canShow = v;
  });

  return function TutorialMessageSystemDT(dt) {
    const newCanShow = !Boolean(world.findTag(Tags.IsGameUIActive));
    if (newCanShow !== canShow) {
      canShow = newCanShow;
      canShowStore.update((d) => canShow);
    }

    if (canShow) {
      messages.forEach((e) => {
        const k = e.get(Tags.TutorialMessage);
        k.time += dt;
        if (k.time >= k.delay && !e.has(Tags.ViewLayer)) {
          e.add(Tags.ViewLayer, {
            component: TutorialMessage,
            id: k.id,
            props: {
              canShow: canShowStore,
              token: k.token,
              iconMode: k.iconMode,
              text: k.message,
            },
          });
        }
        const curTime = Math.max(0, k.time - k.delay);
        if (curTime >= k.duration) {
          e.kill();
        }
      });
    }
  };
}
