import storeFactory from 'flux-store-factory';
import dispatcher from '../dispatcher/MetasheetDispatcher'
import _ from 'underscore'

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
        var _this = this
        var relations = _.isArray(payload.relation)  ? payload.relation : [payload.relation]
        models.forEach(function (relation) {
          relation._dirty = false
          _this.create(relation)
        })
        this.emitChange()
        break;
    }
  }
})

export default RelationStore;