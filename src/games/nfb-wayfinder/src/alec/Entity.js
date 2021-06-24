const IS_DEV = process.env.NODE_ENV === "development";

class EntityRef {
  constructor(entity) {
    this.entity = entity;
  }

  get alive() {
    return this.entity ? this.entity.alive : false;
  }

  kill() {
    if (this.entity) this.entity.kill();
  }
}

export default class Entity {
  constructor(entityManager) {
    this._alive = false;
    this._enabled = true;
    this._entityManager = entityManager;
    this.system = null;
    this.name = null;
    this.Tags = new Map();
    this._queuedEvents = 0;
    this._refs = null;
    this._removeTagInstance = (instance, Tag) => {
      if (Tag.isData || Tag.isValue) {
        this._entityManager.releaseTag(Tag, instance);
      }
    };
  }

  ref() {
    const ref = new EntityRef(this);
    if (!this._refs) this._refs = [];
    this._refs.push(ref);
    return ref;
  }

  reset() {
    this.removeAll();
    this.system = null;
    this._alive = false;
    this._enabled = true;
    this.name = undefined;
    this._queuedEvents = 0;
  }

  add(Tag, values) {
    if (!Tag) throw new Error(`Must specify a Tag`);
    if (typeof Tag !== "function") {
      throw new Error(`Tags must be functions or classes`);
    }
    // if we already have this tag, clean up the old one
    if (this.has(Tag)) {
      this._directRemoveTag(Tag);
    }
    let tag;
    if (Tag.isData) {
      tag = this._entityManager.createTag(Tag);
      for (let k in values) {
        if (values.hasOwnProperty(k)) {
          if (Tag.data.hasOwnProperty(k)) {
            const prop = Tag.data[k];
            tag[k] = prop.copy(values[k], tag[k]);
          } else if (IS_DEV) {
            console.warn(
              `No property "${k}" found on the Data tag ${Tag.name}`
            );
          }
        }
      }
    } else if (Tag.isValue) {
      tag = this._entityManager.createTag(Tag);
      if (typeof values !== "undefined") {
        const prop = Tag.value;
        tag.value = prop.copy(values, tag.value);
      }
    } else {
      tag = Tag;
    }
    this.Tags.set(Tag, tag);
    this._tagAdded(Tag);
    return this;
  }

  set(Tag, values) {
    if (!this.has(Tag)) {
      this.add(Tag, values);
    } else if (Tag.isData) {
      const tag = this.getTag(Tag);
      for (let k in values) {
        if (values.hasOwnProperty(k)) {
          if (Tag.data.hasOwnProperty(k)) {
            const prop = Tag.data[k];
            tag[k] = prop.copy(values[k], tag[k]);
          } else if (IS_DEV) {
            console.warn(
              `No property "${k}" found on the Data tag ${Tag.name}`
            );
          }
        }
      }
    } else if (Tag.isValue && typeof values !== "undefined") {
      const tag = this.getTag(Tag);
      const prop = Tag.value;
      tag.value = prop.copy(values, tag.value);
    }
    return this;
  }

  _directRemoveTag(Tag) {
    if (Tag.isData || Tag.isValue) {
      const instance = this.Tags.get(Tag);
      this._entityManager.releaseTag(Tag, instance);
    }
    this.Tags.delete(Tag);
  }

  remove(Tag) {
    if (this.has(Tag)) {
      this._directRemoveTag(Tag);
      this._tagRemoved(Tag);
    }
    return this;
  }

  removeAll(Tags) {
    if (this.Tags.size > 0) {
      this.Tags.forEach(this._removeTagInstance);
      this.Tags.clear();
      this._update();
    }
    return this;
  }

  get(Tag) {
    const t = this.getTag(Tag);
    if (Tag.isValue) return t.value;
    return t;
  }

  getTag(Tag) {
    if (!this.has(Tag)) {
      throw new Error(`The Tag ${Tag.name} is not part of this Entity`);
    }
    return this.Tags.get(Tag);
  }

  getTagEntries() {
    return Array.from(this.Tags.entries());
  }

  has(Tag) {
    return this.Tags.has(Tag);
  }

  hasAll(Tags) {
    for (let i = 0; i < Tags.length; i++) {
      const Tag = Tags[i];
      if (!this.has(Tag)) return false;
    }
    return true;
  }

  hasAny(Tags) {
    for (let i = 0; i < Tags.length; i++) {
      const Tag = Tags[i];
      if (this.has(Tag)) return true;
    }
    return false;
  }

  get alive() {
    return this._alive;
  }

  get enabled() {
    return this._enabled;
  }

  get processed() {
    return this._queuedEvents === 0;
  }

  // alias to add only if tag doesn't exist
  tagOn(Tag, values) {
    if (!this.has(Tag)) this.add(Tag, values);
    return this;
  }

  // alias to disable only if tag exists
  tagOff(Tag) {
    this.remove(Tag);
    return this;
  }

  enable() {
    if (!this._enabled) {
      this._enabled = true;
      this._update();
    }
    return this;
  }

  disable() {
    if (this._enabled) {
      this._enabled = false;
      this._update();
    }
    return this;
  }

  unmanage() {
    if (this.system) {
      this.system._unmanage(this);
      this.system = null;
    }
  }

  kill() {
    if (this.system) this.unmanage();
    if (this._alive) {
      this._alive = false;
      this._entityManager._markEntityForRemoval(this);
    }
    if (this._refs) {
      // clear refs
      for (let i = 0; i < this._refs.length; i++) {
        this._refs[i].entity = null;
      }
      // de-reference the array
      this._refs = null;
    }
    return this;
  }

  _tagAdded(Tag) {
    // TODO: optimization here for add-only case
    this._update();
  }

  _tagRemoved(Tag) {
    // TODO: optimization here for remove-only case
    this._update();
  }

  _update() {
    this._entityManager._onEntityUpdated(this);
  }
}
