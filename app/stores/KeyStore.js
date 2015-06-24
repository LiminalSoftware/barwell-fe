import storeFactory from 'flux-store-factory';
import dispatcher from '../dispatcher/MetasheetDispatcher'
import _ from 'underscore'
import util from '../util/util'

var KeyStore = storeFactory({
  identifier: 'key_id',
  dispatcher: dispatcher,
  pivot: function(payload) {
    switch (payload.actionType) {
      case 'KEY_CREATE':
        this.create(payload.key)
        this.emitChange()
        break;

      case 'KEY_DESTROY':
        this.destroy(payload.key)
        this.emitChange()
        break;

      case 'KEY_PURGE':
        this.purge(payload.selector)
        this.emitChange()
        break;

      case 'KEY_RECEIVE':
        var key = payload.key
        keys.forEach(function (key) {
          key._dirty = false
          _this.create(key)
        })
        this.emitChange()
        break;

      case 'MODEL_RECEIVE':
        var model = payload.model
        this.purge({model_id: model.model_id})
        model.keys.map(util.clean).map(this.create)
        break;
    }
  }
})

export default KeyStore;