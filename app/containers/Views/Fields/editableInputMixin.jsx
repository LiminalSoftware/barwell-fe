import React from "react"
import _ from "underscore"
import $ from "jquery"

import AttributeStore from "../../../stores/AttributeStore"
import ModelStore from "../../../stores/ModelStore"

import constant from "../../../constants/MetasheetConstants"
import modelActionCreators from "../../../actions/modelActionCreators"

import util from "../../../util/util"
import tinycolor from "tinycolor2"

import defaultCellStyle from './defaultCellStyle'

var MIN_LIGHTNESS = 0.85
var SELECTED_LIGHTNESS = 0.97

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
		this.props._handleBlur()
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
		var showDetail = this.detailIcon && this.state.selected && !this.state.editing
		var obj = this.props.object
		var bg = null
		var fontColor = null
		var cellStyle = _.clone(defaultCellStyle)
		var editorIconStyle = {
			position: 'absolute',
			top: 0,
			bottom: 0,
			width: '25px',
			lineHeight: config.rowHeight + 'px'
		}
		if (config.align === 'right') editorIconStyle.left = 0
		else editorIconStyle.right = 0

		cellStyle.textAlign = (config.align.center ? 'center' : config.align.right ? 'right' : 'left')
		cellStyle.zIndex = (this.state.selected ? 1130 : null)
		// cellStyle.transform = this.state.selected ? 'translateZ(1px)' : null;
		cellStyle.transformStyle = 'flat'
		cellStyle.lineHeight = config.rowHeight + 'px'

		if (this.state.selected) bg = "white"
		else if (config.color) bg = config.color
		else if (config.colorAttr) bg = obj['a' + config.colorAttr]

		if (bg) {
			var c = tinycolor(bg)
			var hsl = c.toHsl()
			if (config.adjustColor) hsl.l = 
				Math.max(hsl.l, (this.state.selected ? SELECTED_LIGHTNESS : MIN_LIGHTNESS))
			else if (c.isDark()) cellStyle.color = 'white'
			cellStyle.background = tinycolor(hsl).toRgbString()
		}

		return <span {...this.props}
			onWheel = {this._handleWheel}
			onPaste = {this._handlePaste}
			onMouseDown = {this._handleClick}>
			{this.state.editing ?
			<input
				className = "input-editor"
				value = {this.state.value}
				autoFocus
				onBlur = {this.revert}
				onChange = {this.handleChange} />
			:
			<span style = {cellStyle} className = {this.state.selected ? " force-layer " : ""}>
				{this.format ?
					this.format(this.state.value) :
					this.state.value
				}
			</span>
		}
		{showDetail ?
			<span
				style = {editorIconStyle}
				className = {"editor-icon icon " + this.detailIcon}
				onClick = {this.handleDetail}
				></span>
			: null
		}
		</span>
	}
}

export default editableInputMixin;
