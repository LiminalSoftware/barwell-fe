import React from "react"
import _ from "underscore"

import constant from "../../../constants/MetasheetConstants"

import modelActionCreators from "../../../actions/modelActionCreators"

var commitMixin = {

	commitValue: function (value, extras) {
		var config = this.props.config;
		var column_id = config.column_id;
		var model = this.props.model;
		var selector = this.props.selector;
		var patch = {};

		if (this.parser) value = this.parser(value)
		value = this.validator(value)
		this.setState({value: value})
		patch[column_id] = value

		if (this.props.isNull) modelActionCreators.insertRecord(model, _.extend(patch, selector, 0))
		else if (this.props.recordPatch) modelActionCreators.multiPatchRecords(model, _.extend(patch, selector), extras)
		else if (selector) modelActionCreators.patchRecords(model, patch, selector, extras)
		
		if (this.revert) this.revert();
	},

	commitChanges: function () {
		var value = this.validator(this.parser(this.props.value))
		this.setState({open: false});
		if (!this.state.editing) return;
		this.commitValue(this.state.value)
	},

	componentWillReceiveProps: function (nextProps) {
		if (!this.state.editing)
			this.setState({value: this.format ? this.format(nextProps.value) : nextProps.value})
	},

	getInitialState: function () {
		return {
			value: this.format ? this.format(this.props.value) : this.props.value
		}
	},

	
}

export default commitMixin
