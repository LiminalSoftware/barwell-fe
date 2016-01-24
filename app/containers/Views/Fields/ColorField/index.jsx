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

import defaultCellStyle from '../defaultCellStyle'

var ColorElement = React.createClass({

	mixins: [CommitMixin, selectableMixin, ColorValidationMixin],

	handleEdit: _.noop,

	render: function () {
		var config = this.props.config
		var value = this.props.value
		var cellStyle = _.clone(defaultCellStyle)
		var blockStyle = {
			zIndex: 150,
			display: 'block',
			position: 'absolute',
			left: '5px',
			right: this.state.selected ? '25px': '5px',
			top: '3px',
			bottom: '3px',
			border: '1px solid white',
			borderRadius: '3px',
			background: this.state.value,
		}
		var iconStyle = {
			lineHeight: this.props.rowHeight + 'px',
			right: 0,
			width: '25px',
			zIndex: 210
		}

		cellStyle.lineHeight = this.props.rowHeight + 'px'
		if (this.state.selected) {
			cellStyle.zIndex = 130
			cellStyle.background = 'white'
		}
		
		return <span {...this.props} onMouseDown = {this.props.handleClick}>
				<span style = {cellStyle}>
					<span style = {blockStyle}></span>
				</span>
				{this.state.selected ?
					 <span
					 	style = {iconStyle}
						className = "editor-icon icon icon-tl-paint"
						onClick = {this.props._handleDetail}></span>
					: null}
		</span>
	}
});

var colorField = {
	element: ColorElement,
	detail: ColorDetail
}

export default colorField;
