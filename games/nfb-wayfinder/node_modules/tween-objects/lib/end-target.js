var BaseTween = require('tween-base')
var isArray = require('an-array')
var ownKeys = require('own-enumerable-keys')
var ignores = ownKeys(new BaseTween())

module.exports = function getTargets(element, opt) {
    var targets = []
    var optKeys = ownKeys(opt)

    for (var k in opt) { 
        //copy properties as needed
        if (optKeys.indexOf(k) >= 0 &&
                k in element &&
                ignores.indexOf(k) === -1) {
            var startVal = element[k]
            var endVal = opt[k]
            if (typeof startVal === 'number'
                 && typeof endVal === 'number') {
                targets.push({ 
                    key: k, 
                    start: startVal, 
                    end: endVal 
                })
            }
            else if (isArray(startVal) && isArray(endVal)) {
                targets.push({ 
                    key: k, 
                    start: startVal.slice(), 
                    end: endVal.slice() 
                })
            }
        }
    }
    return targets
}