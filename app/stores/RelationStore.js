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
  pivot: function(payload) {
    switch (payload.actionType) {
      case 'RELATION_CREATE':

        console.log('RELATION_CREATE payload.data: '+ JSON.stringify(payload.data, null, 2));
        this.create(payload.data);
        this.emitChange();
        break;
        
      case 'RELATION_DESTROY':
        this.destroy(payload.data);
        this.emitChange();
        break;
        
      case 'RELATION_RECEIVE':
        var relation = payload.data
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
        var models = payload.data instanceof Array ? payload.data : [payload.data];
        models.forEach(function (model) {
          if (model.relations instanceof Array) model.relations.map(util.clean).map(_this.create);
        });
        this.emitChange();
        break;
    }
  }
})

export default RelationStore;