import ObjectPool from "../util/ObjectPool";
import { spliceObject } from "../util/array";

class QueryEvent {
  constructor() {
    this.entity = null;
    this.active = true;
    this.added = false;
  }

  reset(entity, added) {
    this.entity = entity;
    this.added = added;
    this.active = true;
  }

  prepare() {
    this.entity._queuedEvents++;
  }

  process() {
    if (this.active) {
      this.active = false;
      this.entity._queuedEvents--;
    }
  }
}

class QueryEventPool extends ObjectPool {
  constructor(opt = {}) {
    super({
      ...opt,
      name: "QueryEvent",
      create() {
        return new QueryEvent();
      },
    });
  }
}

class QueryListenerState {
  constructor(query) {
    this.added = [];
    this.removing = [];
    this.changed = false;
    this.query = query;
  }
  dispose() {
    // overridden by World
  }
}

export default class QueryListener {
  constructor(query) {
    this._eventPool = new QueryEventPool();
    this._unprocessed_queue = [];
    this.state = new QueryListenerState(query);
    this._attach();
  }

  _nextQueuedMatching(entity) {
    for (let i = 0; i < this._unprocessed_queue.length; i++) {
      const ev = this._unprocessed_queue[i];
      if (ev.active && ev.entity === entity) return ev;
    }
    return null;
  }

  _attach() {
    if (this._handler) return;
    this._handler = (e, added) => {
      const ev = this._eventPool.next();
      ev.reset(e, added);
      ev.prepare();
      this._unprocessed_queue.push(ev);
    };
    this.state.query._addListener(this._handler);

    // initially add all the entities already matching
    for (let i = 0; i < this.state.query.entities.length; i++) {
      const e = this.state.query.entities[i];
      this._handler(e, true);
    }
  }

  detach() {
    this.poll();
    this.flush();
    if (this._handler) {
      this.state.query._removeListener(this._handler);
      this._handler = null;
    }
  }

  flush() {
    this.state.added.length = 0;
    this.state.removing.length = 0;
    this.state.changed = false;
    return this;
  }

  poll() {
    for (let i = 0; i < this._unprocessed_queue.length; i++) {
      const ev = this._unprocessed_queue[i];
      if (ev.active) {
        ev.process();
        if (ev.added) this.state.added.push(ev.entity);
        else this.state.removing.push(ev.entity);
        this._eventPool.release(ev);
        this.state.changed = true;
      }
    }
    this._unprocessed_queue.length = 0;
    return this;
  }
}
