var inherits = require('inherits')
var lerp = require('lerp-array')
var BaseTween = require('tween-base')
var endTarget = require('./end-target')

function ObjectTween(target, opt) {
    BaseTween.call(this, opt)
    this.target = target
    this.endings = undefined
    this._options = opt
}

inherits(ObjectTween, BaseTween)

ObjectTween.prototype.ready = function() {
    this.endings = endTarget(this.target, this._options)
}

ObjectTween.prototype.lerp = function(alpha) {
    for (var i=0; i<this.endings.length; i++) {
        var t = this.endings[i]
        var k = t.key
        this.target[k] = lerp(t.start, t.end, alpha, this.target[k])
    }
}

module.exports = ObjectTween