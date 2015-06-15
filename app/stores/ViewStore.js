var assign = require('object-assign');
var Dispatcher = require('../dispatcher/MetasheetDispatcher');
var EventEmitter = require('events').EventEmitter;
var _ = require('underscore')
var groomView = require('../Containers/Views/groomView')


var _views = {}
var _sequence = 0;



function create (view) {
	var id = view.view_id
  var newView
  var newData
  
  if (!id) id = view.view_id = 'c' + _sequence++;
  newView = _views[id] || {}

  newData = _.extend(newView.data || {}, view.data)
  newView = _.extend(newView, view)
  newView.data = newData;

  newView = groomView(newView);

	_views[id] = newView
}

function destroy (view) {
	var id = view.view_id
	delete _views[id]
}

var ViewStore = assign({}, EventEmitter.prototype, {
	getModelViews: function (model_id) {
		// return a list of views sorted by their name
   	return _.values(_views).filter(function (view) {
      return view.model_id === model_id;
    }).sort(function (A, B) {
   		return A.view < B.view;
   	});
  },

  get: function (id) {
    return _views[id]
  },

	emitChange: function () {
		this.emit("CHANGE_EVENT");
	},

	addChangeListener: function (callback) {
		this.on("CHANGE_EVENT", callback);
	},

	removeChangeListener: function (callback) {
   	this.removeListener("CHANGE_EVENT", callback);
  }

});

ViewStore.dispatchToken = Dispatcher.register(function(payload) {

    switch (payload.actionType) {
      case 'VIEW_CREATE':
        create(payload.view)
        ViewStore.emitChange()
        break;

      case 'VIEW_DESTROY':
        destroy(payload.view)
        ViewStore.emitChange()
        break;
    }
  })

export default ViewStore;