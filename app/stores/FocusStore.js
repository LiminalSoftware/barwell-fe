import assign from 'object-assign'
import dispatcher from "../dispatcher/MetasheetDispatcher"
// var EventEmitter = require('events').EventEmitter
import EventEmitter from 'events'

let _focus = 'LOADING'
let _focusDetail = null
let _focusElement = null

const FocusStore = assign({}, EventEmitter.prototype, {
	addChangeListener: function(callback) {
		this.on('CHANGE_EVENT', callback)
	},

	removeChangeListener: function(callback) {
		this.removeListener('CHANGE_EVENT', callback)
	},

	getFocus: function () {
		return _focus
	},

	getElement: function () {
		return _focusElement
	},

	dispatchToken: dispatcher.register(function (payload) {
		switch(payload.actionType) {
			case 'SET_FOCUS':
				if (_focus !== payload.focus) {
					console.log('SET_FOCUS: ' + payload.focus)
					if ("handleBlur" in (_focusElement || {})) _focusElement.handleBlur()
					_focus = payload.focus
					_focusElement = payload.element
					FocusStore.emit('CHANGE_EVENT');
				}
				break;
		}
	})
})

export default FocusStore
