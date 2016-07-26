import storeFactory from 'flux-store-factory';
import dispatcher from '../dispatcher/MetasheetDispatcher'
import _ from 'underscore'
import util from '../util/util'

import getGuid from './getGuid'
import ModelStore from './ModelStore'
import AttributeStore from './AttributeStore'
import KeyStore from './KeyStore'
import KeycompStore from './KeycompStore'

var RelationStore = storeFactory({
  identifier: 'relation_id',
  dispatcher: dispatcher,
  guidGenerator: getGuid,
  pivot: function(payload) {
    switch (payload.actionType) {
      
      case 'RELATION_CREATE':
        var rels = payload.data instanceof Array ? payload.data : [payload.data];
        rels.map(payload.isClean ? util.clean : _.identity).forEach(this.create)
        this.emitChange();
        break;
        
      case 'RELATION_DESTROY':
        this.destroy(payload.data);
        this.emitChange();
        break;

      case 'MODEL_CREATE':
        dispatcher.waitFor([
          AttributeStore.dispatchToken, 
          ModelStore.dispatchToken, 
          KeyStore.dispatchToken, 
          KeycompStore.dispatchToken
        ]);
        var _this = this;
        var models = payload.data instanceof Array ? payload.data : [payload.data];
        models.forEach(function (model) {
          if (model.relations instanceof Array) model.relations
            .map(payload.isClean ? util.clean : _.identity)
            .map(_this.create);
        });
        this.emitChange();
        break;
    }
  }
})

export default RelationStore;