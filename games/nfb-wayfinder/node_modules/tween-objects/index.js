var ObjectTween = require('./lib/object')
var GroupTween = require('./lib/group')

module.exports = function(element, opt) {
    var tween = Array.isArray(element) 
            ? new GroupTween(element, opt)
            : new ObjectTween(element, opt)
    return tween
}