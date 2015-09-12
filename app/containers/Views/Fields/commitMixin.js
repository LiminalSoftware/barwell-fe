import React from "react"
import _ from "underscore"
import $ from "jquery"

import AttributeStore from "../../../stores/AttributeStore"
import ModelStore from "../../../stores/ModelStore"

import constant from "../../../constants/MetasheetConstants"
import modelActionCreators from "../../../actions/modelActionCreators"

var commitMixin = {

	commitChanges: function () {
		var config = this.props.config
		var column_id = this.props.column_id
		var model = this.props.model
		var selector = this.props.selector
		var patch = {}

		patch[column_id] = this.validator(this.state.value)
		modelActionCreators.patchRecords(model, patch, selector)
		if (this.revert) this.revert();
	},

	getInitialState: function () {
		return {
			value: this.validator(this.props.value)
		}
	},
}

export default commitMixin
