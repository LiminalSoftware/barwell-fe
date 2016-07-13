import storeFactory from 'flux-store-factory';
import dispatcher from '../dispatcher/MetasheetDispatcher'
import _ from 'underscore'
import util from '../util/util'
import getGuid from './getGuid'
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
        this.create({model_id: payload.data.model_id});
        this.emitChange();
        break;

      case 'MODELCONFIG_CREATE':
        var config = this.get(payload.data.model_id) || {};
        Object.assign(config, payload.data);
        this.create(config);
        this.emitChange();
        break;

      case 'MODEL_DESTROY':
        this.destroy(payload.data);
        this.emitChange();
        break;

      case 'MODEL_RECEIVE':
        var _this = this;
        var models = payload.data;
        models.forEach(function (model) {
          _this.create({model_id: model.model_id});
        });
        this.emitChange();
        break;
    }
  }
})

export default ModelConfigStore;
