import { createWorld, Types, Data, Value, Tag } from "../alec";
import { writable } from "svelte/store";
import { getContext } from "svelte";
import rightNow from "right-now";

export const CONTEXT_KEY_NODE = {};

export class ViewLayer extends Data {
  static data = {
    id: Types.Ref(""),
    component: Types.Ref(),
    props: Types.Object(),
  };
}

export class ViewLayerNeedsUpdate extends Tag {}

export class Config extends Data {
  static data = {
    name: Types.Ref(""),
    component: Types.Ref(),
    props: Types.Object(),
    triggers: Types.Object(),
    changed: Types.Ref(false),
    sync: Types.Ref(false),
    instance: Types.Ref(),
  };

  update() {
    this.changed = true;
    this.sync = true;
  }
}

export class MarkConfigChanged extends Tag {}

export class TagPropUpdate extends Value {}

export class AutoReleasingTrigger extends Data {
  static data = {
    target: Types.Ref(),
    key: Types.Ref(),
    value: Types.Ref(),
  };
}

function ViewLayerSystem(world, { store }) {
  world.system.info({ hidden: true });

  const entities = world.view(ViewLayer);
  const events = world.listen(ViewLayer);
  const updates = world.view([ViewLayer, ViewLayerNeedsUpdate]);

  return () => {
    let needsUpdate = false;
    let didUpdate = false;
    if (events.changed) {
      const layers = entities.slice();
      if (store) store.update(() => layers);
      didUpdate = true;
    }

    updates.forEach((e) => {
      e.remove(ViewLayerNeedsUpdate);
      needsUpdate = true;
    });

    if (!didUpdate && needsUpdate && store) {
      const layers = entities.slice();
      store.update(() => layers);
    }
  };
}

function ConfigSystem(world, { store }) {
  world.system.info({ hidden: true });

  const configs = world.view(Config);
  const events = world.listen(Config);
  const triggers = world.view(AutoReleasingTrigger);
  const triggerEvents = world.listen(AutoReleasingTrigger);

  const tagUpdates = world.view(TagPropUpdate);
  const updateFps = 10;
  let fpsInterval = 1 / updateFps;
  let fpsElapsed = 0;
  let lastFrameTime = rightNow();

  return {
    process,
  };

  function process(dt) {
    // first, if any configs have been added / removed, we
    // will trigger a full update on the store
    if (events.changed) {
      if (store) {
        const list = configs.slice();
        store.update((d) => list);
      }

      // newly added configs will also receive a ConfigHasChanged tag
      events.added.forEach((e) => {
        e.add(MarkConfigChanged);
      });

      events.removing.forEach((e) => {
        if (e.has(MarkConfigChanged)) e.remove(MarkConfigChanged);
      });
    }

    // next, we cycle through all current configs and mark change flags
    configs.forEach((e) => {
      const config = e.get(Config);
      const hasChangeMarker = e.has(MarkConfigChanged);
      config.changed = hasChangeMarker;
      // remove the tag as we've now set the change flag
      if (hasChangeMarker) e.remove(MarkConfigChanged);

      if (config.instance && config.sync) {
        // config.instance.$set(config.props);
        config.instance.sync();
        config.sync = false;
      }
    });

    // go through any triggers that are being killed
    triggerEvents.removing.forEach((e) => {
      // release the trigger, which forces a change flag
      const trigger = e.get(AutoReleasingTrigger);
      // trigger.target.changed = true;
      // and delete the trigger prop
      delete trigger.target.triggers[trigger.key];
    });
    // this view is into the not-yet-killed triggers
    triggers.forEach((e) => {
      // mark the change flag and set trigger to new value
      const trigger = e.get(AutoReleasingTrigger);
      // trigger.target.changed = true;
      trigger.target.triggers[trigger.key] = trigger.value;
      // mark entity for deletion, next time we process it will get
      // picked up by triggerEvents.removing
      e.kill();
    });

    fpsElapsed += dt;
    if (fpsElapsed >= fpsInterval) {
      fpsElapsed %= fpsInterval;
      const now = rightNow();
      tagUpdates.forEach((e) => {
        const f = e.get(TagPropUpdate);
        if (typeof f === "function") f();
      });
      lastFrameTime = now;
    }
  }
}

export function createRootWorld(opt = {}) {
  const { useEditorConfig = false } = opt;

  const world = createWorld({ initialCapacity: 400 });

  const viewLayerStore = writable([]);
  world.addSystem(ViewLayerSystem, { store: viewLayerStore });

  const configEntityStore = useEditorConfig ? writable([]) : null;
  // if (useEditorConfig) {
  world.addSystem(ConfigSystem, { store: configEntityStore });
  // }

  return {
    configEntityStore,
    viewLayerStore,
    world,
  };
}

export function context() {
  const ctx = getContext(CONTEXT_KEY_NODE);
  if (ctx == null)
    throw new Error(`Must call context() from within a Svelte component`);
  return ctx;
}
