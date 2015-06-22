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
        var views = _.isArray(payload.view)  ? payload.view : [payload.view]
        views.forEach(function (view) {
          if (!view) return;
          view._dirty = false
          _this.create(view)
        })
        this.emitChange()
        break;
    }
  }
})

export default ViewStore;