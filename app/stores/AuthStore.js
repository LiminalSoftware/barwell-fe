import assign from 'object-assign'
import dispatcher from "../dispatcher/MetasheetDispatcher"
// var EventEmitter = require('events').EventEmitter
import EventEmitter from 'events'

_username = 'me'

var AuthStore = module.exports = {};

var AuthStore = assign({}, EventEmitter.prototype, {
	addChangeListener: function(callback) {
		this.on('CHANGE_EVENT', callback);
	},

	removeChangeListener: function(callback) {
		this.removeListener('CHANGE_EVENT', callback);
	},

	getUsername: function () {
		return _username
	},

	dispatchToken: dispatcher.register(function (payload) {
		switch(payload.actionType) {
			case 'SET_AUTH':

				// FocusStore.emit('CHANGE_EVENT');
		}
	})
})

export default AuthStore
