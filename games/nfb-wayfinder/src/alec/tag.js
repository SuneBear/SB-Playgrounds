export function copyArray(src, dst) {
  if (!src) return src;
  if (!dst) return src.slice();
  dst.length = src.length;
  for (let i = 0; i < src.length; i++) {
    dst[i] = src[i];
  }
  return dst;
}

export function copyObject(src, dst) {
  if (!src) return src;
  if (!dst) {
    dst = {};
  } else {
    // object exists, ensure it's empty
    for (let k in dst) {
      if (dst.hasOwnProperty(k)) delete dst[k];
    }
  }
  // copy over source props
  for (let k in src) {
    if (src.hasOwnProperty(k)) {
      dst[k] = src[k];
    }
  }
  return dst;
}

export function copyRef(src) {
  return src;
}

export function copyInstance(src, dest) {
  if (!src) return src;
  if (!dest) return src.clone();
  return dest.copy(src);
}

export const cloneInstance = (src) => src && src.clone();

export const cloneRef = (src) => src;

export const cloneArray = (src) => src && src.slice();

export const cloneObject = (src) => Object.assign({}, src);

export const Types = {
  Object: (initial = {}) => ({
    initial,
    clone: cloneObject,
    copy: copyObject,
  }),
  Array: (initial = []) => ({
    initial,
    clone: cloneArray,
    copy: copyArray,
  }),
  Ref: (initial) => ({
    initial,
    clone: cloneRef,
    copy: copyRef,
  }),
};

export class Tag {
  static isTag = true;
}

export class Value extends Tag {
  static value = Types.Ref(null);
  static isValue = true;
  constructor() {
    super();
    fixSchemaProp(this.constructor, "value");
    const prop = this.constructor.value;
    this.value = prop.clone(prop.initial);
  }
  reset() {
    const prop = this.constructor.value;
    this.value = prop.copy(prop.initial, this.value);
  }
}

export class Data extends Tag {
  static data = {};
  static isData = true;
  constructor() {
    super();
    const data = this.constructor.data;
    for (let k in data) {
      if (data.hasOwnProperty(k)) {
        fixSchemaProp(data, k);
        const prop = data[k];
        this[k] = prop.clone(prop.initial);
      }
    }
  }
  reset() {
    const data = this.constructor.data;
    for (let k in data) {
      if (data.hasOwnProperty(k)) {
        const prop = data[k];
        this[k] = prop.copy(prop.initial, this[k]);
      }
    }
  }
}

function fixSchemaProp(schema, k) {
  const prop = schema[k];
  if (Array.isArray(prop)) {
    schema[k] = Types.Array(schema[k]);
  } else if (typeof prop === "object" && prop) {
    if (typeof prop.copy !== "function" || typeof prop.clone !== "function") {
      throw new Error(
        "The static schema must be a Types value, or a primitive (number, boolean, string, shallow array, null/undefined)"
      );
    } else {
      // all good !
    }
  } else {
    schema[k] = Types.Ref(schema[k]);
  }
}
