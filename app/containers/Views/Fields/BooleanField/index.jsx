import React from "react"
import _ from "underscore"
import $ from "jquery"
import moment from "moment"

import styles from "./booleanStyles.less"
import AttributeStore from "../../../../stores/AttributeStore"
import ModelStore from "../../../../stores/ModelStore"

import constant from "../../../../constants/MetasheetConstants"
import modelActionCreators from "../../../../actions/modelActionCreators"

import defaultCellStyle from '../defaultCellStyle'

import commitMixin from '../commitMixin'
import editableInputMixin from '../editableInputMixin'
import selectableMixin from '../selectableMixin'

var CheckboxElement = React.createClass({

	mixins: [commitMixin, selectableMixin],

	revert: _.noop,

	handleEdit: function () {
		this.toggle()
		this.props._handleBlur()
	},

	validator: function (input) {
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
		var selectionClass = (this.state.selected ? ' selected ' : '')

		var cellStyle = _.clone(defaultCellStyle)
		
		cellStyle.lineHeight = this.props.rowHeight + 'px'
		cellStyle.textAlign = 'center'
		if (this.state.selected) {
			cellStyle.zIndex = 130
			cellStyle.background = 'white'
		}

		var boxStyle = {
			position: 'relative',
			display: 'inline-block',
			maxHeight: '14px',
			minHeight: '14px',
			maxWidth: '14px',
			minWidth: '14px',
			cursor: 'pointer',
			borderRadius: '3px',
			background: 'white',
			border: '1px solid ' + constant.colors.GRAY_3,
			zIndex: 121
		}

		var checkStyle = {
			position: 'absolute',
			left: '0px',
			top: '-3px'
		}

		return <span {...this.props} >
			<span style = {cellStyle}>
				<span style = {boxStyle}
					 onClick={this.handleClick}>
					<span className={"check green icon " + (this.state.value ? "icon-kub-approve" : "")}>
					</span>
				</span>
			</span>
		</span>
	}
});

var booleanField = {
	sortable: true,
	defaultAlign: 'center',
	element: CheckboxElement,
	uneditable: true
}

export default booleanField
