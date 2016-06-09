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

var BASE_URL = 'https://api.metasheet.io'

var _requestOrder = 0;
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
		
		// prepare the item
		switch(payload.actionType) {
			case 'BULK_UPDATE':
				url = BASE_URL + '/m' + payload.model.model_id + '?' + _.map(payload.selector, function (value, key) {
					return key + '=eq.' + value;
				}).join('&');
				verb = 'PATCH';
				payload.icon = (payload.method === 'mouse click') ? 'icon-mouse' : 'icon-keyboard';
				payload.copy = payload.model.model + ' updated' + (payload.method ? (' by ' + payload.method) : '' );
				payload.json = JSON.stringify(util.stripInternalVars(payload.patch));
				break;
			case 'RECORD_INSERT':
				url = BASE_URL + '/m' + payload.model.model_id
				verb = 'POST';
				payload.copy = 'New ' + payload.model.model + ' inserted';
				payload.json = JSON.stringify(payload.object);
				payload.icon = 'icon-flare';
				break;
			case 'RECORD_UPDATE':
				payload.actionType = 'RECORD_MULTIUPDATE';
				payload.patches = [payload.object];	
			case 'RECORD_MULTIUPDATE':
				url = BASE_URL + '/m' + payload.model.model_id
				verb = 'POST';
				payload.copy = (payload.patches.length > 1 ? (payload.patches.length + ' ' + payload.model.plural) : payload.model.model) + ' updated'
					+ (payload.method ? (' by ' + payload.method) : '');
				payload.icon = (payload.method === 'copy/paste') ? 'icon-clipboard-check' : (payload.method === 'selection clear' ? 'icon-broom' : 'icon-keyboard');
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
			case 'RECORD_CREATE':
				var json = payload.json;

				payload.type = 'pending-item'
				payload.status = 'active'
	        	this.create(payload);
	        	this.emitChange();

	        	// persist the change and then reflect the returned object locally
	        	webUtils.ajax(verb, url, json).then(function (results) {
	        		console.log(results)
	        		var cleanObject
	        		payload.type = 'new-item'
	        		payload.status = 'active'
	        		payload.timestamp = Date.now();
	        		payload.isClean = true;

	        		if (payload.actionType === 'RECORD_MULTIUPDATE') {
	        			payload.actionType = 'RECORD_MULTIRECIEVE';
	        			payload.action_id = (results.data[0] || {}).action_id;
	        			payload.patches = results.data;
	        		} else if (payload.actionType === 'RECORD_INSERT') {
	        			payload.actionType = 'RECORD_MULTIRECIEVE';
	        			payload.action_id = results.data.action_id;
	        			payload.patches = [results.data];
	        		} else {
	        			
	        		}

					_this.create(payload);
					_this.emitChange();
					MetasheetDispatcher.dispatch(payload);

				// wait 3 seconds (notificaiton is visible udring this time)
				}).then(function () {
					var duration = 3000;
					return new Promise (function (resolve, reject) {
				    	window.setTimeout(resolve, duration);
				  	})

				// age the notificaiton out of the active list
				}).then(function () {
					payload.status = 'old'
					_this.create(payload);
					_this.emitChange();

				// deal with any errors
				}).catch(function (error) {
					console.log(error)
					if (error.type === 'timeout') {
						payload.status = 'timeout'
						payload.errorMessage = "We're having trouble reaching the server"
						payload.icon = 'icon-wifi-alert-low2'
						payload.type = 'warning-item'
					} else {
						payload.status = 'error'
						payload.icon = 'icon-warning'
						payload.type = 'error-item'
						payload.errorMessage = 'The update could not be completed on the server as requested: ' + error.message
					}
					_this.create(payload);
					_this.emitChange()
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
