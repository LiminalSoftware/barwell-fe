var calcSpans = module.exports = function (levels, groups) {
	var span = {}
	var isBroken

	groups.forEach(function (g) {span[g] = 1 })

	return levels.reverse().map(function (level, idx) {
		isBroken = false
		level.spans = {}
		var prev = levels[idx - 1]
		var next = levels[idx + 1]

		groups.forEach(function(group) {
			if (prev && prev[group] !== level[group] || isBroken) {
				isBroken = true
				span[group] = 1
			}
			if (!next || next[group] !== level[group]) level.spans[group] = span[group]
			else level.spans[group] = 0
			span[group]++
		})
		return level
	}).reverse()
}
