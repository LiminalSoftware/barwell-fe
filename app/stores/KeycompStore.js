import storeFactory from 'flux-store-factory';
import dispatcher from '../dispatcher/MetasheetDispatcher';
import _ from 'underscore';
import util from '../util/util';
import getGuid from './getGuid'

import ModelStore from './ModelStore'
import AttributeStore from './AttributeStore'
import KeyStore from "./KeyStore"

var KeycompStore = storeFactory({
  identifier: 'keycomp_id',
  dispatcher: dispatcher,
  pivot: function(payload) {

    switch (payload.actionType) {
      case 'KEYCOMP_CREATE':
        this.create(payload.keycomp);
        this.emitChange();
        break;

      case 'KEYCOMP_DESTROY':
        this.destroy(payload.keycomp);
        this.emitChange();
        break;

      case 'KEY_DESTROY':
        var selector = {key_id: payload.key.key_id};
        this.purge(selector);
        this.emitChange();
        break;

      case 'KEY_RECEIVE':
        var _this = this;
        var key = payload.key;
        this.purge({key_id: key.cid || key.key_id});
        (key.keycomps || []).map(util.clean).map(_this.create);
        break;
        
      case 'KEYCOMP_RECEIVE':
        var keycomp = payload.keycomp;
        if (!keycomp) return;
        keycomp._dirty = false;
        this.create(keycomp);
        this.emitChange();
        break;

      case 'MODEL_RECEIVE':
        dispatcher.waitFor([
          KeyStore.dispatchToken, 
          AttributeStore.dispatchToken, 
          ModelStore.dispatchToken
        ]);
        var _this = this;
        var models = payload.model instanceof Array ? payload.model : [payload.model];
        models.forEach(function (model) {
          if(!('keys' in model)) return;
          model.keys.forEach(function (key) {
            (key.keycomps || []).map(util.clean).map(_this.create)
          })
        });
        this.emitChange();
        break;
    }
  }
})

global.KeycompStore = KeycompStore;

export default KeycompStore;
