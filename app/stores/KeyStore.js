import storeFactory from 'flux-store-factory';
import dispatcher from '../dispatcher/MetasheetDispatcher'
import _ from 'underscore'

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

      case 'KEY_RECEIVE':
        var _this = this
        var keys = _.isArray(payload.key)  ? payload.key : [payload.key]
        keys.forEach(function (key) {
          key.dirty = false
          _this.create(key)
        })
        this.emitChange()
        break;
    }
  }
})

export default KeyStore;