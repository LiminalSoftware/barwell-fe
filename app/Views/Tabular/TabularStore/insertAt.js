import _ from "underscore"
import update from 'react/lib/update'

export default function (_state, data, at) {
	const {records, sortSpec} = _state
	const insertions = data.map(_rec => {
		let rec = _.clone(_rec)
		rec._outoforder = true
		return [at, 0, rec]
	})
	

	return update(_state, {
		records: {$splice: insertions},
		recordCount: {$apply: count=>count+1}	
	})
}