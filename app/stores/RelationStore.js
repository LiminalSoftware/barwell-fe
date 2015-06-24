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
    }
  }
})

export default RelationStore;