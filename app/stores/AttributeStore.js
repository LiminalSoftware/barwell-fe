var assign = require('object-assign');
var Dispatcher = require('../dispatcher/MetasheetDispatcher');
var EventEmitter = require('events').EventEmitter;
var MetasheetConst = require('../constants/MetasheetConstants')
var _ = require('underscore')

var _attributes = {}
var _sequence = 0;

function create (attribute) {
	var id = attribute.attribute_id
  if (!id) id = model.attribute_id = 'c' + _sequence++;
	_attributes[id] = attribute
}

function destroy (attribute) {
	var id = attribute.attribute_id
	delete _attributes[id]
}

var AttributeStore = assign({}, EventEmitter.prototype, {
	
  getModelAttributes: function (model_id) {
		// return a list of attributes sorted by their name
   	return _.values(_attributes).filter(function (attribute) {
      return attribute.model_id = model_id;
    })
  },
  
  get: function (id) {
    return _attributes[id]
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

AttributeStore.dispatchToken = Dispatcher.register(function(payload) {

  switch (payload.actionType) {
    case 'ATTRIBUTE_CREATE':
      create(payload.attribute)
      AttributeStore.emitChange()
      break;

    case 'ATTRIBUTE_DESTROY':
      destroy(payload.attribute)
      AttributeStore.emitChange()
      break;
  }
})

export default AttributeStore;