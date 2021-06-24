export function fastAssign(target, opts) {
  if (opts) {
    for (let key in opts) {
      if (Object.prototype.hasOwnProperty.call(opts, key)) {
        target[key] = opts[key];
      }
    }
  }
}
