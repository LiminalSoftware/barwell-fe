import _ from "underscore"
import update from 'react/lib/update'
import ModelStore from "../../../stores/ModelStore"
import util from "../../../util/util"

const isInRange = function (_state, rec) {
	var gtLowerBound = (_state.lowerBound === null) || util.compare(_state.sortSpec, rec, _state.lowerBound) >= 0
	var ltUpperBound = (_state.upperBound === null) || util.compare(_state.sortSpec, rec, _state.upperBound) <= 0 
	return gtLowerBound && ltUpperBound 
}


const findInsertionIndex = function (_state, rec) {
	var i = 0;
	// TODO binary search maybe...
	while (i < _state.records.length && util.compare(_state.sortSpec, rec, _state.records[i]) >= 0) i++
	return i
}

export default function (_state, data) {
	const {sortSpec} = _state
	
	const insertions = data
		.filter(isInRange.bind(this, _state))
		.map(rec => [findInsertionIndex(_state, rec), 0, rec])

	return update(_state, {
		records: {$splice: insertions},
		recordCount: {$apply: count=>count+1}
	})
}