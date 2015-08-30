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

export default consolidate