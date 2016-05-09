import storeFactory from 'flux-store-factory';
import dispatcher from '../dispatcher/MetasheetDispatcher'
import _ from 'underscore'
import util from '../util/util'

import ModelStore from "./ModelStore"
import AttributeStore from "./AttributeStore"
import KeycompStore from "./KeycompStore"

var KeyStore = storeFactory({
  identifier: 'key_id',
  dispatcher: dispatcher,
  pivot: function(payload) {
    switch (payload.actionType) {
      case 'KEY_CREATE':
        this.create(payload.key)
        this.emitChange()
        break

      case 'KEYCOMP_CREATE':
        var keycomp = payload.keycomp
        var related_key = this.get(keycomp.key_id) || {}
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
        if(!key) return;
        key._dirty = false
        key._named = true
        this.create(key)
        this.emitChange()
        break;

      case 'MODEL_RECEIVE':
        dispatcher.waitFor([
          AttributeStore.dispatchToken, 
          ModelStore.dispatchToken
        ]);
        var _this = this;
        var models = payload.model instanceof Array ? payload.model : [payload.model]
        // this.purge();
        models.forEach(function (model) {
          (model.keys || []).map(util.clean).map(_this.create)
        });
        this.emitChange()
        break;
    }
  }
})

global.KeyStore = KeyStore;

export default KeyStore;