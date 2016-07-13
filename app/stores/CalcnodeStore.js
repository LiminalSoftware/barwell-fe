import storeFactory from 'flux-store-factory';
import dispatcher from '../dispatcher/MetasheetDispatcher'
import _ from 'underscore'
import util from '../util/util'

var CalcnodeStore = storeFactory({
  identifier: 'calcnode_id',
  dispatcher: dispatcher,
  pivot: function(payload) {

    switch (payload.actionType) {
      case 'CALCNODE_CREATE':
        this.create(payload.calcnode)
        this.emitChange()
        break;

      case 'CALCNODE_DESTROY':
        this.destroy(payload.calcnode)
        this.emitChange()
        break;
        
      case 'CALCNODE_RECEIVE':
        var calcnode = payload.calcnode
        calcnode._dirty = false;
        this.create(calcnode)
        this.emitChange()
        break;

      case 'MODEL_RECEIVE':
        var model = payload.data
        
        (model.calcs || []).forEach(function (calc) {
          this.purge({calc_id: calc.calc_id});
          calc.calc_nodes.map(util.clean).map(this.create)
        })
        this.emitChange()
        break;
    }
  }
})

export default CalcnodeStore;
