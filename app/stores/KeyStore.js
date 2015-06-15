var assign = require('object-assign');
var Dispatcher = require('../dispatcher/MetasheetDispatcher');
var EventEmitter = require('events').EventEmitter;
var MetasheetConst = require('../constants/MetasheetConstants')
var _ = require('underscore')

var _keys = {}
var _sequence = 0;

function create (key) {
	var id = key.key_id
  if (!id) id = model.key_id = 'c' + _sequence++;
	_keys[id] = key
}

function destroy (key) {
	var id = key.key_id
	delete _keys[id]
}

var KeyStore = assign({}, EventEmitter.prototype, {
	
  getModelKeys: function (model_id) {
		// return a list of keys associated with the model
   	return _.values(_keys).filter(function (key) {
      return key.model_id = model_id;
    })
  },
  
  get: function (id) {
    return _keys[id]
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
    }
  })

export default KeyStore;