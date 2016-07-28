import MetasheetDispatcher from "../dispatcher/MetasheetDispatcher"
import webUtils from "../util/MetasheetWebAPI.jsx"
import _ from 'underscore'

import getGuid from '../stores/getGuid'

import ModelStore from '../stores/ModelStore'
import ViewConfigStore from '../stores/ViewConfigStore'
import RelationStore from '../stores/RelationStore'
import TransactionStore from '../stores/TransactionStore'
import transactionObserver from './transactionObserver'


import pluralize from 'pluralize'
import groomView from '../Views/groomView'
import util from '../util/util'

var BASE_URL = 'http://api.metasheet.io'
const MAX_CUBE_LEVELS = 5000
const WINDOW_ROWS = 50
const WINDOW_COLS = 30
const CUBE_OFFSET_TOLERANCE = 10

var _actionCid = 0;

var modelActions = {

	// ========================================================================
	// == NON-TRANSACTIONAL EVENTS
	// ========================================================================

	createNotification: function (notification) {
		notification.actionType = 'NOTIFY';
		MetasheetDispatcher.dispatch(notification);
	},

	clearNotification: function (notification) {
		notification.actionType = 'CLEAR_NOTIFICATION'
		MetasheetDispatcher.dispatch(notification);
	},

	updateNotification: function (notification) {
		notification.actionType = 'UPDATE_NOTIFICATION'
		MetasheetDispatcher.dispatch(notification);
	},

	setWorkspace: function (workspaceId) {
		var message = {
			actionType: 'SET_WORKSPACE',
			workspaceId: workspaceId
		}
		MetasheetDispatcher.dispatch(message);
	},

	setFocus: function (focus) {
		var message = {
			actionType: 'SET_FOCUS',
			focus: focus
		}
		MetasheetDispatcher.dispatch(message);
	},

	selectRecord: function (view, id) {
		var message = {
			model_id: view.model_id,
			actionType: 'RECORD_TOGGLESELECT',
			id: id
		}
		MetasheetDispatcher.dispatch(message);
	},

	unselectRecords: function (view) {
		var message = {
			model_id: view.model_id,
			actionType: 'UNSELECT'
		}
		MetasheetDispatcher.dispatch(message);
	},

	// ========================================================================
	// == TRANSACTIONAL EVENTS
	// ========================================================================

	insertRecord: function (model, obj, position) {
		var message = {
			entity: 'record',
			actionType: 'RECORD_INSERT',
			model_id: model.model_id,
			model: model,
			data: obj instanceof Array ? obj : [obj],
			index: position,
			narrative: 'New ${model} inserted',
			icon: 'icon-flare',
			cid: 'c' + getGuid() // action cid
		}
		MetasheetDispatcher.dispatch(message)
	},

	bulkDestroyRecords: function (model, selector) {
		if (!selector instanceof Object) throw new Error ('Delete without qualifier is not permitted')
		var message = {
			entity: 'record',
			actionType: 'RECORD_BULKDESTROY',
			model: model,
			model_id: model.model_id,
			selector: selector,
			cid: 'c' + getGuid() // action cid
		};
		MetasheetDispatcher.dispatch(message);
	},

	bulkPatchRecords: function (model, obj, selector, extras) {

		if (!(selector instanceof Object)) throw new Error ('Patch without qualifier is not permitted')
		if (!(obj instanceof Object)) throw new Error('Patch should be a single naked object');

		var message = _.extend(extras || {}, {
			actionType: 'BULK_UPDATE',
			model: model,
			data: obj,
			selector: selector,
			cid: 'c' + getGuid() // action cid
		});
		MetasheetDispatcher.dispatch(message);
	},

	deleteMultiRecords: function (model, obj, extras) {
		obj = obj.map(function (rec) {
			var _pk = model._pk
			return {[_pk]: rec[_pk], action: 'D'}
		});
		var message = _.extend(extras || {}, {
			entity: 'record',
			actionType: 'RECORD_MULTIDELETE',
			model: model,
			model_id: model.model_id,
			data: obj instanceof Array ? obj : [obj],
			cid: 'c' + getGuid(), // action cid
			narrative: obj.length > 1 ? 
				(obj.length + ' ${plural}' + ' deleted')
				: ('${capsModel} deleted'),
			icon: 'icon-trash2'
		});
		MetasheetDispatcher.dispatch(message);
	},

	multiPatchRecords: function (model, obj, extras) {
		if (!(obj instanceof Array)) obj = [obj]

		var message = _.extend(extras || {}, {
			entity: 'record',
			actionType: 'RECORD_MULTIUPDATE',
			model: model,
			model_id: model.model_id,
			data: obj instanceof Array ? obj : [obj],
			cid: 'c' + getGuid(), // action cid
			narrative: (obj.length > 1 ? (obj.length + ' ${plural}') : '${capsModel}') + ' updated'
					+ (extras.method ? (' by ' + extras.method) : ''),
			icon: extras.method === 'copy/paste' ? 
				'icon-clipboard-check' : 
				extras.method === 'clearing selection' ? 
				'icon-broom' :
				'icon-keyboard'

		});
		MetasheetDispatcher.dispatch(message);
	},

	//---------------------

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
			hasManyKeyAttrs: hasManyKeyAttrs,
			method: ' dragging a related item'
		}
		modelActions.patchRecords(hasOneModel, patch, selector, extras)
	},

	fetchModelActions: function (model, offset, limit) {
		offset = offset || 0
		limit = limit || 50
		var header = {
			'Range-Unit': 'items',
			'Range': (offset + '-' + (offset + limit))
		}
		var workspaceId = model.workspace_id
		var url = BASE_URL + '/w' + workspaceId + '_action?order=action_id.desc';
		return webUtils.ajax('GET', url, null, header).then(function (results) {
			MetasheetDispatcher.dispatch({
				actionType: 'ACTION_CREATE',
				data: results.data,
				isClean: true
			})
		})
	},

	fetchRecords: function (view, offset, limit, sortSpec) {
		var view_id = view.view_id
		var model_id = view.model_id
		var url = BASE_URL + '/v' + view_id;
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

			message.actionType = ('RECORD_RECIEVEFETCH')
			message.model_id = model_id
			message.records = results.data

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

	fetchVennValues: function (view, store) {
		var view_id = view.view_id
		var url = BASE_URL + '/v' + view_id
		var header = {
			'Range-Unit': 'items',
			'Range': '0-100'
		}

		return webUtils.ajax('GET', url, null, header).then(function (results) {
			var range = results.xhr.getResponseHeader('Content-Range');
			var rangeParts = range.split(/[-/]/);
			var message = {
				numberResults: parseInt(rangeParts[2]),
				actionType: 'CUBE_RECEIVEVALUES',
				values: results.data,
				view_id: view.view_id
			};
			
			MetasheetDispatcher.dispatch(message);
		});
	},

	fetchCubeLevels: function (view, store, dimension) {
		var view_id = view.view_id
		var model_id = view.model_id
		var url = BASE_URL + '/v' + view_id + '_' + dimension + 's';
		var aggregates = view[dimension + '_aggregates'] || []
		var header = {
			'Range-Unit': 'items',
			'Range': ('0' + '-' + MAX_CUBE_LEVELS)
		}


		if (aggregates.length === 0 || _.isEqual(aggregates,
		 store.getRequestedDimensions(dimension) )) return;

		url += '?order=' + aggregates.map(function (grouping) {
			var column = view.data.columns['a' + grouping]
			return column.column_id + (column.descending ? '.desc' : '.asc')
		}).join(',')

		
		MetasheetDispatcher.dispatch({
			actionType: 'CUBE_REQUESTLEVELS',
			dimension: dimension,
			aggregates: aggregates
		})

		return webUtils.ajax('GET', url, null, header).then(function (results) {
			var range = results.xhr.getResponseHeader('Content-Range')
			var rangeParts = range.split(/[-/]/)

			MetasheetDispatcher.dispatch({
				startIndex: parseInt(rangeParts[0]),
				endIndex: parseInt(rangeParts[1]),
				numberLevels: parseInt(rangeParts[2]),
				dimension: dimension,
				aggregates: aggregates,
				levels: results.data,
				view_id: view.view_id,
				actionType: 'CUBE_RECEIVELEVELS'
			})
		})
	},

	fetchCubeValues: function (view, store, offset) {
		var view_id = view.view_id
		var url = BASE_URL + '/v' + view_id
		var sortSpec = (view.data.rowSortSpec || []).concat(view.data.columnSortSpec || []);
		var shouldFetch = ['row', 'column'].some(function (dim) {
			var reqStart = store.getRequestedStart(dim)
			return (reqStart === null) || Math.abs(reqStart - offset[dim]) > CUBE_OFFSET_TOLERANCE
		})
		var sort = (sortSpec.length > 0 ? 'order=' : '') + sortSpec.map(function(s) {
			var column = view.data.columns[s.attribute]
			return 'a' + column.attribute_id + (column.descending ? '.desc' : '.asc')
		}).join(',');
		
		var filter = [];
		var makeFilterStr = function (agg, dimension, pos, invert) {
			var obj = store.getLevel(dimension, pos)
			var val = obj['a' + agg]
			var dir = (view.data.columns['a' + agg].descending)
			if (invert) dir = !dir
			if (val !== null) filter.push(
				'a' + agg + '=' + (dir ? 'lte.' : 'gte.')  + val
			);
		}

		if (!shouldFetch) return;
		
		// the current filter only uses the highest-level aggregator
		// going deeper would require "or" conditions in the request or multiple requests
		if (view.row_aggregates.length) {
			makeFilterStr(view.row_aggregates[0], 'row', offset.row, false)
			makeFilterStr(view.row_aggregates[0], 'row', offset.row + WINDOW_ROWS, true)	
		}
		if (view.column_aggregates.length) {
			makeFilterStr(view.column_aggregates[0], 'column', offset.column, false)
			makeFilterStr(view.column_aggregates[0], 'column', offset.column + WINDOW_COLS, true)
		}
		
		url += '?' + filter.concat(sort || []).join('&')

		var header = {
			'Range-Unit': 'items',
			'Range': '0' + '-' + (WINDOW_ROWS * WINDOW_COLS)
		}

		MetasheetDispatcher.dispatch({
			actionType: 'CUBE_REQUESTVALUES',
			offset: offset,
			view_id: view.view_id
		});

		return webUtils.ajax('GET', url, null, header).then(function (results) {
			var rangeParts = results.xhr.getResponseHeader('Content-Range').split(/[-/]/);
			MetasheetDispatcher.dispatch({
				numberResults: parseInt(rangeParts[2]),
				actionType: 'CUBE_RECEIVEVALUES',
				offset: offset,
				values: results.data,
				view_id: view.view_id
			});
		});
	},

	create: function (subject, persist, obj, extras) {
		var pk = subject + '_id'
		obj._dirty = true;
		obj._destroy = false;

		if (!obj[pk] && !obj.cid) obj.cid = 'c' + getGuid()
		
		MetasheetDispatcher.dispatch(Object.assign({
			data: obj,
			isTemporary: !persist,
			entity: subject,
			actionType: subject.toUpperCase() + '_CREATE',
			cid: 'c' + getGuid(), // action cid
		}, extras || {}));
	},

	revert: function (subject, obj) {
		MetasheetDispatcher.dispatch({
			actionType: subject.toUpperCase() + '_REVERT',
			entity: subject,
			data: obj
		});
	},

	destroy: function (subject, persist, obj, extras) {
		obj._dirty = true;
		obj._destroy = true;
		
		MetasheetDispatcher.dispatch(Object.assign({
			data: obj,
			isTemporary: !persist,
			entity: subject,
			actionType: subject.toUpperCase() + (persist ? '_DESTROY' : '_CREATE'),
			cid: 'c' + getGuid(), // action cid
		}, extras || {}));
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
		var url = BASE_URL + '/model?workspace_id=eq.' + workspace_id;
		var retrySettings = {
			period: 50,
			strategy: 'double',
			notification_key: 'workspaceLoad'
		}

		modelActions.createNotification({
			narrative: 'Fetching workspace details', 
			type: 'loading',
			icon: ' icon-loading spin ',
			notification_key: 'workspaceLoad',
			notificationTime: 0
		});

		return webUtils.ajax('GET', url, null, retrySettings, {"Prefer": 'return=representation'}).then(function (result) {
			return MetasheetDispatcher.dispatch({
				actionType: 'MODEL_CREATE',
				isClean: true,
				data: result.data
			})
		}).then(function () {
			modelActions.clearNotification({
				notification_key: 'workspaceLoad'
			})
		}).catch(function (error) {
			console.log(error)
			modelActions.createNotification({
				narrative: 'A critical error has occured on the server.  Unfortunately this is not recoverable. Details: ' + JSON.stringify(error), 
				type: 'error-item',
				icon: ' icon-warning ',
				notification_key: 'workspaceLoad',
			});
		});
	},

	fetchWorkspaces: function () {
		webUtils.persist('workspace', 'FETCH', null);
	},

	createNewModel: function(workspaceId) {
		var name = 'Thing'
		var iter = 1
		while (ModelStore.query({workspace_id: workspaceId, model: name}).length > 0) {
			name = 'Thing ' + (iter++)
		}
		modelActions.create('model', true, {
			model: name,
			workspace_id: workspaceId,
		})
	},

	updateModel: function (obj) {
		var model = ModelStore.get(obj.model_id)
		if (!model) throw new Error('Could not find model: ' + model_id);
		model.model = obj.model
		if (obj.plural) moodel.plural = obj.plural
		else model.plural = pluralize.plural(obj.model)

		modelActions.create('model', true, model)
	},

	dropModel: function (model) {
		
	},

	// keys

	createKey: function(key) {
		var keycomps = KeycompStore.query({key_id: key.key_id})
		key.model_id = ModelStore.get(key.model_id).model_id
		
		MetasheetDispatcher.dispatch({
			actionType: 'KEY_CREATE',
			key: key
		});
		// webUtils.persist('key', 'CREATE', key);
	},

	// views
	createView: function(view, persist) {
		view = _.clone(view)
		modelActions.create('view', persist, groomView(view), {hiddenTxn: true})
	},

	updatePointer: function(view, pointer) {
		var message = {}
		message.actionType = 'POINTER_UPDATE'
		message.pointer = pointer
		return MetasheetDispatcher.dispatch(message)
	},

	destroyView: function(view) {
		MetasheetDispatcher.dispatch({
			actionType: 'VIEW_DESTROY',
			view: view
		});
	}
}

export default modelActions
