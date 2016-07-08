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
	if (obj[pk]) return Promise.resolve(obj)
	else return makeCidPromise(obj.cid)
		.then(function (value) {
			obj[pk] = value
			return obj;
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
		var entityName = (action.entity === 'record' ? 
			('m' + action.model.model_id) :
			(action.entity))
		var pk = (action.entity === 'record' ? 
			(action.model._pk) :
			(action.entity + '_id'))

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
			// first wait for any dependent queries to come back (assigning ids to cids and such)

			switch(action.actionType) {
				case 'RECORD_MULTIDELETE':
				case 'RECORD_MULTIUPDATE':
					return Promise.all(action.data.map(
						rec => makePkPromise(rec, action.model._pk)
						))
					break;
				default:
					return Promise.resolve(action.data)
					break;
			}

		}).then(function (data) {
			// do some pre-processing on the request and send it off
			var url = BASE_URL + '/' + entityName
			var verb
			var json = JSON.stringify(util.stripInternalVars(data));

			switch(action.actionType) {
				case 'ATTRIBUTE_CREATE':
				case 'MODEL_CREATE':
				case 'KEY_CREATE':
				case 'RELATION_CREATE':
					if (pk in data) {
						url += '?' + pk + '=eq.' + data[pk];
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
				case 'RECORD_MULTIDELETE':
				case 'RECORD_MULTIUPDATE':
					verb = 'POST';
					break;
			}
			return webUtils.ajax(verb, url, json)
		}).then(function (results) {
			// get the response back, process it a bit and then dispatch it locally
			var resultantData = results.data instanceof Array ? results.data : [results.data]
			var action_id = resultantData[0].action_id
			var message = _.extend({}, action, {
				action_id: action_id,
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
					message.data = resultantData
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
