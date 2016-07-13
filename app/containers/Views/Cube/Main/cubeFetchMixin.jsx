import _ from "underscore"
import modelActionCreators from "../../../../actions/modelActionCreators"

const WINDOW_ROWS = 50
const WINDOW_COLS = 20

var cubeFetchMixin = {

	fetch: function () {
		var _this = this
		var view = this.props.view
		var store = this.store
		var hOffset = this.state.hOffset || 0
		var vOffset = this.state.vOffset || 0

		if (view._dirty) return;

		return Promise.all([
			modelActionCreators.fetchCubeLevels(view, 'row', vOffset, WINDOW_ROWS),
			modelActionCreators.fetchCubeLevels(view, 'column', hOffset, WINDOW_COLS),
		]).then(function () {
			return modelActionCreators.fetchCubeValues(view, store, hOffset, WINDOW_ROWS, vOffset, WINDOW_COLS)
		})
	}
}

export default cubeFetchMixin;