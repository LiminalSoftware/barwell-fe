import _ from "underscore"
import $ from 'jquery'

import ModelStore from "../../../../stores/ModelStore"

import modelActionCreators from "../../../../actions/modelActionCreators"

import ViewDataStores from "../../../../stores/ViewDataStores"
import storeFactory from 'flux-store-factory';
import dispatcher from '../../../../dispatcher/MetasheetDispatcher'

var createTabularStore = function (view) {
	var model = ModelStore.get(view.model_id)
	var store = storeFactory({
		identifier: (model._pk),
  		dispatcher: dispatcher,
  		pivot: function(payload) {
	    	var type = payload.actionType
	    	var label = 'm' + view.model_id
	    	var upperLabel = label.toUpperCase()

    		if (type === (upperLabel + '_CREATE')) {
    			var obj = payload[label]
    			this.create(obj)
    			this.emitChange()
    		}

    		// if (type === (upperLabel + '_INSERT')) {
    		// 	var obj = payload[label]
    		// 	this.create(obj)
    		// }

    		if (type === (upperLabel + '_DESTROY')) {
    			this.destroy(payload[label])
    			this.emitChange()
    		}

    		if (type === (upperLabel + '_RECEIVEUPDATE')) {
    			var update = payload[label][0]
    			var existing = store.get(update.cid || update[model._pk])
    			var clean = {_dirty: false}

    			existing = _.extend(existing, update, clean)
    			this.create(existing)
    			this.emitChange()
    		}

    		if (type === (upperLabel + '_UPDATE')) {
    			var _this = this
    			var update = payload[label]	
    			var selector = payload.selector
    			var existing = store.get(update[model._pk]  || update.cid)
    			var dirty = {_dirty: true}

    			store.query(selector).forEach(function (obj) {
    				obj = _.extend(obj, update, dirty)
    				_this.create(obj)
    			})
    			this.emitChange()
    		}
	        
	      if (type === (upperLabel + '_RECEIVE')) {
	      	var _this = this
	      	var objects = payload[label]
	      	var startIndex = payload.startIndex
	        	var endIndex = payload.endIndex

	        	if (!_.isArray(objects)) objects = [objects]
	      	objects.forEach(function (obj, idx) {
	      		obj._idx = startIndex + idx;
	      		_this.create(obj)
	      	});
    			this.emitChange()
    		}
  		}
	})

	return store;
}


export default createTabularStore