import update from 'react/lib/update'
import _ from "underscore"
import util from "../../../util/util"

// TODO factor out the cid promise code so this isn't so messy
import cidLookup from "../../../actions/cidLookup"

/*
 * takes a record, a patch (diff) object and a flag indicating if the change is 
 * clean (originates from server) or dirty (local, optimistic change)
 * compositRecordUpates combines the records while maintaining history of 
 * uncommitted changes in _server and _pendingActions attributes
 */

const compositeRecordUpdates = function (record, patch, isDirty) {
	let {_server: server, _pendingActions: pendingActions} = record
	server = server || {}
	pendingActions = pendingActions || []
	
	if (isDirty) {
		// if this is a client-side action then
		// append the action to the list of pending actions
		pendingActions = _.clone(pendingActions)
		pendingActions.push(patch);
	}
	else {
		// if it is a server-side update, see if it is really newer than ours
		if (patch.action_id > ((server || {}).action_id || 0)) 
			server = util.stripInternalVars(patch)
		// and take it out of the pending queue 
		pendingActions = pendingActions.filter(a => a._actionCid !== patch._actionCid);
	}

	// current record is a composite of the server rec and all pending patches
	return Object.assign.apply(undefined, [
		{
			cid: record.cid,
			_dirty: isDirty,
			_outoforder: record._outoforder,
			_server: server,
			_pendingActions: pendingActions
		},
		server
	].concat(pendingActions));
}

const processUpdates = function (_state, matcher, isDirty, actionCid) {
	var newRecords = []

	_state.records.forEach(function (rec, idx) {
		var patch = matcher(rec);

		// if the record is not impacted by the change, return
		if (!patch) return newRecords.push(rec);

		patch._actionCid = actionCid
		
		// if the action includes a deletion flag don't include it in the new record list
		if (patch.action !== 'D') newRecords.push(compositeRecordUpdates(rec, patch, isDirty));
		else if (isDirty) {
			_state.recordCount--;
		} else {
			
		}
	});

	_state.records = newRecords;
	return _state;
}

export default processUpdates