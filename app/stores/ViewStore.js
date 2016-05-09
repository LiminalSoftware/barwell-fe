import storeFactory from 'flux-store-factory';
import dispatcher from '../dispatcher/MetasheetDispatcher'

import _ from 'underscore'
import groomView from '../containers/Views/groomView'
import util from '../util/util'

import ModelStore from './ModelStore'
import AttributeStore from './AttributeStore'
import RelationStore from './RelationStore'
import KeyStore from './KeyStore'
import KeycompStore from './KeycompStore'

var ViewStore = storeFactory({
  identifier: 'view_id',
  dispatcher: dispatcher,
  pivot: function(payload) {

    switch (payload.actionType) {

      case 'ATTRIBUTE_CREATE':
      case 'ATTRIBUTE_DESTROY':
        dispatcher.waitFor([
          AttributeStore.dispatchToken, 
          ModelStore.dispatchToken
        ]);
        var _this = this;
        var attribute = payload.attribute;
        var views = this.query({model_id: attribute.model_id});
        views.map(function (view) {
          view = groomView(view)
          _this.create(view)
        })
        this.emitChange()
        break;

      case 'VIEW_CREATE':
        var view = _.clone(payload.view)
        if (!payload.safe) view = groomView(view)
        this.create(payload.view)
        this.emitChange()
        break;

      case 'VIEW_DESTROY':
        this.destroy(payload.view)
        this.emitChange()
        break;

      case 'VIEW_RECEIVE':
        dispatcher.waitFor([
          AttributeStore.dispatchToken, 
          ModelStore.dispatchToken, 
          RelationStore.dispatchToken, 
          KeycompStore.dispatchToken
        ]);
        var view = _.clone(payload.view)
        if (!(view instanceof Object)) return;
        view = view
        view._dirty = false
        this.create(view);
        this.emitChange();
        break;

      case 'MODEL_RECEIVE':
        dispatcher.waitFor([
          AttributeStore.dispatchToken, 
          RelationStore.dispatchToken, 
          ModelStore.dispatchToken,
          KeyStore.dispatchToken,
          KeycompStore.dispatchToken,
        ]);
        var models = payload.model instanceof Array ? payload.model : [payload.model]
        var _this = this;
        models.forEach(function (model) {
          if('views' in model) model.views.map(util.clean).map(_this.create)
        });
        this.emitChange()
        break;
    }
  }
})

export default ViewStore;
