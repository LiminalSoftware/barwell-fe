import storeFactory from 'flux-store-factory';

import dispatcher from '../dispatcher/MetasheetDispatcher'
import _ from 'underscore'
import util from '../util/util'
import getGuid from './getGuid'

var ModelStore = storeFactory({
  identifier: 'model_id',
  dispatcher: dispatcher,
  guidGenerator: getGuid,
  pivot: function (payload) {
    switch (payload.actionType) {

      case 'MODEL_DESTROY':
        this.destroy(payload.data)
        this.emitChange()
        break;

      case 'MODEL_CREATE':
        var _this = this;
        var models = payload.data instanceof Array ? payload.data : [payload.data];
        models.forEach(function (model) {
          if (model.attributes instanceof Array) model._pk =
            'a' + model.attributes.filter(attr => attr.type === 'PRIMARY_KEY')[0].attribute_id
          model = _.pick(model, '_pk', 'model', 'model_id', 'cid', 'workspace_id', 'label_attribute_id', 'label_key_id',
              'primary_key_key_id', 'plural', 'lock_user', '_dirty', '_destroy')
          if (payload.isClean) model = util.clean(model)
          _this.create(model)
        });
        
        this.emitChange()
        break;
    }
  }
});

export default ModelStore;
