import storeFactory from 'flux-store-factory';
import dispatcher from '../dispatcher/MetasheetDispatcher'
import _ from 'underscore'
import util from '../util/util'

var ViewConfigStore = storeFactory({
  identifier: 'view_id',
  dispatcher: dispatcher,
  pivot: function(payload) {
    switch (payload.actionType) {
      case 'VIEW_CREATE':
        this.create({view_id: payload.view.view_id});
        this.emitChange();
        break;

      case 'VIEWCONFIG_CREATE':
        var config = this.get(payload.viewconfig.view_id) || {};
        Object.assign(config, payload.viewconfig);
        this.create(config);
        this.emitChange();
        break;

      case 'VIEW_DESTROY':
        this.destroy(payload.view);
        this.emitChange();
        break;
    }
  }
})

export default ViewConfigStore;
