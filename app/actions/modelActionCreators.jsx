import MetasheetDispatcher from "../dispatcher/MetasheetDispatcher"
import webUtils from "../util/MetasheetWebAPI.jsx"
import _ from 'underscore'
import ModelStore from '../stores/ModelStore'
import RelationStore from '../stores/RelationStore'
import groomView from '../containers/Views/groomView'


var BASE_URL = 'https://api.metasheet.io'


var modelActions = {

	createNotification: function (notification) {
		notification.actionType = 'NOTIFY';
		MetasheetDispatcher.dispatch(notification);
	},

	clearNotification: function (notification) {
		notification.actionType = 'CLEAR_NOTIFICATION'
		MetasheetDispatcher.dispatch(notification);
	},

	setWorkspace: function (workspaceId) {
		var message = {
			actionType: 'SET_WORKSPACE',
			workspaceId: workspaceId
		}
		// MetasheetDispatcher.dispatch(message);
	},

	setFocus: function (focus) {
		var message = {
			actionType: 'SET_FOCUS',
			focus: focus
		}
		MetasheetDispatcher.dispatch(message);
	},

	insertRecord: function (model, obj, position) {
		var model_id = model.model_id
		var message = {}
		var json = JSON.stringify(obj)
		var url = BASE_URL + '/m' + model.model_id;

		message.actionType = 'M' + model.model_id + '_CREATE'
		message.index = position
		message.record = obj
		message.selector = {cid: obj.cid}
		MetasheetDispatcher.dispatch(message)

		return webUtils.ajax('POST', url, json, {"Prefer": 'return=representation'}).then(function (results) {
			var updt_message = {};
			updt_message.actionType = 'M' + model.model_id + '_RECEIVEUPDATE';
			updt_message.update = results.data || {};
			updt_message.selector = {cid: obj.cid};
			MetasheetDispatcher.dispatch (updt_message);
			return results.data
		})
	},

	deleteRecord: function (model, selector) {
		var model_id = model.model_id;
		var message = {};
		var url = BASE_URL + '/m' + model.model_id;
		if (!selector instanceof Object) throw new Error ('Delete without qualifier is not permitted')
		else url += '?' + _.map(selector, function (value, key) {
			return key + '=eq.' + value;
		}).join('&');

		message.actionType = 'M' + model.model_id + '_DESTROY';
		message.selector = selector;
		MetasheetDispatcher.dispatch(message);

		webUtils.ajax('DELETE', url, null, {"Prefer": 'return=representation'}).then(function (results) {
		})
	},

	patchRecords: function (model, patch, selector, extras) {
		var model_id = model.model_id;
		var message = {};
		var rx = /^a\d+$/i;

		message.actionType = 'M' + model.model_id + '_UPDATE';
		message.update = _.clone(patch);
		message.selector = selector;
		message = _.extend(message, extras);
		MetasheetDispatcher.dispatch(message);

		var url = BASE_URL + '/m' + model.model_id;
		if (!selector instanceof Object) throw new Error ('Patch without qualifier is not permitted')
		else url += '?' + _.map(selector, function (value, key) {
			return key + '=eq.' + value;
		}).join('&')
		
		patch = _.pick(patch, (v,k)=> rx.test(k))

		webUtils.ajax('PATCH', url, JSON.stringify(patch), {"Prefer": 'return=representation'}).then(function (results) {
			var message = {}
			message.actionType = 'M' + model.model_id + '_RECEIVEUPDATE'
			message.update = results.data
			message.selector = selector
			MetasheetDispatcher.dispatch(message)
		}).catch(function (error) {

			console.log('theres an error!')

			modelActionCreators.createNotification({
              copy: 'This update violates an existing constraint: ', 
              type: 'error',
              icon: ' icon-warning ',
              notification_key: 'updateRecordError',
              notifyTime: 2000
            });

			MetasheetDispatcher.dispatch({
				selector: selector,
				actionType: 'M' + model.model_id + '_REVERT'
			})

			// if (error.code === "23505") {
				
			// }
		})
	},

	moveHasMany: function (relationId, thisObj, relObj) {
		var relation = RelationStore.get(relationId)
		var hasOneRelation = RelationStore.get(relation.type === 'HAS_ONE' ? 
			relation.relation_id : relation.related_relation_id)
		var hasManyRelation = RelationStore.get(relation.type === 'HAS_ONE' ? 
			relation.related_relation_id : relation.relation_id)
		var hasOneObj = relation.type === 'HAS_MANY' ? relObj : thisObj
		var hasManyObj = relation.type === 'HAS_MANY' ? thisObj : relObj
		var hasOneKey = KeyStore.get(hasOneRelation.key_id)
		var hasManyKey = KeyStore.get(hasManyRelation.key_id)
		var hasOneModel = ModelStore.get(hasOneKey.model_id)
		var hasOneKeycomps = KeycompStore.query({key_id: hasOneKey.key_id})
		var hasManyKeycomps = KeycompStore.query({key_id: hasManyKey.key_id})

		var selector = _.pick(hasOneObj, hasOneModel._pk)
		var patch = {}

		var hasOneKeyAttrs = []
		var hasManyKeyAttrs = []

		hasManyKeycomps.forEach(function (kc, i) {
			var rkcId = 'a' + hasOneKeycomps[i].attribute_id
			var kcId =  'a' + kc.attribute_id
			hasOneKeyAttrs.push(rkcId)
			hasManyKeyAttrs.push(kcId)
			patch[rkcId] = hasManyObj[kcId]
		});

		patch['r' + hasOneRelation.relation_id] = JSON.parse(JSON.stringify(hasOneObj))

		var extras = {
			hasOneObject: hasOneObj,
			hasOneKeyAttrs: hasOneKeyAttrs,
			hasManyKeyAttrs: hasManyKeyAttrs
		}
		modelActions.patchRecords(hasOneModel, patch, selector, extras)
	},

	fetchRecords: function (view, offset, limit, sortSpec) {
		var view_id = view.view_id
		var model_id = view.model_id
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
		return webUtils.ajax('GET', url, null, header).then(function (results) {
			var message = {}
			var range = results.xhr.getResponseHeader('Content-Range')
			var rangeParts = range.split(/[-/]/)

			message.startIndex = parseInt(rangeParts[0])
			message.endIndex = parseInt(rangeParts[1])
			message.recordCount = parseInt(rangeParts[2])

			message.actionType = ('M' + model_id + '_RECEIVE')
			message['m' + model_id] = results.data

			MetasheetDispatcher.dispatch(message)

			return message;
		});
	},

	fetchSearchRecords: function (relationId, label, term, offset, limit) {
		var relation = RelationStore.get(relationId)
		var oppModel = ModelStore.get(relation.related_model_id)
		var url = BASE_URL + '/m' + oppModel.model_id + '?' + label + '=ilike.*' + term + '*';
		offset = offset || 0
		limit = limit || 20

		var header = {
			'Range-Unit': 'items',
			'Range': (offset + '-' + (offset + limit))
		}

		return webUtils.ajax('GET', url, null, header).then(function (results) {
			var range = results.xhr.getResponseHeader('Content-Range')
			var rangeParts = range.split(/[-/]/)
			var res = {}
			res.searchRecords = results.data
			res.startIndex = parseInt(rangeParts[0])
			res.endIndex = parseInt(rangeParts[1])
			res.count = parseInt(rangeParts[2])
			return res
		})
	},


	fetchLevels: function (view, dimension, offset, limit) {
		var view_id = view.view_id
		var model_id = view.model_id
		var url = 'https://api.metasheet.io/v' + view_id + '_' + dimension + 's';
		var aggregates = view[dimension + '_aggregates']

		if (aggregates.length === 0) return

		url += '?order=' + aggregates.map(function (grouping) {
			var column = view.data.columns['a' + grouping]
			return column.column_id + (column.descending ? '.desc' : '.asc')
		}).join(',')

		var header = {
			'Range-Unit': 'items',
			'Range': (offset + '-' + (offset + limit))
		}

		return webUtils.ajax('GET', url, null, header).then(function (results) {
			var message = {}
			var range = results.xhr.getResponseHeader('Content-Range')
			var rangeParts = range.split(/[-/]/)

			message.startIndex = parseInt(rangeParts[0])
			message.endIndex = parseInt(rangeParts[1])
			message.numberLevels = parseInt(rangeParts[2])

			message.dimension = dimension
			message.aggregates = aggregates
			message.levels = results.data
			message.actionType = ('V' + view_id + '_RECEIVELEVELS').toUpperCase()

			MetasheetDispatcher.dispatch(message)
		})
	},

	fetchCubeValues: function (view, store, vOffset, vLimit, hOffset, hLimit) {
		var offset = 0
		var limit = 1000
		var view_id = view.view_id
		var url = BASE_URL + '/v' + view_id
		var sortSpec = view.data.rowSortSpec.concat(view.data.columnSortSpec);
		var sort = 'order=' + sortSpec.map(function(s) {
			var column = view.data.columns['a' + s.attribute_id]
			return 'a' + column.attribute_id + (column.descending ? '.desc' : '.asc')
		}).join(',');
		
		var filter = [];
		var makeFilterStr = function (agg, dimension, pos, invert) {
			var obj = store.getLevel(dimension, pos) || {}
			var val = obj['a' + agg]
			var dir = (view.data.columns['a' + agg].descending)
			if (invert) dir = !dir
			if (val !== null) filter.push(
				'a' + agg + '=' + (dir ? 'lte.' : 'gte.')  + val
			);
		}
		
		// the current filter only uses the highest-level aggregator
		// going deeper would require "or" conditions in the request or multiple requests
		if (view.row_aggregates.length) {
			makeFilterStr(view.row_aggregates[0], 'row', vOffset, false)
			makeFilterStr(view.row_aggregates[0], 'row', vOffset + vLimit, true)	
		}
		if (view.column_aggregates.length) {
			makeFilterStr(view.column_aggregates[0], 'column', hOffset, false)
			makeFilterStr(view.column_aggregates[0], 'column', hOffset + hLimit, true)
		}
		
		url += '?' + filter.concat(sort || []).join('&')

		var header = {
			'Range-Unit': 'items',
			'Range': ((hOffset + vOffset) + '-' + (hOffset + vOffset + hLimit, vLimit))
		}

		return webUtils.ajax('GET', url, null, header).then(function (results) {
			var message = {};
			var range = results.xhr.getResponseHeader('Content-Range');
			var rangeParts = range.split(/[-/]/);
			message.numberResults = parseInt(rangeParts[2]);
			message.actionType = ('V' + view_id + '_RECEIVEVALUES').toUpperCase();
			message.values = results.data;
			MetasheetDispatcher.dispatch(message);
		});
	},

	fetch: function (subject, selector) {
		var message = {};
		message.selector = selector;
	},

	create: function (subject, persist, obj) {
		var message = {};
		obj._dirty = true;
		obj._destroy = false;
		message[subject] = obj;
		message.actionType = subject.toUpperCase() + '_CREATE';
		MetasheetDispatcher.dispatch(message);

		if (persist) return webUtils.persist(subject, 'CREATE', obj);
		else return Promise.resolve(obj);
	},

	undestroy: function (subject, obj) {
		var message = {};
		obj._destroy = false;
		message[subject] = obj;
		message.actionType = subject.toUpperCase() + '_CREATE';
		MetasheetDispatcher.dispatch(message);
		return Promise.resolve(obj);
	},

	restore: function (subject, obj) {
		var message = {};
		obj = _.extend(obj, obj._server || {}, {_clean: true, _destroy: false});
		message[subject] = obj;
		message.actionType = subject.toUpperCase() + '_CREATE';
		MetasheetDispatcher.dispatch(message);
		return Promise.resolve(obj);
	},

	destroy: function (subject, persist, obj) {
		var message = {};
		message[subject] = obj;
		if (!persist && ((subject+'_id') in obj)) {
			// mark the object for destruction, but dont actually do it
			message.actionType = subject.toUpperCase() + '_CREATE';
			obj._destroy = true
		} else {
			message.actionType = subject.toUpperCase() + '_DESTROY';
		}
		MetasheetDispatcher.dispatch(message);
		
		if (persist) return webUtils.persist(subject, 'DESTROY', obj);
		else return Promise.resolve(obj);
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
	fetchModels: function (workspace_id) {
		var url = 'https://api.metasheet.io/model?workspace_id=eq.' + workspace_id;
		return webUtils.ajax('GET', url, null, {"Prefer": 'return=representation'}).then(function (result) {
			// models.data.map(function (model) {				
				return MetasheetDispatcher.dispatch({
					actionType: 'MODEL_RECEIVE',
					model: result.data
				})
			// })
		});
	},

	fetchWorkspaces: function () {
		webUtils.persist('workspace', 'FETCH', null);
	},

	createModel: function(model) {
		MetasheetDispatcher.dispatch({
			actionType: 'MODEL_CREATE',
			model: model
		});
		webUtils.persist('model', 'CREATE', _.pick(model, 'model_id', 'model', 'plural', 'workspace_id'));
	},

	dropModel: function (model) {
		webUtils.persist('model', 'DESTROY', model);
		MetasheetDispatcher.dispatch({
			actionType: 'MODEL_DESTROY',
			model: model
		});
	},

	// keys

	createKey: function(key) {
		var keycomps = KeycompStore.query({key_id: key.key_id})
		key.model_id = ModelStore.get(key.model_id).model_id
		
		MetasheetDispatcher.dispatch({
			actionType: 'KEY_CREATE',
			key: key
		});
		webUtils.persist('key', 'CREATE', key);
	},

	// views
	createView: function(view, persist) {
		view = _.clone(view)
		modelActions.create('view', persist, groomView(view))
	},

	updatePointer: function(view, pointer) {
		var message = {}
		message.actionType = 'POINTER_UPDATE'
		message.pointer = pointer
		return MetasheetDispatcher.dispatch(message)
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
