import assign from 'object-assign'
import Dispatcher from '../dispatcher/MetasheetDispatcher'
import EventEmitter from 'events'
import _ from 'underscore'

var _keys = {}
var _sequence = 0;

function create (key) {
	if (key.key_id) {
    _keys[key.key_id] = key
  } else if (!key.cid) {
    key.cid = 'c' + _sequence++
  }
  if (key.cid) {
    _keysByCid[key.cid] = key;
  }
}

function destroy (key) {
	var id = key.key_id
	delete _keys[id]
}

var KeyStore = assign({}, EventEmitter.prototype, {
	
  getModelKeys: function (model_id) {
		// return a list of keys associated with the model

   	return _.values(_keys).filter(function (key) {
      return key.model_id === model_id;
    }).map(_.clone)
  },
  
  get: function (id) {
    return _.clone(_keys[id])
  },

	emitChange: function () {
		this.emit('CHANGE_EVENT');
	},

	addChangeListener: function (callback) {
		this.on('CHANGE_EVENT', callback);
	},

	removeChangeListener: function (callback) {
   	this.removeListener('CHANGE_EVENT', callback);
  }

});


KeyStore.dispatchToken =  Dispatcher.register(function(payload) {

    switch (payload.actionType) {
      case 'KEY_CREATE':
        create(payload.key)
        KeyStore.emitChange()
        break;

      case 'KEY_DESTROY':
        create(payload.key)
        destroy(details)
        KeyStore.emitChange()
        break;

      case 'KEY_RECEIVE':
        var keys = _.isArray(payload.key)  ? payload.key : [payload.key]
        keys.forEach(function (key) {
          create(key)
        })
        KeyStore.emitChange()
        break;
    }
  })

export default KeyStore;