import assign from 'object-assign'
import dispatcher from "../dispatcher/MetasheetDispatcher"
// var EventEmitter = require('events').EventEmitter
import EventEmitter from 'events'

var WorkspaceStore = module.exports = {focus: 'view-config'};


// var WorkspaceStore = assign({}, EventEmitter.prototype, {
// 	addChangeListener: function(callback) {
// 		this.on('CHANGE_EVENT', callback);
// 	},
//
// 	removeChangeListener: function(callback) {
// 		this.removeListener('CHANGE_EVENT', callback);
// 	},
//
// 	getWorkspaceId: function () {
// 		return _workspaceId
// 	},
//
// 	dispatchToken: dispatcher.register(function (payload) {
// 		switch(payload.actionType) {
// 			case 'SET_WORKSPACE':
// 				_focus = payload.focus
// 				FocusStore.emit('CHANGE_EVENT');
// 		}
// 	})
// })

export default WorkspaceStore
