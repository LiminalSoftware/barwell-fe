var assign = require('object-assign');
var Dispatcher = require('../dispatcher/MetasheetDispatcher');
var EventEmitter = require('events').EventEmitter;
var _ = require('underscore')
var groomView = require('../containers/Views/groomView')

var _views = {}
var _sequence = 0

function create (view) {
	var id = view.view_id
  
  if (!id) id = view.view_id = 'c' + _sequence++;
  view = _.extend(_views[id] || {}, view)  
  view = groomView(view);

	_views[id] = view
}

function destroy (view) {
	var id = view.view_id
	delete _views[id]
}

var ViewStore = assign({}, EventEmitter.prototype, {
	getModelViews: function (model_id) {
		// return a list of views sorted by their name
   	return _.values(_views).filter(function (view) {
      console.log('view.model_id: '+ JSON.stringify(view.model_id, null, 2));
      console.log('model_id: '+ JSON.stringify(model_id, null, 2));
      return view.model_id === model_id;
    }).sort(function (A, B) {
   		return A.view > B.view;
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
        console.log('create view event')
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