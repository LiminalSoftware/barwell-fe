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
        this.destroy(payload.attribute)
        this.emitChange()
        break;

      case 'ATTRIBUTE_RECEIVE':
        var _this = this
        var attributes = _.isArray(payload.attribute)  ? payload.attribute : [payload.attribute]
        attributes.forEach(function (attribute) {
          attribute.dirty = false;
          if (!attribute) return;
          _this.create(attribute)
        })
        this.emitChange()
        break;
    }
  }
})

export default AttributeStore;