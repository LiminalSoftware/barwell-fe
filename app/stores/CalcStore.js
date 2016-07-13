import storeFactory from 'flux-store-factory';
import dispatcher from '../dispatcher/MetasheetDispatcher'
import _ from 'underscore'
import util from '../util/util'

var CalcStore = storeFactory({
  identifier: 'calc_id',
  dispatcher: dispatcher,
  pivot: function(payload) {

    switch (payload.actionType) {
      case 'CALC_CREATE':
        this.create(payload.calc)
        this.emitChange()
        break;

      case 'CALC_DESTROY':
        this.destroy(payload.calc)
        this.emitChange()
        break;
        
      case 'CALC_RECEIVE':
        var calc = payload.calc
        calc._dirty = false;
        this.create(calc)
        this.emitChange()
        break;

      case 'MODEL_RECEIVE':
        var model = payload.data
        this.purge({model_id: model.model_id});
        (model.calcs || []).map(util.clean).map(this.create)
        this.emitChange()
        break;
    }
  }
})

export default CalcStore;
