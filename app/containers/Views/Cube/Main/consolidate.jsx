var consolidate = function (levels, groups) {
	var prev = {}
	var span = {}
	var isBroken
	groups.forEach(function(group) {
		var aGroup = 'a' + group
		prev[aGroup] = null
		span[aGroup] = 1
	})
	return levels.reverse().map(function (level) {
		isBroken = false
		level.spans = {}
		groups.forEach(function(group) {
			var aGroup = 'a' + group
			if (prev[aGroup] !== level[aGroup]) isBroken = true
			span[aGroup] = isBroken ? 1 : span[aGroup] + 1
			level.spans[aGroup] = span[aGroup]
			prev[aGroup] = level[aGroup]
		})
		return level
	}).reverse()
}

var nest = function (levels, groups) {
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

export default consolidate
