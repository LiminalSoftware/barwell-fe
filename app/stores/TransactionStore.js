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
import getGuid from './getGuid'

var _expanded = {};

var TransactionStore = storeFactory({
	identifier: 'action_id',
	dispatcher: dispatcher,
	guidGenerator: getGuid,
	pivot: function(action) {
		var _this = this;
		if (action.isTemporary) return;
		// process the action
		switch(action.actionType) {
			case 'VIEW_CREATE':
			case 'ATTRIBUTE_CREATE':
			case 'MODEL_CREATE':
			case 'KEY_CREATE':
			case 'RELATION_CREATE':
			
			case 'VIEW_DESTROY':
			case 'ATTRIBUTE_DESTROY':
			case 'MODEL_DESTROY':
			case 'KEY_DESTROY':
			case 'RELATION_DESTROY':

			case 'RECORD_UPDATE':
			case 'RECORD_INSERT':
			case 'RECORD_MULTIUPDATE':
			case 'RECORD_MULTIDELETE':
			case 'RECORD_CREATE':
				if (!('type' in action)) action.type = 'pending-item'
				if (!('status' in action)) action.status = 'active'
	        	_this.create(action);
	        	_this.emitChange();
	        	break;
	        case 'ACTION_CREATE':
	        	if (action.isClean) action.data.map(function(a){ a.type = 'success-item'; return a}).map(_this.create)
	        	_this.emitChange()
	        	break;
		}
	}
});


export default TransactionStore
