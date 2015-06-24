import storeFactory from 'flux-store-factory';
import dispatcher from '../dispatcher/MetasheetDispatcher'
import _ from 'underscore'
import util from '../util/util'

var RelationStore = storeFactory({
  identifier: 'relation_id',
  dispatcher: dispatcher,
  pivot: function(payload) {
    switch (payload.actionType) {
      case 'RELATION_CREATE':

        console.log('RELATION_CREATE payload.relation: '+ JSON.stringify(payload.relation, null, 2));
        this.create(payload.relation)
        this.emitChange()
        break;
        
      case 'RELATION_DESTROY':
        this.destroy(payload.relation)
        this.emitChange()
        break;
        
      case 'RELATION_RECEIVE':
        var relation = payload.relation
        relation._dirty = false
        this.create(relation)
        this.emitChange()
        break;

      case 'MODEL_RECEIVE':
        var model = payload.model
        if(!('relations' in model)) return;
        this.purge({model_id: model.model_id});
        (model.relations || []).map(this.create)
        this.emitChange()
        break;
    }
  }
})

export default RelationStore;