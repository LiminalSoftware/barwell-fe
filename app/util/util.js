module.exports.clean = function (obj) {
	obj._dirty = false
	return obj
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
