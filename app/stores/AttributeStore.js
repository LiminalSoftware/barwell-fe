import ModelStore from './ModelStore';
import storeFactory from 'flux-store-factory';
import dispatcher from '../dispatcher/MetasheetDispatcher';
import getGuid from './getGuid'

import _ from 'underscore';
import util from '../util/util';

var AttributeStore = storeFactory({
  identifier: 'attribute_id',
  dispatcher: dispatcher,
  guidGenerator: getGuid,
  pivot: function (payload) {
    switch (payload.actionType) {

      case 'ATTRIBUTE_CREATE':
        var attrs = payload.data instanceof Array ? payload.data : [payload.data];
        attrs.map(payload.isClean ? util.clean : _.identity).forEach(this.create)
        this.emitChange()
        break;

      case 'ATTRIBUTE_REVERT':
        var attr = payload.data
        var existing = this.get(attr.attribute_id)
        if (existing) this.create(_.extend(attr, existing._server, {_dirty: false}))
        else this.destroy(attr.cid)
        break;

      case 'ATTRIBUTE_DESTROY':
        this.destroy(payload.data)
        this.emitChange()
        break;

      case 'ATTRIBUTE_PURGE':
        this.purge(payload.selector)
        this.emitChange()
        break;

      // case 'ATTRIBUTE_RECEIVE':
      //   var attribute = payload.data
      //   if (!attribute) return;
      //   this.create(util.clean(payload.data))
      //   this.emitChange()
      //   break;

      case 'MODEL_CREATE':
        dispatcher.waitFor([ModelStore.dispatchToken]);
        var models = payload.data instanceof Array ? payload.data : [payload.data];
        var _this = this;
        models.forEach(function (model) {
          if (model.attributes) model.attributes
            .map(payload.isClean ? util.clean : _.identity)
            .map(_this.create)
        });
        this.emitChange();
        break;
    }
  }
})

export default AttributeStore;
