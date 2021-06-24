var inherits = require('inherits')
var lerp = require('lerp-array')
var BaseTween = require('tween-base')
var endTarget = require('./end-target')

function GroupTween(target, opt) {
    BaseTween.call(this, opt)
    this.target = target
    this.end = []
    this._options = opt
}

inherits(GroupTween, BaseTween)

GroupTween.prototype.ready = function() {
    this.end = this.target.map(function(t) {
        return endTarget(t, this._options)
    }, this)
}

GroupTween.prototype.lerp = function(alpha) {
    for (var j=0; j<this.end.length; j++)  {
        var endings = this.end[j]
        var target = this.target[j]
        for (var i=0; i<endings.length; i++) {
            var t = endings[i]
            var k = t.key
            target[k] = lerp(t.start, t.end, alpha, target[k])    
        }
    }
}

module.exports = GroupTween