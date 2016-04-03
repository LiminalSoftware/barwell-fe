import storeFactory from 'flux-store-factory';
import dispatcher from '../dispatcher/MetasheetDispatcher'
import _ from 'underscore'
import util from '../util/util'

var ModelConfigStore = storeFactory({
  identifier: 'model_id',
  dispatcher: dispatcher,
  pivot: function(payload) {
    switch (payload.actionType) {
      case 'MODEL_CREATE':
        this.create({model_id: payload.model.model_id});
        this.emitChange();
        break;

      case 'MODELCONFIG_CREATE':
        this.create(payload.modelconfig);
        this.emitChange();
        break;

      case 'MODEL_DESTROY':
        this.destroy(payload.model);
        this.emitChange();
        break;

      case 'MODEL_RECEIVE':
        this.emitChange()
        break;
    }
  }
})

export default ModelConfigStore;
