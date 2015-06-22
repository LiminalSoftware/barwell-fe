import storeFactory from 'flux-store-factory';
import dispatcher from '../dispatcher/MetasheetDispatcher'
import _ from 'underscore'

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
        var _this = this
        if (!payload.keycomp) return;
        var keycomps = _.isArray(payload.keycomp)  ? payload.keycomp : [payload.keycomp]
        keycomps.forEach(function (keycomp) {
          keycomp._dirty = false;
          _this.create(keycomp)
        })
        this.emitChange()
        break;
    }
  }
})

export default KeycompStore;
