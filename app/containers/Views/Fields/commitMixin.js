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
		var view = this.props.view
		var pk = this.props.pk
		var model = this.props.model
		var obj = this.props.object
		var patch = {}
		var selector = {}

		patch[config.column_id] = this.validator(this.state.value)
		selector[model._pk] = obj[model._pk]

		if (obj[model._pk]) modelActionCreators.patchRecords(model, patch, selector)
		else modelActionCreators.insertRecord(model, _.extend(obj, patch))
		if (this.revert) this.revert();
	},

	getInitialState: function () {
		return {
			value: this.validator(this.props.value)
		}
	},
}

export default commitMixin