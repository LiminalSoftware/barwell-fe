import storeFactory from 'flux-store-factory';
import dispatcher from '../dispatcher/MetasheetDispatcher'
import _ from 'underscore'
import util from '../util/util'

import ModelStore from './ModelStore'

var ModelConfigStore = storeFactory({
  identifier: 'model_id',
  dispatcher: dispatcher,
  pivot: function(payload) {
    switch (payload.actionType) {
      case 'MODEL_CREATE':
        dispatcher.waitFor([
          ModelStore.dispatchToken
        ]);
        this.create({model_id: payload.model.model_id});
        this.emitChange();
        break;

      case 'MODELCONFIG_CREATE':
        var config = this.get(payload.modelconfig.model_id) || {};
        Object.assign(config, payload.modelconfig);
        this.create(config);
        this.emitChange();
        break;

      case 'MODEL_DESTROY':
        this.destroy(payload.model);
        this.emitChange();
        break;

      case 'MODEL_RECEIVE':
        var _this = this;
        var models = payload.model;
        models.forEach(function (model) {
          _this.create({model_id: model.model_id});
        });
        this.emitChange();
        break;
    }
  }
})

export default ModelConfigStore;
