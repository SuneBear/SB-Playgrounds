import { spliceOne, spliceObject } from "../util/array";
import ObjectPool from "../util/ObjectPool";
import { Types, Tag, Data, Value } from "./tag";
import EntityManager from "./EntityManager";
import QueryListener from "./QueryListener";

const DEBUG_NAME = false;
const IS_DEV = process.env.NODE_ENV === "development";

function run(fn) {
  fn();
}

function runAll(fns) {
  fns.forEach(run);
}

function isPromise(obj) {
  return (
    !!obj &&
    (typeof obj === "object" || typeof obj === "function") &&
    typeof obj.then === "function"
  );
}

export default function createWorld(opt = {}) {
  return new WorldRoot(opt);
}

function queryToString(query) {
  return `[${query.names.join(",")}]`;
}

function singletonError(query, entities) {
  if (entities.length === 0)
    throw new Error(`No singleton by the query ${queryToString(query)}`);
  if (entities.length > 1)
    throw new Error(
      `Expected singleton, but found multiple entities by the query "${queryToString(
        query
      )}`
    );
}

function singletonFrom(query) {
  const entities = query.entities;
  if (entities.length !== 1) singletonError(query, entities);
  return entities[0];
}

export class Config extends Data {
  static data = {
    props: Types.Ref(),
    component: Types.Ref(),
    system: Types.Ref(),
    instance: Types.Ref(),
  };
}

class QueryView {
  constructor(query) {
    this.query = query;
    this.view = query.entities.slice();
  }
}

function fastCopy(src, dst) {
  for (let i = 0; i < src.length; i++) {
    dst[i] = src[i];
  }
  dst.length = src.length;
}

class SystemState {
  constructor(world, System) {
    this.world = world;
    this.loading = true;
    this.loaded = false;
    this.promise = undefined;
    this.enabled = true;
    this._info = {
      name: undefined,
    };

    this.System = System;
    this.instance = null;

    this._children = null;
    this._listeners = null;
    this._views = null;
  }

  get name() {
    return this.info().name || this.System.name || "UntitledSystem";
  }

  info() {
    if (arguments.length === 0) return this._info;
    Object.assign(this._info, arguments[0]);
    return this;
  }

  _manage(entity) {
    if (!this._children) this._children = [];
    this._children.push(entity);
  }

  _unmanage(entity) {
    if (this._children) {
      spliceObject(this._children, entity);
    }
  }

  _dispose() {
    const listeners = this._listeners;
    if (listeners) {
      for (let i = 0; i < listeners.length; i++) {
        listeners[i].detach();
      }
      listeners.length = 0;
    }
    if (this._children) {
      for (let i = this._children.length - 1; i >= 0; i--) {
        const c = this._children[i];
        // first we ensure the entity is unmanaged,
        // we do it manually so that no splice is triggered
        c.system = null;
        c.kill();
      }
    }
    this._listeners = null;
    this._views = null;
    this._children = null;
  }

  _poll() {
    if (this._views) {
      for (let i = 0; i < this._views.length; i++) {
        const v = this._views[i];
        fastCopy(v.query.entities, v.view);
      }
    }
    if (this._listeners) {
      for (let i = 0; i < this._listeners.length; i++) {
        this._listeners[i].poll();
      }
    }
  }

  _flush() {
    if (this._listeners) {
      for (let i = 0; i < this._listeners.length; i++) {
        this._listeners[i].flush();
      }
    }
  }
}

class WorldFragment {
  constructor(root, systemState) {
    this.root = root;
    this._system = systemState;
  }

  subscribe(cb) {
    const subscribers = this.root._subscribers;
    let runner = () => cb(this._getSystemList());
    subscribers.push(runner);
    runner();
    return function unsubscribe() {
      if (runner) spliceObject(subscribers, runner);
      runner = null;
    };
  }

  get system() {
    return this._system;
  }

  _fragment(systemState) {
    return new WorldFragment(this.root, systemState);
  }

  _getSystemList() {
    return this.root._systemList;
  }

  _getSystemMap() {
    return this.root._systemMap;
  }

  _getEntityManager() {
    return this.root._entityManager;
  }

  _getConfigurations() {
    return this.root._configurations;
  }

  view(Tags) {
    if (!this.system)
      throw new Error(
        `Must call world.view() from a world fragment passed into a System`
      );
    const q = this.root.query(Tags);
    const v = new QueryView(q);
    const sys = this.system;
    if (!sys._views) sys._views = [];
    sys._views.push(v);
    return v.view;
  }

  listen(Tags) {
    if (!this.system)
      throw new Error(
        `Must call world.view() from a world fragment passed into a System`
      );
    if (!Tags)
      throw new Error(
        `Must specify Tag, Tags, or Query object to world.listen()`
      );
    let query = this.root.query(Tags);
    let listener = new QueryListener(query);
    const sys = this.system;
    if (!sys._listeners) sys._listeners = [];
    const listenerList = sys._listeners;
    listenerList.push(listener);

    const listenerState = listener.state;
    listenerState.dispose = () => {
      listener.detach();
      if (listenerList) spliceObject(listenerList, listener);
      query = listener = null; // deref for GC
    };
    return listenerState;
  }

  tag(Tag, opts) {
    const sys = this.system;
    if (!sys)
      throw new Error(
        `Must call world.tag() from a world fragment passed into a System`
      );
    let name = null; // `${sys.name}:${Tag.name}`
    if (DEBUG_NAME && process.env.NODE_ENV === "development") {
      name = `DEV_${sys.name}:${Tag.name}`;
    }
    return this.entity(name, true).add(Tag, opts).get(Tag);
  }

  entity(name, managed) {
    if (this.system && managed !== false) {
      if (name == null) {
        if (DEBUG_NAME && process.env.NODE_ENV === "development") {
          name = `DEV_${this.system.name}:Entity`;
        }
      }
      const e = this._getEntityManager().entity(name, this.system);
      this.system._manage(e);
      return e;
    } else {
      return this._getEntityManager().entity(name);
    }
  }

  query(Tags) {
    return this._getEntityManager().query(Tags);
  }

  matching(Tags) {
    // maybe should remove this?
    return this.query(Tags).entities.slice();
  }

  // findEntity (Tags) {
  //   const q = this.query(Tags).entities;
  //   if (q.length) return q[0];
  //   else return null;
  // }

  // findTag(Tag) {
  //   const query = this.query(Tag);
  //   if (query.Tags.length !== 1) {
  //     throw new Error(
  //       `findTag() only accepts a query with one Tag, use findEntity() to match against multiple Tags`
  //     );
  //   }
  //   if (q.length) return q[0];
  //   else return null;
  // }

  findEntity(Tags) {
    const query = this.query(Tags);
    if (query.entities.length > 0) return query.entities[0];
    else return null;
  }

  findTag(Tag) {
    const query = this.query(Tag);
    if (query.Tags.length !== 1) {
      throw new Error(
        `find() only accepts a query with one Tag, use findEntity() to match against multiple Tags`
      );
    }
    if (query.entities.length > 0) return query.entities[0].get(query.Tags[0]);
    return null;
  }

  get entities() {
    return this._getEntityManager().entities;
  }

  hasSystem(System) {
    return this._getSystemMap().has(System);
  }

  getSystem(System) {
    return this._getSystemMap().get(System);
  }

  getAllSystems() {
    return this._getSystemList();
  }

  removeAllSystems() {
    const systemList = this._getSystemList();
    for (let i = systemList.length - 1; i >= 0; i--) {
      const System = systemList[i].System;
      this.removeSystem(System);
    }
  }

  setConfig(Tag, props = {}) {
    this._getConfigurations().set(Tag, props);
  }

  hasConfig(Tag) {
    return this._getConfigurations().has(Tag);
  }

  getConfig(Tag) {
    return this._getConfigurations().get(Tag);
  }

  removeConfig(Tag) {
    if (this.hasConfig(Tag)) this._getConfigurations().delete(Tag);
  }

  addSystem(System, attribs = {}) {
    if (typeof System !== "function") {
      throw new Error(`The first parameter of addSystem() must be a function`);
    }

    if (this.hasSystem(System)) {
      throw new Error(
        `The World already registered the System "${System.name}"`
      );
    }

    const systemList = this._getSystemList();
    const systemMap = this._getSystemMap();

    if (
      IS_DEV &&
      systemList.some((sys) => {
        return sys.System.name === System.name;
      })
    ) {
      console.warn(
        `⚠️ You already have a different System registered by the name "${System.name}", maybe you forgot to rename it?`
      );
    }

    const state = new SystemState(this, System);
    systemList.push(state);
    systemMap.set(System, state);

    const fragment = this._fragment(state);
    let result = System(fragment, attribs);
    if (isPromise(result)) {
      result = result.then((instance) => {
        state.instance = instance;
        state.loading = false;
        state.loaded = true;
        return state;
      });
      state.promise = result;
    } else {
      state.instance = result;
      state.promise = Promise.resolve(state);
      state.loading = false;
      state.loaded = true;
    }
    runAll(this.root._subscribers);
    return state.promise;
  }

  removeSystem(System) {
    if (typeof System !== "function") {
      throw new Error(
        `The first parameter of removeSystem() must be a function`
      );
    }

    if (!this.hasSystem(System)) {
      console.warn(
        `Trying to unregister the System "${System.name}" that is no longer in this World`
      );
      return;
    }

    const systemList = this._getSystemList();
    const systemMap = this._getSystemMap();
    const state = systemMap.get(System);
    systemMap.delete(System);
    spliceObject(systemList, state);
    if (state.instance && typeof state.instance.dispose === "function") {
      state.instance.dispose();
    }
    state._dispose();
    runAll(this.root._subscribers);
  }

  process(ev) {
    const systemList = this._getSystemList();
    for (let i = 0; i < systemList.length; i++) {
      const state = systemList[i];
      const instance = state.instance;
      if (state.loaded) {
        state._poll();
        if (instance && state.enabled) {
          if (typeof instance === "function") instance(ev);
          else if (typeof instance.process === "function") instance.process(ev);
        }
        state._flush();
      }
    }
    this._getEntityManager().flush();
  }
}

class WorldRoot extends WorldFragment {
  constructor({ initialCapacity = 0 } = {}) {
    super();
    this.root = this;
    this._configurations = new Map();
    this._entityManager = new EntityManager({ initialCapacity });
    this._systemMap = new Map();
    this._systemList = [];
    this._subscribers = [];
  }
}
