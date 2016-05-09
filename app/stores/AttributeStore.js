import ModelStore from './ModelStore';
import storeFactory from 'flux-store-factory';
import dispatcher from '../dispatcher/MetasheetDispatcher';

import _ from 'underscore';
import util from '../util/util';

var AttributeStore = storeFactory({
  identifier: 'attribute_id',
  dispatcher: dispatcher,
  pivot: function (payload) {
    switch (payload.actionType) {

      case 'ATTRIBUTE_CREATE':
        this.create(payload.attribute)
        this.emitChange()
        break;

      case 'ATTRIBUTE_DESTROY':
        this.destroy(payload.attribute)
        this.emitChange()
        break;

      case 'ATTRIBUTE_PURGE':
        this.purge(payload.selector)
        this.emitChange()
        break;

      case 'ATTRIBUTE_RECEIVE':
        var attribute = payload.attribute
        if (!attribute) return;
        this.create(util.clean(payload.attribute))
        this.emitChange()
        break;

      case 'MODEL_RECEIVE':
        dispatcher.waitFor([ModelStore.dispatchToken]);
        var models = payload.model; //instanceof Array ? payload.model : [payload.model]
        var _this = this;
        models.forEach(function (model) {
          model.attributes.map(util.clean).map(_this.create)
        });
        this.emitChange();
        break;
    }
  }
})

export default AttributeStore;
