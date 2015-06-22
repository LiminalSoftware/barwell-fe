import storeFactory from 'flux-store-factory';
import dispatcher from '../dispatcher/MetasheetDispatcher'
import _ from 'underscore'

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
        var objects = this.query(payload.attribute).forEach(function (obj) {
          this.destroy(obj)
        });
        this.emitChange()
        break;

      case 'ATTRIBUTE_PURGE':
        var objects = this.purge(payload.attribute)
        this.emitChange()
        break;

      case 'ATTRIBUTE_RECEIVE':
        var _this = this
        var attributes = _.isArray(payload.attribute)  ? payload.attribute : [payload.attribute]
        attributes.forEach(function (attribute) {
          attribute._dirty = false;
          if (!attribute) return;
          _this.create(attribute)
        })
        this.emitChange()
        break;

    }
  }
})

export default AttributeStore;