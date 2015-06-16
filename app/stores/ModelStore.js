import assign from 'object-assign'
import Dispatcher from '../dispatcher/MetasheetDispatcher'
import EventEmitter from 'events'
import _ from 'underscore'

var CHANGE_EVENT = 'CHANGE_EVENT'

var _models = {}
var _modelsByCid = {}
var _modelsByName = {}
var _sequence = 0;

function create (model) {
  if (model.model_id) {
    _models[model.model_id] = model
  } else if (!model.cid) {
    model.cid = 'c' + _sequence++
  }
  if (model.cid) {
    _modelsByCid[model.cid] = model;
  }
}

function destroy (model) {
	var id = model.model_id
	delete _models[id]
}

var ModelStore = assign({}, EventEmitter.prototype, {
	getAll: function() {
		// return a list of models sorted by their name
   	return _.values(_models).sort(function (A,B) {
   		return A.model < B.model;
   	}).map(_.clone)
  },

  get: function (id) {
    if (/^c\d+/.test(id)) return this.getByCid(id)
    return _.clone(_models[id])
  },

  getByCid: function (cid) {
    return _.clone(_modelsByCid[cid])
  },

  getByName: function (name) {
    return _.clone(_modelsByName[name])
  },

	emitChange: function () {
		this.emit(CHANGE_EVENT);
	},

	addChangeListener: function (callback) {
		this.on(CHANGE_EVENT, callback);
	},

	removeChangeListener: function (callback) {
   	this.removeListener(CHANGE_EVENT, callback);
  }
});

ModelStore.dispatchToken = Dispatcher.register(function(payload) {

  switch (payload.actionType) {
    case 'MODEL_CREATE':
      create(payload.model)
      ModelStore.emitChange()
      break;
      
    case 'MODEL_DESTROY':
      destroy(payload.model)
      ModelStore.emitChange()
      break;
      
    case 'MODEL_RECEIVE':
      var models = _.isArray(payload.model)  ? payload.model : [payload.model]
      models.forEach(function (model) {
        create(model)
      })
      ModelStore.emitChange()
      break;
  }
})

export default ModelStore;