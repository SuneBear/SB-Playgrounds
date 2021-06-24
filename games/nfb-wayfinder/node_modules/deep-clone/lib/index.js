"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = deepClone;
exports.formatKeys = formatKeys;
function deepClone(obj, format) {
  var refs = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : new Map();

  var cloned = refs.get(obj);
  if (cloned) return cloned;
  if (Array.isArray(obj)) {
    var _clone = [];
    refs.set(obj, _clone);
    for (var i = 0; i < obj.length; i++) {
      _clone[i] = deepClone(obj[i], format, refs);
    }
    return _clone;
  }
  if (obj instanceof Date) return new Date(obj.valueOf());
  if (!(obj instanceof Object)) return obj;
  var clone = {};
  refs.set(obj, clone);
  var keys = Object.keys(obj);
  for (var _i = 0; _i < keys.length; _i++) {
    var key = format ? format(keys[_i]) : keys[_i];
    clone[key] = deepClone(obj[keys[_i]], format, refs);
  }
  return clone;
}

function formatKeys(format) {
  return function (obj) {
    return deepClone(obj, format);
  };
}

deepClone.formatKeys = formatKeys;