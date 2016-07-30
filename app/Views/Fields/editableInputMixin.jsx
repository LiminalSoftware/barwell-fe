import React from "react"
import _ from "underscore"

import constant from "../../constants/MetasheetConstants"
import modelActionCreators from "../../actions/modelActionCreators"

import util from "../../util/util"
import tinycolor from "tinycolor2"

import fieldTypes from '../fields'

import fieldUtils from "./fieldUtils"


var editableInputMixin = {

	shouldComponentUpdate: function (nextProps, nextState) {
		return nextProps !== this.props || nextState !== this.state
	},

	setValue: function (value) {
		value = value || ''
		this.setState({value: value})
	},

	getInitialState: function () {
		return {editing: false}
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

	handleKeyPress: function (e) {
		if (e.keyCode === constant.keycodes.ESC) {
			this.cancelChanges()
		}
		else if (e.keyCode === constant.keycodes.ENTER || 
			e.keyCode === constant.keycodes.TAB) {
			this.commitChanges();
		}
	},

	getDisplayHTML: function (config, obj, isNull) {
		var value = _.escape(obj[config.column_id]);
		var textConditional = (!config.textConditionAttr || obj['a' + config.textConditionAttr]);
		var prettyValue = isNull ? '' : this.format ? this.format(value, config) : value;
		var classes = 'table-cell-inner ' + 
			(textConditional ? (config.style === 'bold') ? ' bolded ' : '' : '') + 
			(textConditional ? (config.style === 'italic') ? ' italics ' : '' : '');
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
		var styleClass = 'table-cell-inner ' + 
			(textConditional ? (config.style === 'bold') ? ' bolded ' : '' : '') + 
			(textConditional ? (config.style === 'italic') ? ' italics ' : '' : '') +
			(this.props.selected ? 
				(isNull ? "table-cell-selected-null" : "table-cell-selected") : 
				(isNull ? "table-cell-null" : "") );
		
		if (showIcon) {
			editorIconStyle = {
				position: 'absolute',
				background: 'white',
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

		return <span {...this.props} className = {styleClass}>
			{this.props.alwaysEdit || this.state.editing ?
			<input
				ref = "input"
				className = "input-editor"
				value = {this.state.value}
				style = {{textAlign: config.align}}
				autoFocus = {!this.props.noAutoFocus}
				onClick = {e => e.stopPropagation() && e.nativeEvent.stopPropagation()}
				onBlur = {this.revert}
				onChange = {this.handleChange} />
			:
			<span style = {cellStyle} className = {" table-cell-inner " +  styleClass +
				((this.props.selected && !isNull) ? " table-cell-inner-selected " : "") +
				(this.props.sorted ? " table-cell-inner-sorted " : "")
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
