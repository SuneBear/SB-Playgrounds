import { writable } from "svelte/store";
import documentVisibility from "./documentVisibility";

export const audioState = writable({
  visible: true,
  muted: false,
});

documentVisibility((visible) => {
  audioState.update((d) => ({ ...d, visible }));
});
