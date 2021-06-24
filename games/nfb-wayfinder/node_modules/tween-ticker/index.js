var linear = require('eases/linear')
var createTween = require('tween-objects')
var BaseTween = require('tween-base')

function TweenTicker (opt) {
  if (!(this instanceof TweenTicker)) {
    return new TweenTicker(opt)
  }
  opt = opt || {}
  this.stack = []
  this.defaultEase = opt.defaultEase || linear
  this.eases = opt.eases || {}
  this._applyEase = this.ease.bind(this)
}

TweenTicker.prototype.cancel = function () {
  for (var i = 0; i < this.stack.length; i++) {
    var t = this.stack[i]
    // cancel each and force it to complete
    t.cancel()
    t.tick(0)
  }
  this.stack.length = 0
  return this
}

// no longer used, backward-compatible
TweenTicker.prototype.clear = TweenTicker.prototype.cancel

TweenTicker.prototype.to = function (element, opt) {
  var tween = element
  if (opt && typeof opt === 'object') {
    tween = createTween(element, opt)
  } else if (!element && !opt) {
    tween = new BaseTween()
  } else if (!isTween(tween)) { // to avoid programmer error
    throw new Error('must provide options or a tween object')
  }
  return this.push(tween)
}

TweenTicker.prototype.push = function (tween) {
  this.stack.push(tween)
  return tween
}

TweenTicker.prototype.tick = function (dt, ease) {
  ease = typeof ease === 'function' ? ease : this._applyEase
  dt = typeof dt === 'number' ? dt : 1 / 60

  // for all queued tweens, tick them forward (i.e. DOM read)
  for (var i = 0; i < this.stack.length; i++) {
    this.stack[i].tick(dt, ease)
  }

  // now sync their states (i.e. DOM write)
  sync(this.stack)

  // now kill any inactive tweens
  for (i = this.stack.length - 1; i >= 0; i--) {
    if (!this.stack[i].active) {
      this.stack.splice(i, 1)
    }
  }
}

// determines which easing function to use based on user options
TweenTicker.prototype.ease = function (tween, alpha) {
  var ease = tween.ease || this.defaultEase
  if (typeof ease === 'string') {
    ease = this.eases[ease]
  }
  if (typeof ease !== 'function') {
    ease = linear
  }
  return ease(alpha)
}

// mainly intended as a safeguard against potential user error
function isTween (tween) {
  return (typeof tween.tick === 'function' &&
  typeof tween.cancel === 'function')
}

function sync (tweens) {
  for (var i = 0; i < tweens.length; i++) {
    var tween = tweens[i]
    if (typeof tween.sync === 'function') {
      tween.sync()
    }
  }
}

module.exports = TweenTicker
