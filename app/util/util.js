var _ = require('underscore')

// fix javascript modulo bug
Number.prototype.mod = function(n) {
    return ((this%n)+n)%n;
};

var stripInternalVars = module.exports.stripInternalVars = function (obj) {
  var newObj = {}
  Object.keys(obj || {}).forEach(function (key) {
    if (key.slice(0,1) !== '_') newObj[key] = obj[key];
  });
  return newObj;
}

module.exports.clean = function (obj) {
	obj._dirty = false
	obj._server = stripInternalVars(obj)
	return obj
}

var limit = module.exports.limit = function (min, max, value) {
	if (value < min) return min
	if (value > max) return max
	else return value
}


var isClean = module.exports.isClean = function (obj) {
  return _.isEqual(stripInternalVars(obj), stripInternalVars(obj._server))
}

var isDirty = module.exports.isDirty = function (obj) {
  return !isClean(obj)
}

module.exports.choose = function (obj, keys) {
	return keys.map(function (key) {
		return obj[key]
	})
}

module.exports.returnFalse  = function() {
	return false;
}


module.exports.nest = function (levels, groups) {
	var group = groups[0]
	var result = []
	var lo = 0
	while (lo < levels.length) {
		var hi = lo
		var current = {}
		current[group] = levels[lo][group]
		while (hi + 1 < levels.length && levels[lo][group] === levels[hi + 1][group]) hi++
		if (groups.length > 1) {
			current.children = nest(levels.slice(lo, hi + 1), groups.slice(1))
			current.count = current.children
				.map(function (child) {return child.count || 1})
				.reduce(function (a,b) {return a + b}, 0)
		}
		result.push(current)
		lo = hi + 1
	}
	return result
}
