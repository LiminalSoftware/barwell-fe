import storeFactory from 'flux-store-factory';
import dispatcher from '../dispatcher/MetasheetDispatcher'
import _ from 'underscore'
import util from '../util/util'

var KeycompStore = storeFactory({
  identifier: 'keycomp_id',
  dispatcher: dispatcher,
  pivot: function(payload) {

    switch (payload.actionType) {
      case 'KEYCOMP_CREATE':
        this.create(payload.keycomp)
        this.emitChange()
        break;

      case 'KEYCOMP_DESTROY':
        this.destroy(payload.keycomp)
        this.emitChange()
        break;
        
      case 'KEYCOMP_RECEIVE':
        var keycomps = payload.keycomp
        keycomp._dirty = false;
        this.create(keycomp)
        this.emitChange()
        break;

      case 'MODEL_RECEIVE':
        var _this = this
        var model = payload.model
        model.keys.forEach(function (key) {
          _this.purge({key_id: key.key_id});
          (key.keycomps || []).map(util.clean).map(_this.create)
        })
        break;
    }
  }
})

export default KeycompStore;
