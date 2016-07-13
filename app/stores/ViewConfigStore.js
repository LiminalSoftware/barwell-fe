import storeFactory from 'flux-store-factory';
import dispatcher from '../dispatcher/MetasheetDispatcher'
import _ from 'underscore'
import util from '../util/util'
import ViewStore from './ViewStore'

var ViewConfigStore = storeFactory({
  identifier: 'view_id',
  dispatcher: dispatcher,
  pivot: function(payload) {
    var config
    switch (payload.actionType) {
      case 'CONFIG_SELECTRECORD':
      case 'CONFIG_UPDATEPOINTER':
      case 'CONFIG_SCROLL':
        config = this.get(payload.data.view_id) || {};
    }

    switch (payload.actionType) {

      case 'RECORD_MULTIUPDATE':
      case 'RECORD_MULTIDELETE':
        break;

      case 'VIEWCONFIG_CREATE':
        var config = this.get(payload.data.view_id) || {};
        Object.assign(config, payload.data);
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
