import assign from 'object-assign'
import Dispatcher from '../dispatcher/MetasheetDispatcher'
import EventEmitter from 'events'
import _ from 'underscore'
import groomView from '../containers/Views/groomView'

var _views = {}
var _viewsByCid = {}
var _sequence = 0

function create (view) {
  // view = groomView(view)
	if (view.view_id) {
    _views[view.view_id] = view
  } else if (!view.cid) {
    view.cid = 'c' + _sequence++
  }
  if (view.cid) {
    _viewsByCid[view.cid] = view;
  }
}

function destroy (view) {
	delete _views[view.view_id]
  delete _viewsByCid[view.cid]
}

var ViewStore = assign({}, EventEmitter.prototype, {
	getModelViews: function (model_id) {
		// return a list of views sorted by their name
   	return _.values(_views).filter(function (view) {
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
        create(payload.view)
        ViewStore.emitChange()
        break;

      case 'VIEW_DESTROY':
        destroy(payload.view)
        ViewStore.emitChange()
        break;

      case 'VIEW_RECEIVE':
        var views = _.isArray(payload.view)  ? payload.view : [payload.view]
        views.forEach(function (view) {
          if (!view) return;
          create(view)
        })
        ViewStore.emitChange()
        break;
    }
  })

export default ViewStore;