import update from 'react/lib/update'
import modelActionCreators from "../../../actions/modelActionCreators"

export default function (view, columnId, patch, safe) {
	const updated = update(view, {
		data : {	
			columns: {
				[columnId]: {
					$merge: patch
				}
			}
		}
	})
	modelActionCreators.createView(updated, true)
}