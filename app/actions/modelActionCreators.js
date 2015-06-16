import MetasheetDispatcher from "../dispatcher/MetasheetDispatcher"
import webUtils from "../util/MetasheetWebAPI"
import _ from 'underscore'
import ModelStore from '../stores/ModelStore'
import groomView from '../containers/Views/groomView'

var modelActions = {

	fetchModels: function() {
		webUtils.persist('model', 'FETCH', null);
	},

	createModel: function(model) {

		model.model = model.model || 'New model'
		model.plural = model.plural || (model.model + 's')
		
		MetasheetDispatcher.dispatch({
			actionType: 'MODEL_CREATE',
			model: model
		});
		webUtils.persist('model', 'CREATE', _.pick(model, 'model_id', 'model', 'plural'));
	},

	createView: function(view) {
		if (!view) return;
		
      	view.view = view.view,
      	view.model_id = ModelStore.get(view.model_id).model_id,
      	view.type = view.type || 'Tabular',
    	view.data = view.data || {}

    	view = groomView(view)
		
		MetasheetDispatcher.dispatch({
			actionType: 'VIEW_CREATE',
			view: view
		});
		
		webUtils.persist('view', 'CREATE', _.pick(view, 'view_id', 'view', 'model_id', 'type', 'data'));
	},

	destroyView: function(view) {
		if (!view) return;
		
		webUtils.persist('view', 'DESTROY', view);
		MetasheetDispatcher.dispatch({
			actionType: 'VIEW_DESTROY',
			view: view
		});
	},

	createAttribute: function(attribute) {
		if (!attribute) attribute = {}
		
		MetasheetDispatcher.dispatch({
			actionType: 'ATTRIBUTE_CREATE',
			attribute: attribute
		});
		webUtils.persist('attribute', 'CREATE', attribute);
	}

}

export default modelActions