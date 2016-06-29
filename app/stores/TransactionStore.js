import MetasheetDispatcher from "../dispatcher/MetasheetDispatcher"
import storeFactory from 'flux-store-factory';
import assign from 'object-assign'
import dispatcher from "../dispatcher/MetasheetDispatcher"
// var EventEmitter = require('events').EventEmitter
import EventEmitter from 'events'
import _ from 'underscore'
import modelActionCreators from '../actions/modelActionCreators'
import webUtils from "../util/MetasheetWebAPI"
import util from "../util/util"

var BASE_URL = 'http://api.metasheet.io'

var _actionCid = 0;
var _pendingKeys = {};

var TransactionStore = storeFactory({
	identifier: 'transaction_id',
	dispatcher: dispatcher,

	pivot: function(payload) {
		var verb = '';
		var _this = this;
		var url;
		

		// console.log(payload)

		// if (payload.selector.keys.length === 1 && payload.selector.keys[0] === payload.model.model_id) {
		// 	payload.actionType = 'RECORD_MULTIUPDATE';
		// 	payload.patches = [_.extend(payload.object, payload.selector)];	
		// }

		// set the url for the ajax call
		switch(payload.actionType) {
			case 'BULK_UPDATE':
			case 'RECORD_INSERT':
			case 'RECORD_MULTIDELETE':
			case 'RECORD_UPDATE':
			case 'RECORD_MULTIUPDATE':
				url = BASE_URL + '/m' + payload.model.model_id;
			break;
		}

		// set additional attributes of the message
		switch(payload.actionType) {
			case 'BULK_UPDATE':
				url += '?' + _.map(payload.selector, function (value, key) {
					return key + '=eq.' + value;
				}).join('&');
				verb = 'PATCH';
				payload.icon = (payload.method === 'mouse click') ? 'icon-mouse' : 'icon-keyboard';
				payload.copy = payload.model.model + ' updated' + (payload.method ? (' by ' + payload.method) : '' );
				payload.json = JSON.stringify(util.stripInternalVars(payload.patch));
				break;
			case 'RECORD_INSERT':
				verb = 'POST';
				payload.copy = 'New ' + payload.model.model + ' inserted';
				payload.json = JSON.stringify(payload.object);
				payload.icon = 'icon-flare';
				break;
			case 'RECORD_MULTIDELETE':
				verb = 'POST';
				payload.copy = payload.patches.length > 1 ? 
					(payload.patches.length + ' ' + payload.model.plural + ' deleted')
					: (payload.model.model + ' deleted');
				payload.icon = 'icon-trash2';
				payload.json = JSON.stringify(payload.patches.map(util.stripInternalVars));
				break;
			case 'RECORD_UPDATE':
				payload.actionType = 'RECORD_MULTIUPDATE';
				payload.patches = [payload.object];	
			case 'RECORD_MULTIUPDATE':
				verb = 'POST';
				payload.copy = (payload.patches.length > 1 ? (payload.patches.length + ' ' + payload.model.plural) : payload.model.model) + ' updated'
					+ (payload.method ? (' by ' + payload.method) : '');
				payload.icon = (payload.method === 'copy/paste') ? 'icon-clipboard-check' : (payload.method === 'clearing selection' ? 'icon-broom' : 'icon-keyboard');
				payload.json = JSON.stringify(payload.patches.map(util.stripInternalVars));
				break;
			// case 'RECORD_CREATE':
			// 	break;
		}

		// process the action
		switch(payload.actionType) {
			case 'RECORD_UPDATE':
			case 'RECORD_INSERT':
			case 'RECORD_MULTIUPDATE':
			case 'RECORD_MULTIDELETE':
			case 'RECORD_CREATE':
				var json = payload.json;
				payload.actionCid = 'c' + (_actionCid++)
				payload.type = 'pending-item'
				payload.status = 'active'
	        	
	        	_this.create(payload);
	        	_this.emitChange();

	        	// persist the change and then reflect the returned object locally
	        	webUtils.ajax(verb, url, json).then(function (results) {
	        		var cleanObject
	        		payload.type = 'new-item'
	        		payload.status = 'active'
	        		payload.timestamp = Date.now();
	        		payload.isClean = true;

	        		if (payload.actionType === 'RECORD_MULTIUPDATE') {
	        			payload.actionType = 'RECORD_MULTIRECIEVE';
	        			payload.action_id = (results.data instanceof Array ? results.data[0] : results.data).action_id;
	        			payload.patches = results.data;
	        		} else if (payload.actionType === 'RECORD_INSERT') {
	        			payload.actionType = 'RECORD_MULTIRECIEVE';
	        			payload.action_id = results.data.action_id;
	        			payload.patches = [results.data];
	        		} else if (payload.actionType === 'RECORD_MULTIDELETE') {
	        			payload.actionType = 'RECORD_MULTIDELETECONFIRM';
	        		}

					_this.create(payload);
					_this.emitChange();
					MetasheetDispatcher.dispatch(payload);
				}).catch(function (error) {
					console.log(error)
					if (!(error instanceof Object)) error = {}

					payload.type = 'error-item'
					payload.statusMessage = 'Could not be completed: ' + error.message; 
					payload.actionType = 'REVERT_ACTION'
					
					_this.create(payload);
					_this.emitChange();
					MetasheetDispatcher.dispatch(payload);
				}).then(function () {
					// wait 3 seconds (notificaiton is visible udring this time)
					var duration = 3000;
					return util.wait(duration).then(function () {
						payload.status = 'old'
						_this.create(payload);
						_this.emitChange();
					})
				})
	        	break;
		}
	}
});

var issueReceipt = function (subject, obj, requestId) {
  var message = {}
  message.actionType = (subject.toUpperCase() + '_RECEIVE')
  message.requestId = requestId
  message[subject] = obj
  MetasheetDispatcher.dispatch(message)
};

export default TransactionStore
