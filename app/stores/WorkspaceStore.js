import storeFactory from 'flux-store-factory';
import dispatcher from '../dispatcher/MetasheetDispatcher'
import _ from 'underscore'


var _activeWorkspace = null;

var WorkspaceStore = storeFactory({
  identifier: 'workspace_id',
  dispatcher: dispatcher,
  pivot: function(payload) {
    switch (payload.actionType) {
      case 'WORKSPACE_CREATE':
        this.create(payload.workspace)
        this.emitChange()
        break;

      case 'WORKSPACE_DESTROY':
        this.destroy(payload.workspace)
        this.emitChange()
        break;

      case 'WORKSPACE_RECEIVE':
				console.log('payload: ' + JSON.stringify(payload))
        var workspace = payload.workspace
        this.create(workspace)
        this.emitChange()
        break;
    }
  }
})

export default WorkspaceStore;
