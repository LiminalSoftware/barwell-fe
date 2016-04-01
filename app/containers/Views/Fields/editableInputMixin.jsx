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
import bgColorMixin from './bgColorMixin'

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
		this.setState({value: value})
	},

	getInitialState: function () {
		return {editing: false}
	},

	componentWillUnmount: function () {
		$(document.body).off('keydown', this.onKey)
	},

	componentDidUpdate: function (prevProps, prevState) {
		if (prevState.editing === false && this.state.editing === true) {
			var val = this.refs.input.value
			this.refs.input.value = ''
			this.refs.input.value = val
		}
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
			this.commitChanges();
		}
		if (e.keyCode === constant.keycodes.TAB) {
			this.commitChanges();
		}
	},

	render: function () {
		var config = this.props.config
		var isNull = this.props.isNull
		var prettyValue = isNull ? '' : this.format ? this.format(this.props.value) : this.props.value
		var showDetail = this.detailIcon && this.props.selected && !this.state.editing
		var obj = this.props.object
		var bg = null;
		var fontColor = null;
		var cellStyle = {};
		var editorIconStyle;
		
		
		if (showDetail) {
			editorIconStyle = {
				position: 'absolute',
				top: 0, 
				bottom: 0,
				width: '25px',
				lineHeight: this.props.rowHeight + 'px',
				zIndex: 251
			}
			if (config.align === 'right') editorIconStyle.left = 0;
			else editorIconStyle.right = 0;
		}

		cellStyle.textAlign = config.align
		if (this.props.selected && this.detailIcon && config.align !== 'right')
			cellStyle.paddingRight = '25px'
		if (this.props.selected && this.detailIcon && config.align === 'right')
			cellStyle.paddingLeft = '25px'
		cellStyle.lineHeight = this.props.rowHeight + 'px'
		
		Object.assign(cellStyle, this.getBgColor());

		return <span {...this.props} className = {"table-cell " + (this.props.selected ? 
				(isNull ? "table-cell-selected-null" : "table-cell-selected") : 
				(isNull ? "table-cell-null" : "") )}>
			{this.state.editing ?
			<input
				ref = "input"
				className = "input-editor"
				value = {this.state.value}
				style = {{textAlign: config.align}}
				autoFocus
				onClick = {e => e.stopPropagation() && e.nativeEvent.stopPropagation()}
				onBlur = {this.revert}
				onChange = {this.handleChange} />
			:
			<span style = {cellStyle} className = {"table-cell-inner " + 
				((this.props.selected && !isNull) ? " table-cell-inner-selected" : "") +
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

Object.assign(editableInputMixin, bgColorMixin)

export default editableInputMixin;
