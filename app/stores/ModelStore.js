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
        if (model.attributes instanceof Array) model._pk = 'a' + model.attributes.filter(function (attr) {
          return attr.type === 'PRIMARY_KEY'
        })[0].attribute_id

        this.create(_.pick(model, '_pk', 'model', 'model_id', 'cid', 
            'plural', 'lock_user', '_dirty', '_destroy'))
        this.emitChange()
        break;
    }
  }
})

export default ModelStore;