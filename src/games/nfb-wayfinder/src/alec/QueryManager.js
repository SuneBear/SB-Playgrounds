import { spliceOne, spliceObject } from "../util/array";

const getTagID = (() => {
  const map = new WeakMap();
  let id = 0;
  return function getTagID(Tag) {
    if (!map.has(Tag)) {
      map.set(Tag, id++);
    }
    return map.get(Tag);
  };
})();

class Query {
  constructor(Tags, id) {
    this.Tags = Tags;
    this.id = id;
    this._entities = [];
    this._listeners = null;
  }

  equals(other) {
    return this.id === other.id;
  }

  get entities() {
    return this._entities;
  }

  get names() {
    return this.Tags.map((Tag) => Tag.name);
  }

  _addEntity(e) {
    this._entities.push(e);
    if (this._listeners) {
      this._listeners.forEach((cb) => cb(e, true));
    }
  }

  _removeEntity(e) {
    const idx = this._entities.indexOf(e);
    if (idx >= 0) {
      spliceOne(this._entities, idx);
      if (this._listeners) {
        this._listeners.forEach((cb) => cb(e, false));
      }
    }
  }

  _addListener(cb) {
    if (!this._listeners) this._listeners = [];
    this._listeners.push(cb);
  }

  _removeListener(cb) {
    if (this._listeners) {
      spliceObject(this._listeners, cb);
    }
  }
}

Query.prototype.isQuery = true;

export default class QueryManager {
  constructor(entityManager) {
    this._entityManager = entityManager;
    this.queries = {};
  }

  _buildQueryKey(Tags) {
    if (Array.isArray(Tags)) {
      const list = [];
      for (let i = 0; i < Tags.length; i++) {
        list.push(getTagID(Tags[i]));
      }
      list.sort();
      return list.join(":");
    } else {
      return String(getTagID(Tags));
    }
  }

  _onEntityUpdated(entity) {
    for (let k in this.queries) {
      const query = this.queries[k];
      this._updateQueryEntity(query, entity);
    }
  }

  query(Tags) {
    if (!Tags)
      throw new Error(
        `You must pass a Tag, multiple Tags, or Query object to query()`
      );

    // Fast path, we assume this has been keyed up already
    if (Tags.isQuery) return Tags;

    const id = this._buildQueryKey(Tags);

    let q = this.queries[id];

    // query exists, return that
    if (q) return q;

    // query doesn't exist yet, create it
    const tagList = (Array.isArray(Tags) ? Tags : [Tags]).filter(Boolean);
    if (tagList.length === 0) {
      throw new Error("Must specify at least one Tag for query()");
    }
    const query = new Query(tagList, id);
    this._populateQuery(query);
    this.queries[id] = query;
    return query;
  }

  _populateQuery(query) {
    for (let i = 0; i < this._entityManager.entities.length; i++) {
      const e = this._entityManager.entities[i];
      this._updateQueryEntity(query, e);
    }
  }

  _shouldEntityExistInQuery(query, entity) {
    return entity.alive && entity.enabled && entity.hasAll(query.Tags);
  }

  _updateQueryEntity(query, entity) {
    const entityInQueryIdx = query.entities.indexOf(entity);
    const existsInQuery = entityInQueryIdx >= 0;
    // the entity has all those components
    let shouldExistInQuery = this._shouldEntityExistInQuery(query, entity);
    // needs to be added or removed
    if (existsInQuery !== shouldExistInQuery) {
      if (shouldExistInQuery) query._addEntity(entity);
      else query._removeEntity(entity);
    }
  }
}
