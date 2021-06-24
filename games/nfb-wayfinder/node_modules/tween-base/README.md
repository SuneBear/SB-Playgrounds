# tween-base

[![unstable](http://badges.github.io/stability-badges/dist/unstable.svg)](http://github.com/badges/stability-badges)

This is a base class for tween types, built alongside [tweenr](https://www.npmjs.org/package/tweenr) and [tween-ticker](https://www.npmjs.org/package/tween-ticker). It is not inherently tied to those modules, and may prove useful outside of those environments.

Usually you won't require `tween-base` itself, but the modules that build on top of it. Example:

```js
var array = require('tween-array')
var ticker = require('tween-ticker')

var start = [25, 15],
    end = [10, 10]

ticker.push(array(start, end, { duration: 2 }))
    .on('complete', function(ev) {
        console.log("result:", ev.target)
    })
```

## Usage

[![NPM](https://nodei.co/npm/tween-base.png)](https://nodei.co/npm/tween-base/)

This describes the public (user-facing) API for tweens.

#### `tween = BaseTween(opt)`

Where options usually describes the following:

- `delay` in time units, default 0
- `duration` in time units, default 0
- `ease` is an [easing function](https://www.npmjs.org/package/eases) -- tween engines may want to allow strings for user friendliness

## methods

#### `cancel()`

Cancels a tween. Returns this for chaining. Next time this tween is ticked, it will:

- emit a `"cancelling"` event
- become inactive and stop updating the target
- emit a `"complete"` event

A ticker engine might then choose to remove the tween from the queue.

## members

#### `tween.on(event, func)`

A tween is an event emitter with the following events:

- `start` triggered when the tween is first started
- `cancelling` triggered before the tween completes, initiating from a call to `cancel()`
- `complete` triggered when the tween is completed
- `update` triggered after the tween updates its values

--

## inheriting

See [test/array.js](test/array.js) for an example of a custom array interpolation.

Implementors might subclass like so:

```js
var Base = require('tween-base')
var inherits = require('inherits')

function MyTween(target, opt) {
    Base.call(this, opt)
    this.target = target
}

inherits(MyTween, Base)

//called before 'start' event 
MyTween.prototype.ready = function() {
    //this is where you might store the current
    //state of "target" so that you can interpolate
    //from start to end
}

MyTween.prototype.lerp = function(alpha) {
    //interpolate "target" from start to end using alpha
}
```

## License

MIT, see [LICENSE.md](http://github.com/mattdesl/tween-base/blob/master/LICENSE.md) for details.
