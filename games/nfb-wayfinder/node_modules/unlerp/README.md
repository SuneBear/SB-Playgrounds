[![browser support](https://ci.testling.com/mattdesl/unlerp.png)](https://ci.testling.com/mattdesl/unlerp)

# unlerp

[![frozen](http://badges.github.io/stability-badges/dist/frozen.svg)](http://github.com/badges/stability-badges)

Opposite of [lerp](https://www.npmjs.org/package/lerp); gets the range between a lower and upper bound. 

```js
var range = require('unlerp')

//result is typically between 0.0 and 1.0
var result = range(0, 50, 25) //=> 0.5

//if you want to saturate to 0.0 - 1.0
result = require('clamp')(result, 0, 1)
```

The result is not clamped. 

## Usage

[![NPM](https://nodei.co/npm/unlerp.png)](https://nodei.co/npm/unlerp/)

### ```range(min, max, value)```

Produces the normalized range of `value` between two bounds. Equivalent to:

```(value - min) / (max - min)```

## License

MIT, see [LICENSE.md](http://github.com/mattdesl/unlerp/blob/master/LICENSE.md) for details.
