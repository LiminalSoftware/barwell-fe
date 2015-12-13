import React from "react"
import _ from "underscore"

import modelActionCreators from "../../../actions/modelActionCreators"

var commitMixin = {

	commitValue: function (value) {
		console.log('value: ' + value)
		console.log('this.validator(value): ' + this.validator(value))
		var config = this.props.config
		var column_id = this.props.column_id
		var model = this.props.model
		var selector = this.props.selector
		var patch = {}

		this.setState({value: value})
		patch[column_id] = this.validator(value)

		modelActionCreators.patchRecords(model, patch, selector)
		if (this.revert) this.revert();
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
