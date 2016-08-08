import storeFactory from 'flux-store-factory';
import dispatcher from '../dispatcher/MetasheetDispatcher'

import _ from 'underscore'
import groomView from '../Views/groomView'
import util from '../util/util'

import getGuid from './getGuid'
import ModelStore from './ModelStore'
import AttributeStore from './AttributeStore'
import RelationStore from './RelationStore'
import KeyStore from './KeyStore'
import KeycompStore from './KeycompStore'

var ViewStore = storeFactory({
	identifier: 'view_id',
	dispatcher: dispatcher,
	guidGenerator: getGuid,
	pivot: function(payload) {

		switch (payload.actionType) {

			case 'ATTRIBUTE_CREATE':
			case 'ATTRIBUTE_DESTROY':
			case 'RELATION_CREATE':
			case 'RELATION_DESTROY':
				dispatcher.waitFor([
					RelationStore.dispatchToken,
					AttributeStore.dispatchToken, 
					ModelStore.dispatchToken
				]);
				var _this = this;
				var entity = payload.data;
				var views = this.query({model_id: entity.model_id});
				views.map(function (view) {
					view = groomView(view)
					_this.create(view)
				})
				this.emitChange()
				break;



			case 'VIEW_CREATE':
				dispatcher.waitFor([
					AttributeStore.dispatchToken, 
					ModelStore.dispatchToken, 
					RelationStore.dispatchToken, 
					KeycompStore.dispatchToken
				]);
				let isChanged = false
				let views = payload.data
				if (views instanceof Object) views = [views]

				views.forEach(view => {
					var oldView = this.get(view.view_id) || {}
					var oldVersion = oldView._version || 0
					var newVersion = util.cidNum(payload.cid)
					
					// we ignore server side confirmations for views unless 
					// there are structural changes (aggregates)
					if (oldVersion > newVersion || 
						(oldView && payload.isClean)) 
						return;

					if (!payload.safe)
						view = groomView(view)

					view._version = newVersion;
					this.create(view);
					isChanged = true
				})
				if (isChanged) this.emitChange();
				break;

			case 'VIEW_DESTROY':
				this.destroy(payload.data)
				this.emitChange()
				break;

			case 'MODEL_CREATE':
				dispatcher.waitFor([
					AttributeStore.dispatchToken, 
					RelationStore.dispatchToken, 
					ModelStore.dispatchToken,
					KeyStore.dispatchToken,
					KeycompStore.dispatchToken,
				]);
				var models = payload.data instanceof Array ? payload.data : [payload.data]
				var _this = this;
				models.forEach(function (model) {
					if(model.views instanceof Array) model.views.map(groomView).map(_this.create)
				});
				this.emitChange()
				break;
		}
	}
})

export default ViewStore;
