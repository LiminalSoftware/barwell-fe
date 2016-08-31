import MetasheetDispatcher from "../dispatcher/MetasheetDispatcher"
import TransactionStore from '../stores/TransactionStore'
import webUtils from "../util/MetasheetWebAPI"
import util from "../util/util"
import _ from 'underscore'
import cidLookup from './cidLookup'

const BASE_URL = 'http://api.metasheet.io'

/*
 * a lookup from cid to an array of promises that are waiting for that cid
 */

let _cidPromises = {}

/*
 * a lookup from cid to the permanent id
 */
let _cidLookup = {}

/*
 * waits until the primary key (pk) is available, then populates the permanent key
 */
const makeKeyPromise = function (obj, key) {
	if (obj[key]) return Promise.resolve(obj)
	else return cidLookup.makeCidPromise(obj.cid)
		.then(function (id) {
			obj[key] = id
			return obj;
		})
}


/*
 * checks for keys of the form ac123 indicating a temporary column.  For each one, creates
 */

const makeAttrPromise = function (obj) {
	return Promise.all(Object.keys(obj)
		.filter(k => (/^[ar]c\d+$/).test(k))
		.map(function (fullkey) {
			var key = fullkey.substr(1)
			return cidLookup.makeCidPromise(key).then(function (id) {
				obj['a' + id] = obj[fullkey]
				delete obj[fullkey]
				console.log(obj)
				return obj
			})
		})).then(function () {
			return obj
		})
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

		if (action.actionType == 'ACTION_CREATE' || !action.actionType) return;

		if (action.isClean) {
			if (action.data instanceof Array)
				action.data.forEach(obj => cidLookup.resolveCidPromise(obj, pk))
			else if (action.data instanceof Object)
				cidLookup.resolveCidPromise(action.data, pk)
			// very important -- if we don't catch clean actions here then we enter a race condition
			// this should probably be refactored 
			return;
		}

		Promise.resolve().then(function () {
			// first wait for any dependent queries to come 
			// back (assigning ids to cids and such)

			switch(action.actionType) {
				case 'VIEW_CREATE':
					return makeKeyPromise(action.data, 'model_id')
				case 'RECORD_MULTIDELETE':
				case 'RECORD_MULTIUPDATE':
					return Promise.all(action.data.map(
							rec => makeKeyPromise(rec, action.model._pk)
								.then(makeAttrPromise)
						))
					break;
				default:
					return Promise.resolve(action.data)
					break;
			}

		}).then(function (data) {
			// do some pre-processing on the request and send it off,
			// records have a different API than metadata entities so
			// we treat them a little differently

			var url = BASE_URL + '/' + entityName
			var verb
			var json
			
			switch (action.actionType) {
				case 'VIEW_CREATE':
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
				case 'VIEW_DESTROY':
				case 'ATTRIBUTE_DESTROY':
				case 'MODEL_DESTROY':
				case 'KEY_DESTROY':
				case 'RELATION_DESTROY':
					if (!(pk in data)) 
						throw new Error('destroy without specifying primary key')
					url += '?' + pk + '=eq.' + data[pk];
					verb = 'DELETE'
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
					data.map(r => r.narrative = action.narrative)
					break;
			}

			json = JSON.stringify(util.stripInternalVars(data));
			return webUtils.ajax({method: verb, url: url, json: json});
		}).then(function (results) {
			// get the response back, process it a bit and then dispatch 
			// the result locally
			var resultantData = results.data instanceof Array ? results.data : [results.data]
			var action_id = resultantData[0].action_id
			var message = _.extend({}, action, {
				action_id: action_id,
				changes: action.data,
				data: results.data,
				type: 'success-item',
				timestamp: Date.now(),
				isClean: true
			})
			
			// determine the return action type if necessary
			// TODO - this should not really be necessary
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

const observer = new TransactionObserver()
export default observer