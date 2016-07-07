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

var TransactionStore = storeFactory({
	identifier: 'transaction_id',
	dispatcher: dispatcher,
	guidGenerator: getGuid,
	pivot: function(payload) {
		var _this = this;
		
		// process the action
		switch(payload.actionType) {
			case 'RECORD_UPDATE':
			case 'RECORD_INSERT':
			case 'RECORD_MULTIUPDATE':
			case 'RECORD_MULTIDELETE':
			case 'RECORD_CREATE':
				if (!('type' in payload)) payload.type = 'pending-item'
				if (!('status' in payload)) payload.status = 'active'
	        	_this.create(payload);
	        	_this.emitChange();
	        	break;
		}
	}
});


export default TransactionStore
