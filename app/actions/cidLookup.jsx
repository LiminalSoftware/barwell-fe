
// a lookup from cid to an array of promises that are waiting for that cid
var _cidPromises = {}

// a lookup from cid to the permanent id
var _cidLookup = {}

// resolves when the cid provided has a permanent id assigned
var makeCidPromise =  module.exports.makeCidPromise = function (cid) {
	if (cid in _cidLookup) return Promise.resolve(_cidLookup[cid])
	else return new Promise(function (resolve, reject) {
		_cidPromises[cid] = (_cidPromises[cid] || []).concat(resolve)
	})
}


// takes a clean object and resolves any promises that were wating for the id
var resolveCidPromise = module.exports.resolveCidPromise = function (obj, pk) {
	var cid = obj.cid
	var id = obj[pk]
	
	if (cid && id) {
		_cidLookup[cid] = id;
		(_cidPromises[cid] || []).map(p => p(id))
	}
}