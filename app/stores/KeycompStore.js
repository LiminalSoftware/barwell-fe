var assign = require('object-assign');
var Dispatcher = require('../dispatcher/MetasheetDispatcher');
var EventEmitter = require('events').EventEmitter;
var MetasheetConst = require('../constants/MetasheetConstants')
var _ = require('underscore')

var _keycomps = {}
var _sequence = 0;

function create (keycomp) {
	var id = keycomp.keycomp_id
  if (!id) id = model.keycomp_id = 'c' + _sequence++;
	_keycomps[id] = keycomp
}

function destroy (keycomp) {
	var id = keycomp.keycomp_id
	delete _keycomps[id]
}

var KeycompStore = assign({}, EventEmitter.prototype, {
	
  getAttributeKeycomps: function (attribute_id) {
		// return a list of keycomps associated with the attribute
   	return _.values(_keycomps).filter(function (keycomp) {
      return keycomp.attribute_id === attribute_id;
    })
  },
  
  get: function (id) {
    return _keycomps[id]
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


KeycompStore.dispatchToken =  Dispatcher.register(function(payload) {

    switch (payload.actionType) {
      case 'KEYCOMP_CREATE':
        create(payload.keycomp)
        KeycompStore.emitChange()
        break;

      case 'KEYCOMP_DESTROY':
        create(payload.keycomp)
        destroy(details)
        KeycompStore.emitChange()
        break;
    }
  })

export default KeycompStore;