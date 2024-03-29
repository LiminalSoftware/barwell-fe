import storeFactory from 'flux-store-factory';
import dispatcher from '../dispatcher/MetasheetDispatcher'
import _ from 'underscore'
import groomView from '../containers/Views/groomView'
import util from '../util/util'

var ViewStore = storeFactory({
  identifier: 'view_id',
  dispatcher: dispatcher,
  pivot: function(payload) {

    switch (payload.actionType) {
      case 'VIEW_CREATE':
        var view = _.clone(payload.view)
        if (!payload.safe) view = groomView(view)
        this.create(payload.view)
        this.emitChange()
        break;

      case 'VIEW_DESTROY':
        this.destroy(payload.view)
        this.emitChange()
        break;

      case 'VIEW_RECEIVE':
        var view = _.clone(payload.view)
        if (!(view instanceof Object)) return;
        view = view
        view._dirty = false
        this.create(groomView(view))
        this.emitChange()
        break;


      case 'MODEL_RECEIVE':
        var model = payload.model
        if(!('views' in model)) return;
        this.purge({model_id: model.model_id});
        (model.views || []).map(groomView).map(util.clean).map(this.create)
        this.emitChange()
        break;
    }
  }
})

export default ViewStore;
