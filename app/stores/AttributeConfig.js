import ModelStore from './ModelStore'
import AttributeStore from './AttributeStore'
import AttributeStore from './ViewStore'
import storeFactory from 'flux-store-factory'
import dispatcher from '../dispatcher/MetasheetDispatcher'
import getGuid from './getGuid'

import _ from 'underscore'
import util from '../util/util'

var AttributeViewConfigStore = storeFactory({
  identifier: 'attribute_config_id',
  dispatcher: dispatcher,
  guidGenerator: getGuid,
  pivot: function (payload) {
    switch (payload.actionType) {

      case 'MODEL_CREATE':
        dispatcher.waitFor([ModelStore.dispatchToken]);
        dispatcher.waitFor([AttributeStore.dispatchToken]);
        dispatcher.waitFor([ViewStore.dispatchToken]);

        const _this = this;
        let models = payload.data instanceof Array ? payload.data : [payload.data]
        
        views.forEach(view => {
          view.columns.forEach(column => {
            _this.create(column)
          })
        })

      case 'VIEW_CREATE':
        dispatcher.waitFor([ModelStore.dispatchToken]);
        dispatcher.waitFor([AttributeStore.dispatchToken]);
        dispatcher.waitFor([ViewStore.dispatchToken]);

        let views = payload.data
        if (views instanceof Object) views = [views]

        var _this = this;
        views.forEach(view => {
          view.columns.forEach(column => {
            _this.create(column)
          })
        })


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
