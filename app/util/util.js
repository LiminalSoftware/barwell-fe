module.exports.clean = function (obj) {
	obj._dirty = false
	return obj
}

module.exports.choose = function (obj, keys) {
	return keys.map(function (key) {
		return obj[key]
	})
}