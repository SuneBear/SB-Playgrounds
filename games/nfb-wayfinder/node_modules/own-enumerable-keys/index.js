var propIsEnumerable = Object.prototype.propertyIsEnumerable

module.exports = ownEnumerableKeys
function ownEnumerableKeys (obj) {
  var keys = Object.getOwnPropertyNames(obj)

  if (Object.getOwnPropertySymbols) {
    keys = keys.concat(Object.getOwnPropertySymbols(obj))
  }

  return keys.filter(function (key) {
    return propIsEnumerable.call(obj, key)
  })
}
