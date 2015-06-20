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
        var _this = this
        var models = _.isArray(payload.model)  ? payload.model : [payload.model]
        models.forEach(function (model) {
          model.dirty = false
          _this.create(model)
        })
        this.emitChange()
        break;
    }
  }
})

export default ModelStore;