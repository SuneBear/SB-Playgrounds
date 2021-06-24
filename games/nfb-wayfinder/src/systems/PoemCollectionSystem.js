import * as Tags from "../tags";
// import PoemCollectionOverlay from "../overlays/PoemCollectionOverlay.svelte";
// import HaikuPopup from "../overlays/HaikuPopup.svelte"; // Get access to poem state
import { writable } from "svelte/store";

export default function PoemCollectionSystem(world) {
  const entity = world.entity().add(Tags.ViewLayer, {
    id: "poem-collection",
    // component: PoemCollectionOverlay,
  });
}
