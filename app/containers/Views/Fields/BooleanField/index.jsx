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

		var cellStyle = _.clone(defaultCellStyle)

		var checkStyle = {
			position: 'absolute',
			left: '0px',
			top: '-3px'
		}

		cellStyle.lineHeight = this.props.rowHeight + 'px'
		cellStyle.textAlign = 'center'
		if (this.state.selected) {
			cellStyle.zIndex = 130
			cellStyle.background = 'white'
		}

		return <span {...this.props} >
			<span style = {cellStyle} className = "table-cell-inner">
				<span className = {"checkbox-surround " + (this.state.selected ? ' checkbox-surround-selected' : '')}
					 onClick={this.handleClick}>
					<span className={"check green icon " + (this.state.value ? "icon-kub-approve" : "")}>
					</span>
				</span>
			</span>
		</span>
	}
});

var booleanField = {
	defaultWidth: 50,
	sortable: true,
	defaultAlign: 'center',
	element: CheckboxElement,
	uneditable: true
}

export default booleanField
