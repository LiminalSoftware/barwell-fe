import React from "react"
import _ from "underscore"
import $ from "jquery"
import moment from "moment"

import AttributeStore from "../../stores/AttributeStore"
import ModelStore from "../../stores/ModelStore"

import constant from "../../constants/MetasheetConstants"
import modelActionCreators from "../../actions/modelActionCreators"

import commitMixin from './commitMixin'
import editableInputMixin from './editableInputMixin'
import selectableMixin from './selectableMixin'

var PrimaryKeyElement = React.createClass({
	mixins: [selectableMixin],

	getDisplayHTML: function (config, obj, isNull) {
		var value = obj[config.column_id];
		if (!value) value = '...';
		return `<span class = "pk-cell-inner table-cell-inner">${value}</span>`;
	},
	
	render: function () {
		var value = this.props.value
		var style = this.props.style
		var cellStyle = {lineHeight: this.props.rowHeight + 'px', paddingLeft: '5px'}
		var className = "pk-cell-inner table-cell-inner" + (this.props.selected ? " table-cell-inner-selected" : "")

		if (!value) value = '...';

		return <span {...this.props} className = "table-cell " >
			<span className = {className} style = {cellStyle}>
				{value}
			</span>
		</span>
	}
})

var PrimaryKeyField = {
	defaultHidden: true,
	defaultWidth: 80,
	defaultAlign: 'center',
	icon: 'key-hole',
	description: 'Unique identifier',
	sortable: true,
	sortIcon: 'sort-numeric-',
	element: PrimaryKeyElement,
	uneditable: true,
	unchangeable: true
}

export default PrimaryKeyField
