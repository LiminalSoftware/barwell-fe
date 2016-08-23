import _ from "underscore"
import update from 'react/lib/update'
import ModelStore from "../../../stores/ModelStore"
import util from "../../../util/util"

const isInRange = function (_state, rec) {
	var gtLowerBound = util.compare(_state.sortSpec, rec, _state.lowerBound)
	var ltUpperBound = util.compare(_state.sortSpec, rec, _state.upperBound)
	return gtLowerBound > 0 && ltUpperBound < 0
}

export default function (_state, data) {
	const {records, sortSpec} = _state
	const model = ModelStore.get(_state.model_id)
	const pk = model._pk
	let newRecs = []
	let numBefore = 0
	let numAfter = 0

	data.sort(util.compare.bind(_state.sortSpec)).forEach((rec) => {

		// adjust for the records previous position
		if (rec._previous && util.compare(_state.sortSpec, _state.lowerBound, rec._previous) <= 0) numBefore--
		else if (rec._previous && util.compare(_state.sortSpec, _state.lowerBound, rec._previous) <= 0) numBefore--

		// adjust for the new position
		if (util.compare(_state.sortSpec, _state.lowerBound, rec) <= 0) numBefore++
		else if (util.compare(_state.sortSpec, _state.upperBound, rec) >= 0) numAfter++
		else newRecs.push(rec)
	})

	const recIndex = _.indexBy(recs, pk)

	let oldIndices = {}
	let updates = []
	
	// TODO: binary search maybe... or maybe I shouldnt care
	let consolidatedRecs = util.merge(sortSpec, null, recs, )

	if (newIndex === null) newIndex = records.length

	// if there is an old index update
	return update(_state, {records: {$splice: [
		[newIndex, 0, rec]
	].concat(
		oldIndex === null ? [] : [oldIndex, 1]
	)}})
}