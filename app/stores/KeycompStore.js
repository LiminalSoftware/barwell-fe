import assign from 'object-assign'
import Dispatcher from '../dispatcher/MetasheetDispatcher'
import EventEmitter from 'events'
import _ from 'underscore'

var _keycomps = {}
var _sequence = 0;

function create (keycomp) {
	if (keycomp.keycomp_id) {
    _keycomps[keycomp.keycomp_id] = keycomp
  } else if (!keycomp.cid) {
    keycomp.cid = 'c' + _sequence++
  }
  if (keycomp.cid) {
    _keycompsByCid[keycomp.cid] = keycomp;
  }
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
    }).map(_.clone)
  },
  
  get: function (id) {
    return _.clone(_keycomps[id])
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

      case 'KEYCOMP_RECEIVE':
        if (!payload.keycomp) return;
        var keycomps = _.isArray(payload.keycomp)  ? payload.keycomp : [payload.keycomp]
        keycomps.forEach(function (keycomp) {
          create(keycomp)
        })
        KeycompStore.emitChange()
        break;
    }
  })

export default KeycompStore;