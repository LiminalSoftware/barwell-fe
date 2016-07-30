import React from "react"
import _ from "underscore"

import constant from "../../constants/MetasheetConstants"

import modelActionCreators from "../../actions/modelActionCreators"

var commitMixin = {

	/*
	 * takes parameter @value and commits it (appending @extras to the action)
	 */
	commitValue: function (value, extras) {
		var config = this.props.config;
		var column_id = config.column_id;
		var model = this.props.model;
		var selector = this.props.selector;
		var patch = {};

		extras = extras || {};

		extras._previous = {[column_id]: this.props.value};

		if (this.parser) value = this.parser(value)
		value = this.validator(value)
		this.setState({value: value})
		patch[column_id] = value
		
		// I don't think we want this behavior yet...
		// if (this.props.isNull) modelActionCreators.insertRecord(model, _.extend(patch, selector, 0))
		// else 
		if (this.props._recordCommit) _recordCommit(patch)
		else if (this.props.recordPatch) modelActionCreators.multiPatchRecords(model, _.extend(patch, selector), extras)
		else if (selector) modelActionCreators.patchRecords(model, patch, selector, extras)
		
		if (this.revert) this.revert();
	},


	/*
	 * takes the values from the input element and commits it
	 */
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
