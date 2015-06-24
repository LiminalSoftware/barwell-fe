import storeFactory from 'flux-store-factory';
import dispatcher from '../dispatcher/MetasheetDispatcher'
import _ from 'underscore'

var ModelStore = storeFactory({
  identifier: 'model_id',
  dispatcher: dispatcher,
  pivot: function(payload) {
    switch (payload.actionType) {
      case 'MODEL_CREATE':
        this.create(payload.model)
        this.emitChange()
        break;
        
      case 'MODEL_DESTROY':
        this.destroy(payload.model)
        this.emitChange()
        break;
        
      case 'MODEL_RECEIVE':
        var model = payload.model
        model._dirty = false
        this.create(_.pick(model, 'model', 'model_id', 'cid', 
            'plural', 'lock_user', '_dirty', '_destroy'))
        this.emitChange()
        break;
    }
  }
})

export default ModelStore;