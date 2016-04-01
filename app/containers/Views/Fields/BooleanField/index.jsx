import React from "react"
import _ from "underscore"
import $ from "jquery"
import moment from "moment"

import styles from "./booleanStyles.less"
import AttributeStore from "../../../../stores/AttributeStore"
import ModelStore from "../../../../stores/ModelStore"

import constant from "../../../../constants/MetasheetConstants"
import modelActionCreators from "../../../../actions/modelActionCreators"

import ColorChoice from "../textFieldConfig/ColorChoice"

import commitMixin from '../commitMixin'
import editableInputMixin from '../editableInputMixin'
import selectableMixin from '../selectableMixin'
import bgColorMixin from '../bgColorMixin'

var CheckboxElement = React.createClass({

	mixins: [commitMixin, selectableMixin, bgColorMixin],

	revert: _.noop,

	// shouldComponentUpdate: function (nextProps, nextState) {
	// 	return nextProps.value !== this.props.value ||
	// 		nextProps.config !== this.props.config ||
	// 		nextState.selected !== this.state.selected
	// },

	handleEdit: function () {
		this.toggle()
		this.props._handleBlur()
	},

	validator: function (input) {
		if (input === 'TRUE' || input === 'true') return true
		if (input === 'FALSE' || input === 'false') return false
		return (!!input)
	},

	parser: function (input) {
		return !!input
	},

	handleClick: function (e) {
		this.toggle()
		e.preventDefault()
		e.stopPropagation()
		e.nativeEvent.stopPropagation()
	},

	toggle: function () {
		this.commitValue(!this.state.value)
	},

	render: function () {
		var config = this.props.config
		var value = this.props.value
		var style = this.props.style
		var isNull = this.props.isNull
		var cellStyle = {};
		var checkStyle = {
			position: 'absolute',
			left: '2px',
			top: '-3px'
		}

		cellStyle.lineHeight = this.props.rowHeight + 'px'
		cellStyle.textAlign = 'center'
		Object.assign(cellStyle, this.getBgColor());

		return <span {...this.props} className = {"table-cell " + (this.props.selected ? 
				(isNull ? "table-cell-selected-null" : "table-cell-selected") : 
				(isNull ? "table-cell-null" : "") )}>
			<span style = {cellStyle} className = {"table-cell-inner " + 
				((this.props.selected && !isNull) ? " table-cell-inner-selected " : "") +
				(this.props.sorted ? " table-cell-inner-sorted" : "")
				}>
				{!isNull ?
				<span className = {"checkbox-surround " + (this.state.selected ? ' checkbox-surround-selected' : '')}
					 onClick=  {this.handleClick}>
					<span className={"check green icon " + (this.state.value ? "icon-check" : "")} >
					</span>
				</span>
				: null
				}
			</span>
		</span>
	}
});

var booleanField = {
	defaultWidth: 50,
	sortable: true,
	configParts: [ColorChoice],
	expandable: false,
	defaultAlign: 'center',
	element: CheckboxElement,
	uneditable: true
}

export default booleanField
