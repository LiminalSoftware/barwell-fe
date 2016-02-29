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

var editableInputMixin = {

	shouldComponentUpdate: function (nextProps, nextState) {
		return nextProps.value !== this.props.value ||
			nextState.value !== this.state.value ||
			nextState.searchValue !== this.state.searchValue ||
			nextProps.config !== this.props.config ||
			nextState.selected !== this.state.selected ||
			nextState.editing !== this.state.editing
	},

	setValue: function (value) {
		value = value || ''
		value = (this.parser) ? this.parser(value) : value;
		this.setState({value: value})
	},

	getInitialState: function () {
		return {editing: false}
	},

	componentWillUnmount: function () {
		$(document.body).off('keydown', this.onKey)
	},

	cancelChanges: function () {
		this.setState({
			value: this.props.value
		})
		this.revert()
	},

	revert: function () {
		this.setState({
			editing: false
		})
		this.props._handleBlur()
	},

	handleEdit: function (event) {
		var prettyValue = this.format ? this.format(this.props.value) : this.props.value
		var ordinal = event.keyCode
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

	handleKeyPress: function (e) {
		if (e.keyCode === constant.keycodes.ESC) this.cancelChanges()
		if (e.keyCode === constant.keycodes.ENTER) {
			this.commitChanges()
		}
		if (e.keyCode === constant.keycodes.TAB) {
			this.commitChanges()
		}
	},

	render: function () {
		var config = this.props.config
		var prettyValue = this.format ? this.format(this.props.value) : this.props.value
		var showDetail = this.detailIcon && this.props.selected && !this.state.editing
		var obj = this.props.object
		var bg = null
		var fontColor = null
		var cellStyle = _.clone(defaultCellStyle)
		var editorIconStyle
		var conditional = (!config.conditionAttr || obj['a' + config.conditionAttr])

		if (showDetail) {
			editorIconStyle = {
				position: 'absolute',
				top: 0, 
				bottom: 0,
				width: '25px',
				lineHeight: this.props.rowHeight + 'px',
				zIndex: 251
			}
			if (config.align === 'right') editorIconStyle.left = 0
			else editorIconStyle.right = 0
		} 

		cellStyle.textAlign = config.align
		if (this.props.selected && config.align !== 'right') cellStyle.paddingRight = '22px'
		if (this.props.selected && config.align === 'right') cellStyle.paddingLeft = '22px'
		cellStyle.lineHeight = this.props.rowHeight + 'px'
		
		if (this.props.selected) bg = "white"
		else if (config.color && conditional) bg = config.color
		else if (config.colorAttr && conditional) bg = obj['a' + config.colorAttr]

		if (bg) {
			var c = tinycolor(bg)
			var hsl = c.toHsl()
			if (config.adjustColor) hsl.l = 
				Math.max(hsl.l, MIN_LIGHTNESS)
			else if (c.isDark()) cellStyle.color = 'white'
			cellStyle.background = tinycolor(hsl).toRgbString()
		}

		return <span {...this.props} className = {"table-cell " + (this.state.selected ? " table-cell-selected" : "")}>
			{this.state.editing ?
			<input
				className = "input-editor"
				value = {this.state.value}
				autoFocus
				onClick = {e => e.stopPropagation() && e.nativeEvent.stopPropagation()}
				onBlur = {this.revert}
				onChange = {this.handleChange} />
			:
			<span style = {cellStyle} className = {"table-cell-inner " + 
				(this.state.selected ? " table-cell-inner-selected" : "") +
				(this.props.sorted ? "table-cell-inner-sorted" : "")
				}
				onContextMenu = {this._handleContextMenu}
				onPaste = {this.props._handlePaste}>
				{prettyValue}
			</span>
		}
		{showDetail ?
			<span
				style = {editorIconStyle}
				className = {"editor-icon icon " + this.detailIcon}
				onClick = {this.props._handleDetail}/>
			: null
		}
		</span>
	}
}

export default editableInputMixin;
