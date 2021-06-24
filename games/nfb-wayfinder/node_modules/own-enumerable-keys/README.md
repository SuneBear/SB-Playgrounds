# own-enumerable-keys

[![frozen](http://badges.github.io/stability-badges/dist/frozen.svg)](http://github.com/badges/stability-badges)

Gets own property names and Symbols that are enumerable. 

Implementation from Sindre Sorhus' [object-assign](https://github.com/sindresorhus/object-assign) ponyfill.

## Install

```sh
npm install own-enumerable-keys --save
```

## Example

```js
var keys = require('own-enumerable-keys')
var zip = Symbol('zip')

var obj = {
  foo: 'bar',
  blah: 'foo',
  [zip]: 'foobar'
}

keys(obj)
//=> ['foo', 'blah', Symbol(zip)]
```

## Usage

[![NPM](https://nodei.co/npm/own-enumerable-keys.png)](https://www.npmjs.com/package/own-enumerable-keys)

#### `keys = ownEnumerableKeys(obj)`

For the given `obj`, returns a list of keys which represent its enumerable and *own* property and Symbol names.

See also:

- [propertyIsEnumerable()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/propertyIsEnumerable)
- [getOwnPropertyNames()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getOwnPropertyNames)
- [getOwnPropertySymbols()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getOwnPropertySymbols)

## License

MIT, see [LICENSE.md](http://github.com/mattdesl/own-enumerable-keys/blob/master/LICENSE.md) for details.
