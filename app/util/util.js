module.exports.clean = function (obj) {
	obj._dirty = false
	return obj
}