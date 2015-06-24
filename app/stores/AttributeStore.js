import storeFactory from 'flux-store-factory';
import dispatcher from '../dispatcher/MetasheetDispatcher'
import _ from 'underscore'
import util from '../util/util'

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
        this.create(util.clean(attribute))
        this.emitChange()
        break;

      case 'MODEL_RECEIVE':
        var model = payload.model
        this.purge({model_id: model.model_id})  
        model.attributes.map(util.clean).map(this.create)
        break;
    }
  }
})

export default AttributeStore;