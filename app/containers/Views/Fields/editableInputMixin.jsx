import React from "react"
import _ from "underscore"
import $ from "jquery"

import AttributeStore from "../../../stores/AttributeStore"
import ModelStore from "../../../stores/ModelStore"

import constant from "../../../constants/MetasheetConstants"
import modelActionCreators from "../../../actions/modelActionCreators"



var editableInputMixin = {

	setValue: function (value) {
		value = value || ''
		value = (this.parser) ? this.parser(value) : value;
		this.setState({value: value})
	},

	getInitialState: function () {
		return {
			editing: false
		}
	},

	componentWillUnmount: function () {
		$(document.body).off('keydown', this.onKey)
	},

	handleKeyPress: function (event) {
		if (event.keyCode === constant.keycodes.ESC) this.cancelChanges()
		if (event.keyCode === constant.keycodes.ENTER) this.commitChanges()
		if (event.keyCode === constant.keycodes.TAB) this.commitChanges()
	},

	cancelChanges: function () {
		this.revert()
	},

	revert: function () {
		document.removeEventListener('keyup', this.handleKeyPress)
		this.setState({
			editing: false,
			value: this.props.value
		})
		this.props.handleBlur()
	},

	handleEdit: function (event) {
		var prettyValue = this.format ? this.format(this.props.value) : this.props.value
		var ordinal = event.keyCode
		document.addEventListener('keyup', this.handleKeyPress)
		this.setState({editing: true})

		if (ordinal >= 48 && ordinal <= 90)
			this.setValue('')
		else this.setValue(prettyValue)
	},

	handleChange: function (event) {
		this.setValue(event.target.value)
	},

	render: function () {
		var prettyValue = this.format ? this.format(this.props.value) : this.props.value
		var style = this.props.style
		var className = this.props.className

		return <td style={style} className={className}>
			{this.state.editing ?
			<input
				className = "input-editor"
				value = {this.state.value}
				autoFocus
				onBlur = {this.revert}
				onChange = {this.handleChange} />
			:
			(this.format ?
				this.format(this.props.value) :
				this.props.value
			)}
		</td>
	}
}

export default editableInputMixin;
