import storeFactory from 'flux-store-factory';
import dispatcher from '../dispatcher/MetasheetDispatcher'
import _ from 'underscore'
import util from '../util/util'

import ModelStore from './ModelStore'
import AttributeStore from './AttributeStore'
import KeyStore from './KeyStore'
import KeycompStore from './KeycompStore'

var RelationStore = storeFactory({
  identifier: 'relation_id',
  dispatcher: dispatcher,
  pivot: function(payload) {
    switch (payload.actionType) {
      case 'RELATION_CREATE':

        console.log('RELATION_CREATE payload.relation: '+ JSON.stringify(payload.relation, null, 2));
        this.create(payload.relation);
        this.emitChange();
        break;
        
      case 'RELATION_DESTROY':
        this.destroy(payload.relation);
        this.emitChange();
        break;
        
      case 'RELATION_RECEIVE':
        var relation = payload.relation
        relation._dirty = false
        this.create(relation)
        this.emitChange()
        break;

      case 'MODEL_RECEIVE':
        dispatcher.waitFor([
          AttributeStore.dispatchToken, 
          ModelStore.dispatchToken, 
          KeyStore.dispatchToken, 
          KeycompStore.dispatchToken
        ]);
        var _this = this;
        var models = payload.model instanceof Array ? payload.model : [payload.model];
        models.forEach(function (model) {
          if (model.relations instanceof Array) model.relations.map(util.clean).map(_this.create);
        });
        this.emitChange();
        break;
    }
  }
})

export default RelationStore;