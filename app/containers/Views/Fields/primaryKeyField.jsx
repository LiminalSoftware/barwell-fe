import React from "react"
import _ from "underscore"
import $ from "jquery"
import moment from "moment"

import AttributeStore from "../../../stores/AttributeStore"
import ModelStore from "../../../stores/ModelStore"

import constant from "../../../constants/MetasheetConstants"
import modelActionCreators from "../../../actions/modelActionCreators"

import commitMixin from './commitMixin'
import editableInputMixin from './editableInputMixin'
import selectableMixin from './selectableMixin'

import defaultCellStyle from './defaultCellStyle'

var PrimaryKeyElement = React.createClass({
	mixins: [selectableMixin],
	
	render: function () {
		var value = this.props.value
		var style = this.props.style
		var cellStyle = {lineHeight: this.props.rowHeight + 'px', paddingLeft: '5px'}
		var className = "pk-cell-inner table-cell-inner" + (this.props.selected ? " table-cell-inner-selected" : "")

		return <span {...this.props} className = "table-cell " >
			<span className = {className} style = {cellStyle}>
				{this.props.value}
			</span>
		</span>
	}
})

var PrimaryKeyField = {
	defaultWidth: 50,
	sortable: true,
	element: PrimaryKeyElement,
	uneditable: true
}

export default PrimaryKeyField
