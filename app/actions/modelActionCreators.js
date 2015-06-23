import MetasheetDispatcher from "../dispatcher/MetasheetDispatcher"
import webUtils from "../util/MetasheetWebAPI"
import _ from 'underscore'
import ModelStore from '../stores/ModelStore'
import groomView from '../containers/Views/groomView'

var modelActions = {

	genericAction: function(subject, action, data) {
		var message = {}
		data._dirty = true
		message.actionType = subject.toUpperCase() + '_' + action.toUpperCase()
		message[subject] = data
		MetasheetDispatcher.dispatch(message)

		if (!(data._persist === false)) webUtils.persist(subject, action, data)
		return data;
	},

	create: function (subject, persist, obj) {
		var message = {}
		obj._dirty = true
		obj._destroy = false
		message[subject] = obj
		message.actionType = subject.toUpperCase() + '_CREATE'
		MetasheetDispatcher.dispatch(message)
		if (persist) return webUtils.persist(subject, 'CREATE', obj);
		else return new Promise(function(resolve, reject){
			return resolve(obj)
		})
	},

	undestroy: function (subject, obj) {
		var message = {}
		obj._destroy = false
		message[subject] = obj
		message.actionType = subject.toUpperCase() + '_CREATE'
		MetasheetDispatcher.dispatch(message)
	},

	destroy: function (subject, persist, obj) {
		var message = {}
		message[subject] = obj


		if (!persist && ((subject+'_id') in obj)) {
			// mark the object for destruction, but dont actually do it
			message.actionType = subject.toUpperCase() + '_CREATE'
			obj._destroy = true
		} else {
			message.actionType = subject.toUpperCase() + '_DESTROY'
			if (persist) return webUtils.persist(subject, 'DESTROY', obj)
		}
		return new Promise(function (resolve, reject) {
			MetasheetDispatcher.dispatch(message)
			return resolve(obj)
		});
	},

	// relations

	createRelation: function (relation) {
		var opposite = RelationStore.get(relation.opposite_relation_id) || {};
		opposite._dirty = true;
		opposite._persist = true;
		relation._dirty = true;
		relation._persist = true;
		MetasheetDispatcher.dispatch({
			actionType: 'RELATION_CREATE',
			relation: relation
		});
		opposite.opposite_relation_id = (relation.relation_id || relation.cid)
		MetasheetDispatcher.dispatch({
			actionType: 'RELATION_CREATE',
			relation: opposite
		});
		relation.opposite_relation_id = (opposite.relation_id || opposite.cid)
		MetasheetDispatcher.dispatch({
			actionType: 'RELATION_CREATE',
			relation: relation
		});
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