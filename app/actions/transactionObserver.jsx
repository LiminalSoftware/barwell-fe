import MetasheetDispatcher from "../dispatcher/MetasheetDispatcher"
import TransactionStore from '../stores/TransactionStore'
import webUtils from "../util/MetasheetWebAPI"
import util from "../util/util"
import _ from 'underscore';
var BASE_URL = 'http://api.metasheet.io'

// a lookup from cid to an array of promises that are waiting for that cid
var _cidPromises = {}

// a lookup from cid to the permanent id
var _cidLookup = {}

// resolves when the cid provided has a permanent id assigned
var makeCidPromise = function (cid) {
	if (cid in _cidLookup) return Promise.resolve(_cidLookup[cid])
	else return new Promise(function (resolve, reject) {
		_cidPromises[cid] = (_cidPromises[cid] || []).concat(resolve)
	})
}

// waits until the primary key (pk) is available, then populates the permanent key
var makePkPromise = function (obj, pk) {
	if (obj[pk]) return Promise.resolve()
	else return makeCidPromise(obj.cid)
		.then(function (value) {
			obj[pk] = value
		})
}

// takes a clean object and resolves any promises that were wating for the id
var resolveCidPromise = function (obj, pk) {
	var cid = obj.cid
	var id = obj[pk]
	
	if (cid && id) {
		(_cidPromises[cid] || []).map(p => p(id))
	}
}

class TransactionObserver {
	constructor () {
		TransactionStore.addCreateListener(this._onNewTransaction)
	}

	_onNewTransaction (action) {
		var _this = this
		var pk = (action.entity === 'RECORD' ? 
				('m' + action.model.model_id) :
				(action.entity + '_id'))
		var url = BASE_URL
		var verb
		var json

		if (action.isClean) {
			if (action.data instanceof Array)
				action.data.forEach(obj => resolveCidPromise(obj, pk))
			else if (action.data instanceof Object) {
				throw new Error('singleton object in a data field...')
			}
			// very important -- if we don't catch clean actions here then we enter a race condition
			// this should probably be refactored 
			return;
		}

		if (action.isTemporary) return;

		Promise.resolve().then(function () {
			switch (action.entity) {
				case 'record':
					url += '/m' + action.model.model_id
					break;
				default:
					url += '/' + action.entity
					break;
			}

			switch(action.actionType) {
				case 'ATTRIBUTE_CREATE':
				case 'MODEL_CREATE':
				case 'KEY_CREATE':
				case 'RELATION_CREATE':
					if (pk in action.data) {
						url += '?' + pk + '=eq.' + action.data[pk];
						verb = 'PATCH'
					} else {
						verb = 'POST'
					}
					break;
				case 'RECORD_BULKDELETE':
				case 'RECORD_BULKUPDATE':
					url += '?' + _.map(action.selector, function (value, key) {
						return key + '=eq.' + value;
					}).join('&');
					verb = 'PATCH';
					break;
				case 'RECORD_INSERT':
					verb = 'POST';
					break;
				case 'RECORD_MULTIDELETE':
				case 'RECORD_MULTIUPDATE':
					verb = 'POST';
					return Promise.all(action.data.map(rec => makePkPromise(rec, action.model._pk)))
					break;
				default:
					return action.data
					break;
			}
		}).then(function (resolvedData) {
			json = JSON.stringify(util.stripInternalVars(resolvedData));
			return webUtils.ajax(verb, url, json)
		}).then(function (results) {
			var message = _.extend({}, action, {
				data: results.data,
				type: 'new-item',
				status: 'old',
				timestamp: Date.now(),
				isClean: true
			})
			
			// determine the return action type if necessary
			// TODO - this would not be necessary if things were cleaner
			switch (action.actionType) {
				case 'RECORD_MULTIUPDATE':
				case 'RECORD_INSERT':
					message.actionType = 'RECORD_MULTIUPDATE'
					message.data = results.data instanceof Array ? results.data : [results.data]
					break;
			}

			MetasheetDispatcher.dispatch(message);

		}).catch(function (error) {
			console.log('=========================')
			console.log(error)
			console.log('=========================')

			if (!(error instanceof Object)) error = {}
			action.type = 'error-item'
			action.statusMessage = 'Could not be completed: ' + error.message; 
			action.actionType = 'REVERT_ACTION'

			MetasheetDispatcher.dispatch(action);
		})
	}
}

let observer = new TransactionObserver()
export default observer;
