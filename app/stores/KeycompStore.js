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
        this.create(payload.data);
        this.emitChange();
        break;

      case 'KEYCOMP_DESTROY':
        this.destroy(payload.data);
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
        var keycomp = payload.data;
        if (!keycomp) return;
        keycomp._dirty = false;
        this.create(keycomp);
        this.emitChange();
        break;

      case 'MODEL_CREATE':
        dispatcher.waitFor([
          KeyStore.dispatchToken, 
          AttributeStore.dispatchToken, 
          ModelStore.dispatchToken
        ]);
        var _this = this;
        var models = payload.data instanceof Array ? payload.data : [payload.data];
        models.forEach(function (model) {
          (model.keys || []).forEach(function (key) {
            (key.keycomps || [])
              .map(payload.isClean ? util.clean : _.identity)
              .map(_this.create)
          })
        });
        this.emitChange();
        break;
    }
  }
})

global.KeycompStore = KeycompStore;

export default KeycompStore;
