import React from "react"
import _ from "underscore"

import modelActionCreators from "../../../actions/modelActionCreators"

var commitMixin = {

	commitValue: function (value) {
		console.log('commitValue A')
		var config = this.props.config
		var column_id = config.column_id
		var model = this.props.model
		var selector = this.props.selector
		var patch = {}

		console.log('commitValue B')
		value = this.validator(value)
		this.setState({value: value})
		patch[column_id] = value

		console.log('commitValue C')
		if (selector) modelActionCreators.patchRecords(model, patch, selector)
		if (this.revert) this.revert();

		console.log('commitValue D')
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
