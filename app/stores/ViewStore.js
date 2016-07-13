import storeFactory from 'flux-store-factory';
import dispatcher from '../dispatcher/MetasheetDispatcher'

import _ from 'underscore'
import groomView from '../containers/Views/groomView'
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
        dispatcher.waitFor([
          AttributeStore.dispatchToken, 
          ModelStore.dispatchToken
        ]);
        var _this = this;
        var attribute = payload.data;
        var views = this.query({model_id: attribute.model_id});
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
        var view = payload.data
        var oldView = this.get(view.view_id) || {}
        var oldActionCid = oldView._actionCid || 'c0'
        
        if (util.cidNum(oldActionCid) > util.cidNum(payload.cid))
          return;

        if (!payload.safe)
          view = groomView(view)

        view._actionCid = payload.cid;
        this.create(view);
        this.emitChange();
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
          if(model.views instanceof Array) model.views.map(groomView).map(util.clean).map(_this.create)
        });
        this.emitChange()
        break;
    }
  }
})

export default ViewStore;
