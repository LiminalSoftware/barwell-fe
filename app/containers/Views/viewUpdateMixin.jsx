import bw from "barwell"
import ViewStore from "../../stores/ViewStore"

var ViewUpdateMixin = {
	componentWillMount: function () {
		ViewStore.addChangeListener(this._onChange);
	},

	componentDidMount: function () {
		var view = this.props.view
		ViewStore.addChangeListener(this._onChange);
	},

	componentWillUnmount: function () {
		var view = this.props.view
		ViewStore.removeChangeListener(this._onChange);
	},

	_onChange: function () {
		var viewData = ViewStore.get(this.props.view_id)
		this.setState(viewData)
	},
}

export default ViewUpdateMixin