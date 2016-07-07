var containsCids = module.exports.containsCids = function (obj) {
	if (obj instanceof Array) return obj.some(containsCids)
	return Object.keys(obj).some(key => /ac\d+/.test(key))
}

var updatePendingTxns = module.exports.updatePendingTxns = function (transactions, column) {
	
}