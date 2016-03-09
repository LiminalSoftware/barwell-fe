import React from "react"
import _ from "underscore"
import modelActionCreators from "../../../actions/modelActionCreators"

var configCommitMixin = {
	blurInput: function () {
		this.commitChanges(this.state)
	},

	commitChanges: function (colProps) {
		var view = this.props.view
		var column_id = this.props.config.column_id
		var col = view.data.columns[column_id]

		col = _.extend(col, colProps)
		view.data.columns[column_id] = col;
		this.setState(colProps)
		modelActionCreators.createView(view, true, true)
	},	
}

export default configCommitMixin