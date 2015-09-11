var calcSpans = module.exports = function (levels, groups) {
	var span = {}

	groups.forEach(function (g) {span[g] = 1 })

	return levels.reverse().map(function (level, idx) {
		var isBroken = false
		level.spans = {}
		var prev = levels[idx - 1]
		var next = levels[idx + 1]

		groups.forEach(function(group) {

			if (!next || next[group] !== level[group]) isBroken = true
			if (isBroken) level.spans[group] = span[group]
			else level.spans[group] = 0

			if (isBroken) span[group] = 1
			else span[group]++
		})
		return level
	}).reverse()
}
