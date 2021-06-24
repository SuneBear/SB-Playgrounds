import ObjectPool from "../util/ObjectPool";
import Entity from "./Entity";
import QueryManager from "./QueryManager";
import { spliceOne, spliceObject } from "../util/array";

class TagPool extends ObjectPool {
  constructor(Tag, opt = {}) {
    super({
      ...opt,
      initialCapacity: 50,
      name: `TagPool-${Tag.name}`,
      create() {
        return new Tag();
      },
      release(tag) {
        if (typeof tag.reset === "function") tag.reset();
      },
    });
  }
}

class EntityPool extends ObjectPool {
  constructor(entityManager, opt = {}) {
    super({
      ...opt,
      name: "Entities",
      create() {
        return new Entity(entityManager);
      },
      release(e) {
        e.reset();
      },
    });
  }
}

export default class EntityManager {
  constructor({ initialCapacity = 0 } = {}) {
    this._entities = [];
    this._entitiesToRemove = [];
    this._tagPools = new Map();
    this._entityPool = new EntityPool(this, { initialCapacity });
    this._queryManager = new QueryManager(this);
  }

  query(Tags) {
    return this._queryManager.query(Tags);
  }

  get entities() {
    return this._entities;
  }

  entity(name, system) {
    const e = this._entityPool.next();
    e.reset();
    e._alive = true;
    e.name = name;
    e.system = system || null;
    this._entities.push(e);
    return e;
  }

  // clears entities that are finished processing and have been removed
  flush() {
    const entitiesToRemove = this._entitiesToRemove;
    for (let i = entitiesToRemove.length - 1; i >= 0; i--) {
      const e = entitiesToRemove[i];
      // do not remove entities that are still being processed by a system
      if (!e.processed) continue;
      // remove the entity from the set
      spliceObject(this._entities, e);
      // remove all components once entity is truly killed
      e.removeAll();
      // release the entity back into the pool
      this._entityPool.release(e);
      // splice this off the list
      spliceOne(entitiesToRemove, i);
    }
  }

  createTag(Tag) {
    let pool = this.getTagPool(Tag);
    return pool.next();
  }

  getTagPool(Tag) {
    let pool = this._tagPools.get(Tag);
    if (!pool) {
      pool = new TagPool(Tag);
      this._tagPools.set(Tag, pool);
    }
    return pool;
  }

  releaseTag(Tag, tag) {
    const p = this._tagPools.get(Tag);
    if (p) p.release(tag);
  }

  _onEntityUpdated(entity) {
    this._queryManager._onEntityUpdated(entity);
  }

  _markEntityForRemoval(entity) {
    this._entitiesToRemove.push(entity);
    this._onEntityUpdated(entity);
  }
}
