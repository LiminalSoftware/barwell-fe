import MetasheetDispatcher from "../dispatcher/MetasheetDispatcher"
import webUtils from "../util/MetasheetWebAPI"
import _ from 'underscore'
import ModelStore from '../stores/ModelStore'
import groomView from '../containers/Views/groomView'

var modelActions = {

	setFocus: function (focus) {
		var message = {
			actionType: 'SET_FOCUS',
			focus: focus
		}
		MetasheetDispatcher.dispatch(message);
	},

	patchRecords: function (view, patch, selector) {
		var view_id = view.view_id
		var message = {}
		message.actionType = 'V' + view.view_id + '_UPDATE'
		message['v' + view.view_id] = patch
		message.selector = selector
		MetasheetDispatcher.dispatch(message)

		var url = 'https://api.metasheet.io/m' + view.model_id;
		if (!selector instanceof Object) throw new Error ('NOOOOOOOOOOOoOooooo!!!!!!!')
		else url += '?' + _.map(selector, function (value, key) {
			return key + '=eq.' + value;
		}).join('&')

		webUtils.ajax('PATCH', url, JSON.stringify(patch), {"Prefer": 'return=representation'}).then(function (results) {
			message.actionType = 'V' + view.view_id + '_RECEIVEUPDATE'
			message['v' + view.view_id] = results.data
			MetasheetDispatcher.dispatch(message)
		})
	},

	fetchRecords: function (view, offset, limit, sortSpec) {
		var view_id = view.view_id
		var url = 'https://api.metasheet.io/v' + view_id;
		if (sortSpec) {
			url = url + '?order=' + _.map(sortSpec, function (comp) {
				return 'a' + comp.attribute_id + '.' + (comp.descending ? 'desc' : 'asc') 
			}).join(",")
		}
		var header = {
			'Range-Unit': 'items',
			'Range': (offset + '-' + (offset + limit))
		}
		webUtils.ajax('GET', url, null, header).then(function (results) {
			var message = {}
			var range = results.xhr.getResponseHeader('Content-Range')
			var rangeParts = range.split(/[-/]/)

			message.startIndex = parseInt(rangeParts[0])
			message.endIndex = parseInt(rangeParts[1])
			message.recordCount = parseInt(rangeParts[2])
			
			message.actionType = ('V' + view.view_id + '_RECEIVE')
			message['v' + view_id] = results.data
			
			MetasheetDispatcher.dispatch(message)
		});
	},
	
	fetch: function (subject, selector) {
		var message = {}
		message.selector = selector
		return webUtils.persist(subject, 'FETCH', selector)
	},

	create: function (subject, persist, obj, update) {
		var message = {}
		if (update !== false) update = true
		obj._dirty = true
		obj._destroy = false
		message[subject] = obj
		message.actionType = subject.toUpperCase() + '_CREATE'
		MetasheetDispatcher.dispatch(message)
		// console.log(message);
		if (persist) return webUtils.persist(subject, 'CREATE', obj, update);
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

	handleDateChange: function (event) {
		console.log('event.target.value: '+ JSON.stringify(event.target.value, null, 2));		
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
	createView: function(view, persist, update) {
		modelActions.create('view', persist, groomView(view), update)
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