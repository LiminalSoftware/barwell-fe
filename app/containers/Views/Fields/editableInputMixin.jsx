import React from "react"
import _ from "underscore"
import $ from "jquery"

import AttributeStore from "../../../stores/AttributeStore"
import ModelStore from "../../../stores/ModelStore"

import constant from "../../../constants/MetasheetConstants"
import modelActionCreators from "../../../actions/modelActionCreators"

import util from "../../../util/util"

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

	handleWheel: function (e) {
			this.props._handleWheel(e)
	},

	handleClick: function (e) {
		this.props._handleClick(e)
	},

	handleKeyPress: function (event) {
		if (event.keyCode === constant.keycodes.ESC) this.cancelChanges()
		if (event.keyCode === constant.keycodes.ENTER) {
			console.log('yippee')
			this.commitChanges()
		}
		if (event.keyCode === constant.keycodes.TAB) {
			console.log('yikes')
			this.commitChanges()
		}
	},

	cancelChanges: function () {
		console.log('cancel')
		this.setState({
			value: this.props.value
		})
		this.revert()
	},

	revert: function () {
		document.removeEventListener('keyup', this.handleKeyPress)
		this.setState({
			editing: false
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

	handleDetail: function (event) {
		this.props._handleDetail()
		event.preventDefault()
		event.stopPropagation()
	},

	render: function () {
		var config = this.props.config
		var prettyValue = this.format ? this.format(this.props.value) : this.props.value
		// var style = this.props.style
		var showDetail = this.detailIcon && this.state.selected && !this.state.editing
		var className = (this.props.className || '')
			+ (this.state.selected ? ' selected ' : '');
		var obj = this.props.object
		var cellClass = ''
		var cellStyle = (config.color) ? {background: util.lighten(config.color, 0.85)} :
			(config.colorAttr) ? {background: util.lighten(obj['a' + config.colorAttr], 0.85)} : {}

		if (config.bold) cellClass += ' bolded'
		else if (config.boldAttr) cellClass += ( obj['a' + config.boldAttr] ? ' bolded' : '')


		return <span {...this.props}
			onWheel = {this.handleWheel}
			onMouseDown = {this._handleClick}
			className = {className}>
			{this.state.editing ?
			<input
				className = "input-editor"
				value = {this.state.value}
				autoFocus
				onBlur = {this.revert}
				onChange = {this.handleChange} />
			:
			<span style = {cellStyle}
				className = {"table-cell-inner " + (showDetail? " with-detail " : "")
				+ (this.state.selected ? " selected" : "") + cellClass}>
					{this.format ?
						this.format(this.state.value) :
						this.state.value
					}
			</span>
		}
		{showDetail ?
			<span
				style = {{lineHeight: this.props.rowHeight + 'px'}}
				className = {"editor-icon icon " + this.detailIcon}
				onClick = {this.handleDetail}
				></span>
			: null
		}
		</span>
	}
}

export default editableInputMixin;
