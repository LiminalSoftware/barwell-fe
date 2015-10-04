import assign from 'object-assign'
import dispatcher from "../dispatcher/MetasheetDispatcher"
// var EventEmitter = require('events').EventEmitter
import EventEmitter from 'events'


var _notifications = []
var _notifificationId = 0

var NotificationStore = assign({}, EventEmitter.prototype, {
  notifyTime: 5000,

	addChangeListener: function(callback) {
		this.on('CHANGE', callback);
	},

	removeChangeListener: function(callback) {
		this.removeListener('CHANGE', callback);
	},

	getNotifications: function () {
    var _this = this
    _notifications = _notifications.filter(n => n.timestamp > (Date.now() - _this.notifyTime) )
		return _notifications
	},

  setTimer: function () {
    console.log('setTimer')
    setTimeout(function() {
      console.log('ring ring')
      NotificationStore.emit('CHANGE');
    }, this.notifyTime)
  },

	dispatchToken: dispatcher.register(function (payload) {
		switch(payload.actionType) {
			case 'NOTIFY':
        payload.timestamp = Date.now();
        payload.notificationId = _notifificationId++
				_notifications.push(payload);
        NotificationStore.setTimer()
				NotificationStore.emit('CHANGE');
		}
	})
})

export default NotificationStore
