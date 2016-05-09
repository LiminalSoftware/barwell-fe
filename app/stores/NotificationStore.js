import storeFactory from 'flux-store-factory';
import assign from 'object-assign'
import dispatcher from "../dispatcher/MetasheetDispatcher"
// var EventEmitter = require('events').EventEmitter
import EventEmitter from 'events'
import _ from 'underscore'
import modelActionCreators from '../actions/modelActionCreators'


var NotificationStore = storeFactory({
	identifier: 'notification_key',
	dispatcher: dispatcher,

	pivot: function(payload) {
		switch(payload.actionType) {
			case 'NOTIFY':
	        	this.create(payload);
	        	if (payload.notifyTime > 0) {
	        		setTimeout(function() {
						modelActionCreators.clearNotification(payload);
					}, payload.notifyTime);
	        	}
	        	this.emitChange();
	        	break;
			case 'CLEAR_NOTIFICATION':
	        	this.destroy(payload);
	        	this.emitChange();
	        	break;
		}
	}
})

export default NotificationStore
