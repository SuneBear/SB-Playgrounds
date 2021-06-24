# tween-objects

[![stable](http://badges.github.io/stability-badges/dist/stable.svg)](http://github.com/badges/stability-badges)

Tweens an object or an array of objects, operating on numbers and [array types](https://www.npmjs.org/package/an-array). [tweenr](https://www.npmjs.org/package/tweenr) uses this tween by default, since it is the most common case.

```js
var Tween = require('tween-objects')

var elements = [
    { opacity: 0 },
    { opacity: 0, position: [0, 0] }
]

var tween = Tween(elements, { duration: 1, opacity: 1, position: [5, 10] })
        .on('complete', handler)
tween.tick(0.5)

console.log(elements[0].opacity)  // -> 0.5
console.log(elements[1].position) // -> [2.5, 5]
```

## Usage

[![NPM](https://nodei.co/npm/tween-objects.png)](https://nodei.co/npm/tween-objects/)

#### `tween = ObjectTween(element, opt)`

Creates a new tween where `element` is an object or an array of objects. 

## License

MIT, see [LICENSE.md](http://github.com/mattdesl/tween-objects/blob/master/LICENSE.md) for details.
