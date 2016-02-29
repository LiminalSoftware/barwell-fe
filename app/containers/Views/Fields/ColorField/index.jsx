import React from "react"
import _ from "underscore"


import styles from "./style.less";

import constant from "../../../../constants/MetasheetConstants"
import modelActionCreators from "../../../../actions/modelActionCreators"

import ColorDetail from "./detail"

import CommitMixin from '../commitMixin'
import editableInputMixin from '../editableInputMixin'
import selectableMixin from '../selectableMixin'
import ColorValidationMixin from './ColorValidationMixin'

import ColorPicker from './ColorPicker'

import defaultCellStyle from '../defaultCellStyle'

var ColorElement = React.createClass({

	mixins: [CommitMixin, selectableMixin, ColorValidationMixin],

	handleEdit: _.noop,

	showPicker: function () {
		this.setState({open: true})
	},

	revert: function () {
		this.setState({
			editing: false,
			open: false
		})
		this.props._handleBlur()
	},

	render: function () {
		var config = this.props.config
		var value = this.props.value
		var cellStyle = _.clone(defaultCellStyle)
		var blockStyle = {
			right: this.props.selected ? '25px': '5px',
			background: this.state.value,
		}
		var iconStyle = {
			lineHeight: this.props.rowHeight + 'px',
			right: 0,
			width: '25px',
			zIndex: 210
		}

		cellStyle.lineHeight = this.props.rowHeight + 'px'
		if (this.props.selected) {
			cellStyle.zIndex = 130
			cellStyle.background = 'white'
		}
		
		return <span {...this.props} onMouseDown = {this.props.handleClick}>
				<span style = {cellStyle} className = "special-cell-inner ">
					<span style = {blockStyle} className = "color-block"></span>
				</span>
				{this.props.selected ?
					 <span
					 	style = {iconStyle}
						className = "editor-icon icon icon-tl-paint"
						onClick = {this.showPicker}/>
					: null}
				{this.state.open ? 
					<ColorPicker {...this.props} value = {value} _revert = {this.revert}/>
					: null}
		</span>
	}
});

var colorField = {
	element: ColorElement,
	detail: ColorDetail
}

export default colorField;
