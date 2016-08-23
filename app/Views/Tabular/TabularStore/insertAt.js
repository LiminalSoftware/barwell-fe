import update from 'react/lib/update'

export default function (_state, rec, at) {
	const {records, sortSpec} = _state
	
	rec._outoforder = true

	return update(_state, {records: 
		{$splice: [[at, 0, rec]]}
	})
}