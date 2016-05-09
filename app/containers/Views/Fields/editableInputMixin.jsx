import React from "react"
import _ from "underscore"
import $ from "jquery"

import AttributeStore from "../../../stores/AttributeStore"
import ModelStore from "../../../stores/ModelStore"

import constant from "../../../constants/MetasheetConstants"
import modelActionCreators from "../../../actions/modelActionCreators"

import util from "../../../util/util"
import tinycolor from "tinycolor2"

import bgColorMixin from './bgColorMixin'

import fieldTypes from '../fields'


var editableInputMixin = {

	shouldComponentUpdate: function (nextProps, nextState) {
		return nextProps.value !== this.props.value ||
			nextState.value !== this.state.value ||
			nextState.searchValue !== this.state.searchValue ||
			nextProps.config !== this.props.config ||
			nextState.selected !== this.state.selected ||
			nextState.open !== this.state.open ||
			nextState.editing !== this.state.editing;
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
			value: this.props.value,
			open: false
		})
		this.revert()
	},

	revert: function () {
		this.setState({
			editing: false,
			open: false
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

	handleDetail: function (e) {
		console.log('handleDetail')
		this.setState({open: true})
		event.preventDefault();
		event.stopPropagation();
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

	getDisplayHTML: function (config, obj, isNull) {
		var value = obj[config.column_id];
		var textConditional = (!config.textConditionAttr || obj['a' + config.textConditionAttr]);
		var prettyValue = isNull ? '' : this.format ? this.format(value, config) : value;
		var classes = 'table-cell-inner ' + (textConditional ? config.bold ? ' bolded ' : '' : '');
		var bg = this.getBgColor ? this.getBgColor(config, obj) : {};

		return `<span class = "${classes}" style = "text-align: ${config.align}; background: ${bg.background || 'transparent'}; color: ${bg.color}">${prettyValue}</span>`;
	},

	render: function () {
		var config = this.props.config
		var isNull = this.props.isNull
		var prettyValue = isNull ? '' : this.format ? this.format(this.props.value) : this.props.value
		var showIcon = this.detailIcon && this.props.selected && !this.state.editing
		var obj = this.props.object
		var bg = null;
		var fontColor = null;
		var cellStyle = {};
		var editorIconStyle;
		var fieldType = fieldTypes[config.type]
		var detail = fieldType.detail;
		var showDetail = this.state.open;
		var textConditional = (!config.textConditionAttr || obj['a' + config.textConditionAttr]);
		var boldClass = textConditional ? config.bold ? ' bolded ' : '' : '';
		
		if (showIcon) {
			editorIconStyle = {
				position: 'absolute',
				top: 0, 
				bottom: 0,
				width: '25px',
				lineHeight: this.props.rowHeight + 'px',
				zIndex: 251
			}
			if (config.align === 'right') editorIconStyle.left = '3px';
			else editorIconStyle.right = '3px';
		}

		cellStyle.textAlign = config.align
		if (this.props.selected && this.detailIcon && config.align !== 'right')
			cellStyle.paddingRight = '25px'
		if (this.props.selected && this.detailIcon && config.align === 'right')
			cellStyle.paddingLeft = '25px'
		cellStyle.lineHeight = this.props.rowHeight + 'px'
		
		Object.assign(cellStyle, this.getBgColor(config, obj, false, this.props.selected));

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
			<span style = {cellStyle} className = {"table-cell-inner " +  boldClass +
				((this.props.selected && !isNull) ? " table-cell-inner-selected" : "") +
				(this.props.sorted ? "table-cell-inner-sorted" : "")
				}>
				{prettyValue}
			</span>
		}
		{showIcon ?
			<span
				style = {editorIconStyle}
				className = {"editor-icon icon " + this.detailIcon}
				onClick = {this.handleDetail}/>
			: null
		}
		{this.state.open ?
			React.createElement(detail, Object.assign({value: this.state.value, _revert: this.revert}, this.props) )
			: null
		}
		</span>
	}
}

// Object.assign(editableInputMixin, bgColorMixin)

export default editableInputMixin;
