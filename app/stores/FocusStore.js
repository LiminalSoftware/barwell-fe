import assign from 'object-assign'
import dispatcher from "../dispatcher/MetasheetDispatcher"
// var EventEmitter = require('events').EventEmitter
import EventEmitter from 'events'

var focusStore = module.exports = {focus: 'view-config'};

var _focus = 'LOADING';

var FocusStore = assign({}, EventEmitter.prototype, {
	addChangeListener: function(callback) {
		this.on('CHANGE_EVENT', callback);
	},

	removeChangeListener: function(callback) {
		this.removeListener('CHANGE_EVENT', callback);
	},

	getFocus: function () {
		return _focus
	},

	dispatchToken: dispatcher.register(function (payload) {
		switch(payload.actionType) {
			case 'SET_FOCUS':
				_focus = payload.focus
				FocusStore.emit('CHANGE_EVENT');
		}
	})
})

export default FocusStore
