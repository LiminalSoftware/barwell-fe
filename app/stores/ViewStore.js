import storeFactory from 'flux-store-factory';
import dispatcher from '../dispatcher/MetasheetDispatcher'
import _ from 'underscore'

var ViewStore = storeFactory({
  identifier: 'view_id',
  dispatcher: dispatcher,
  pivot: function(payload) {

    switch (payload.actionType) {
      case 'VIEW_CREATE':
        this.create(payload.view)
        this.emitChange()
        break;

      case 'VIEW_DESTROY':
        this.destroy(payload.view)
        this.emitChange()
        break;

      case 'VIEW_RECEIVE':
        var _this = this
        var view = payload.view
        if (!view) return;
        view._dirty = false
        this.create(view)
        this.emitChange()
        break;

      case 'MODEL_RECEIVE':
        var model = payload.model
        this.purge({model_id: model.model_id});
        (model.views || []).map(this.create)
        break;
    }
  }
})

export default ViewStore;