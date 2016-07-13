import _ from "underscore"
import util from "../../../../util/util"

var processUpdates = function (_state, matcher, isDirty, actionCid) {
  var newRecords = []

  _state.records.forEach(function (rec, idx) {
    var newrec = {}
    var server = rec._server || {}
    var pendingActions = rec._pendingActions || []
    var patch = matcher(rec);

    // if the record is not impacted by the change, return
    if (!patch) return newRecords.push(rec);
    else if (isDirty) {
      // if this is a client-side action then
      // append the action to the list of pending actions
      pendingActions.push(_.extend({}, patch, {_actionCid: actionCid}));
    }
    else {
      // if it is a server-side update, see if it is really newer than ours
      if (patch.action_id > (server.action_id || 0)) server = _.clone(patch)
      // and take it out of the pending queue 
      pendingActions.filter(a => util.cidNum(a._actionCid) > util.cidNum(actionCid));
    }

    // our record is the composite of the server record and all pending actions
    newrec = _.extend.apply(undefined, [
      server,
      {
        _dirty: isDirty,
        _outoforder: rec._outoforder,
        _server: util.stripInternalVars(server),
        _pendingActions: pendingActions
      }
    ].concat(pendingActions));
    
    // if the action includes a deletion flag don't include it in the new record list
    if (newrec.action !== 'D') newRecords.push(newrec);
    else if (newrec.action === 'D' && isDirty) {
      _state.recordCount--;
    } else if (newrec.action === 'D' && !isDirty) {
      
    }
  });
  _state.records = newRecords;
  return _state;
}

export default processUpdates