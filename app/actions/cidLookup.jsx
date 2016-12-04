
// a lookup from cid to an array of promises that are waiting for that cid
var _cidPromises = {}

// a lookup from cid to the permanent id
var _cidLookup = {}

const isLocalId = function (id) {
	return (/^[ar]c\d+$/).test(id)
}

// resolves when the cid provided has a permanent id assigned
const makeCidPromise = function (cid) {
	if (cid in _cidLookup) return Promise.resolve(_cidLookup[cid])
	else return new Promise(function (resolve, reject) {
		_cidPromises[cid] = (_cidPromises[cid] || []).concat(resolve)
	})
}


// takes a clean object and resolves any promises that were wating for the id
const resolveCidPromise = function (obj, pk) {
	var cid = obj.cid
	var id = obj[pk]
	
	if (cid && id) {
		_cidLookup[cid] = id;
		(_cidPromises[cid] || []).map(p => p(id))
	}
}

/*
 * waits until the key is available, then populates the permanent key
 */
const makeKeyPromise = function (obj, key) {
	if (obj[key] && !isLocalId(obj[key])) return Promise.resolve(obj)
	else {
		console.log('p4')
		return makeCidPromise(obj.cid)
		.then(function (id) {
			obj[key] = id
			return obj;
		})
	} 
		
}


/*
 * checks for keys of the form ac123 indicating a temporary column.  For each one, creates
 */

const makeAttrPromise = function (obj) {
	return Promise.all(Object.keys(obj)
		.filter(isLocalId)
		.map(function (fullkey) {
			var key = fullkey.substr(1)
			return makeCidPromise(key).then(function (id) {
				obj['a' + id] = obj[fullkey]
				delete obj[fullkey]
				console.log(obj)
				return obj
			})
		})).then(function () {
			return obj
		})
}

export default {makeCidPromise, resolveCidPromise, makeKeyPromise, makeAttrPromise}