import * as Tags from "../tags";
import * as THREE from "three";
import LetterboxBarsOverlay from "../overlays/LetterboxBarsOverlay.svelte";

export default function LetterboxBarsSystem(world) {
  const uiEntity = world.entity();
  const letterboxView = world.view(Tags.LetterboxBars);

  return (dt) => {
    const addBars = world.findTag(Tags.ShowBiomeResolution);
    if (addBars) uiEntity.tagOn(Tags.LetterboxBars);
    else uiEntity.tagOff(Tags.LetterboxBars);

    const hasLetterboxes = letterboxView.length > 0;
    if (hasLetterboxes) {
      uiEntity.tagOn(Tags.CameraZoomOut);
      showUI();
    } else {
      uiEntity.tagOff(Tags.CameraZoomOut);
      hideUI();
    }
  };

  function showUI() {
    if (!uiEntity.has(Tags.ViewLayer)) {
      // uiEntity.add(Tags.ViewLayer, {
      //   component: LetterboxBarsOverlay,
      //   id: "letterbox-bars",
      //   props: {
      //   },
      // });
    }
  }

  function hideUI() {
    uiEntity.remove(Tags.ViewLayer);
  }
}
