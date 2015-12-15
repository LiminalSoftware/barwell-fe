import React from "react"
import _ from "underscore"

import modelActionCreators from "../../../actions/modelActionCreators"

var commitMixin = {

	commitValue: function (value) {
		var config = this.props.config
		var column_id = config.column_id
		var model = this.props.model
		var selector = this.props.selector
		var patch = {}

		this.setState({value: value})
		patch[column_id] = this.validator(value)

		if (this.revert) this.revert();
		if (selector) modelActionCreators.patchRecords(model, patch, selector)
	},

	commitChanges: function () {
		this.commitValue(this.state.value)
	},

	getInitialState: function () {
		return {
			value: this.validator(this.props.value)
		}
	},
}

export default commitMixin
