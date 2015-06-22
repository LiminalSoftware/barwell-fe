import MetasheetDispatcher from "../dispatcher/MetasheetDispatcher"
import webUtils from "../util/MetasheetWebAPI"
import _ from 'underscore'
import ModelStore from '../stores/ModelStore'
import groomView from '../containers/Views/groomView'

var modelActions = {

	genericAction: function(subject, action, data) {
		var message = {}
		data._dirty = true;
		message.actionType = subject.toUpperCase() + '_' + action.toUpperCase()
		message[subject] = data
		MetasheetDispatcher.dispatch(message)

		if (!(data._persist === false)) webUtils.persist(subject, action, data)
		return data;
	},

	// models
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

	// keys

	createKey: function(key) {
		if (!key) return;
		
      	key.key = key.key,
      	key.model_id = ModelStore.get(key.model_id).model_id
    	key.indexed = false
		
		MetasheetDispatcher.dispatch({
			actionType: 'KEY_CREATE',
			key: key
		});
		
		webUtils.persist('key', 'CREATE', _.pick(key, 'cid', 'key_id', 'key', 'key_id'));
	},

	// views
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
		
		webUtils.persist('view', 'CREATE', _.pick(view, 'cid', 'view_id', 'view', 'model_id', 'type', 'data'));

	},

	destroyView: function(view) {
		if (!view) return;
		
		MetasheetDispatcher.dispatch({
			actionType: 'VIEW_DESTROY',
			view: view
		});

		if (view.view_id) webUtils.persist('view', 'DESTROY', view);
	},

	// attributes
	createAttribute: function(attribute) {
		if (!attribute) return;

		attribute.attribute = attribute.attribute || 'New attribute'
		attribute.type = attribute.type || 'TEXT'
		
		MetasheetDispatcher.dispatch({
			actionType: 'ATTRIBUTE_CREATE',
			attribute: attribute
		});

		if (attribute._persist === true) webUtils.persist('attribute', 'CREATE', 
			_.pick(attribute, 'cid', 'attribute_id', 'attribute', 'type', 'model_id'));
	},

	destroyAttribute: function(attribute) {
		if (!attribute) return;
		
		MetasheetDispatcher.dispatch({
			actionType: 'ATTRIBUTE_DESTROY',
			attribute: attribute
		});

		if (attribute.attribute_id) webUtils.persist('attribute', 'DESTROY', attribute);
	},
}

export default modelActions