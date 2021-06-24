# tween-ticker

[![stable](http://badges.github.io/stability-badges/dist/stable.svg)](http://github.com/badges/stability-badges)

A generic low-level ticker for tweening engines. Stacks tweens and then, on each tick, steps through them to update them to their interpolated (and eased) values. 

This is the building blocks for [tweenr](https://www.npmjs.org/package/tweenr), but can be useful on its own for [modular components](https://github.com/mattdesl/tweenr/tree/master/test/fancy-box/index.js)

Does not assume any standard set of eases, and uses linear (i.e. no ease) by default.

```js
var Ticker = require('tween-ticker')
var ticker = Ticker()

//the thing we want tweened
var target = {
    position: [0, 0],
    opacity: 0
}

//get a new tween to the given ending state
var tween = ticker.to(target, { position: [2, 4], opacity: 1, duration: 1 })

//step the ticker by a delta time
ticker.tick(0.5)

console.log(target.position) // -> [ 1, 2 ]
console.log(target.opacity)  // -> 0.5

//optionally we can cancel the tween to stop it from running anymore
tween.cancel()
```

## Usage

[![NPM](https://nodei.co/npm/tween-ticker.png)](https://nodei.co/npm/tween-ticker/)

#### `ticker = Ticker([opt])`

Creates a ticker with some options:

- `eases` a map of ease functions that users can pass by string in the tween options, defaults to an empty object
- `defaultEase` a string or function that represents the default easing when the user does not specify one, defaults to a [linear function](https://github.com/mattdesl/eases/blob/master/linear.js)

#### `tween = ticker.to(tween)`

If only one argument is given, this method pushes a new tween onto the stack, returning that tween for chaining. Same as `ticker.push(tween)`. 

#### `tween = ticker.to(element, opt)`

A convenience version of `to()` which handles the most common case: object tweening. If the second argument, `opt` is truthy and an object, this method creates a new [object tween](https://www.npmjs.org/package/tween-objects) and pushes it onto the stack.

The tween modifies `element`, which can be an array of objects, or a single object. `opt` can be the following:

- `delay` in time units, default 0
- `duration` in time units, default 0
- `ease` is a string (lookup for the `eases` passed at constructor) or an [ease function](https://www.npmjs.org/package/eases), defaults to `ticker.defaultEase`

Any other properties to `opt` will be tweened if *they are consistent with `element`* and also if they are a `number` or [an array](https://www.npmjs.org/package/an-array).

```js
var elements = [
    { x: 25, shape: [10, 5] },
    { x: 15, opacity: 0 }
]

var tween = ticker.to(elements, { 
    opacity: 1,
    shape: [5, 0],
    duration: 3,
    delay: 0.25
})

/*
    after tween is finished, element will equal:
    [
        { x: 25, shape: [5, 0] },
        { x: 15, opacity: 1 }
    ]
*/
```

#### `tween = ticker.to()`

If no arguments are given, this method creates an "empty" or dummy tween that can be cancelled. This is similar to the way `noop` functions are used to avoid conditionals in functional programming. 

#### `ticker.push(tween)`

Pushes a generic tween object onto the stack. Like `ticker.to(tween)` but more explicit.

```js
var array = require('tween-array')
ticker.push(array(start, end, { duration: 5 }))
    .on('complete', doSomething)
```

#### `ticker.cancel()`

Clears and cancels all tweens stored in this ticker. `ticker.clear()` is an alias for this method. Returns this for chaining.

#### `ticker.tick([dt])`

Ticks the tween engine forward by the given delta time (or `1/60` if not specified). 

--

The return value of `ticker.to()` is a tween with the following methods:

#### `tween.cancel()`

Cancels the tween, removing it from the queue on the next tick without applying any further interpolation. 

#### `tween.on(event, func)`

The returned tween is an event emitter with the following events:

- `start` triggered when the tween is first started
- `cancelling` triggered before the tween completes, initiating from a call to `cancel()`
- `complete` triggered when the tween is completed
- `update` triggered after the tween updates its values

## License

MIT, see [LICENSE.md](http://github.com/mattdesl/tween-ticker/blob/master/LICENSE.md) for details.
