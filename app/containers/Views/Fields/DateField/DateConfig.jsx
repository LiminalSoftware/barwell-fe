import React from "react"
import _ from "underscore"
import $ from "jquery"
import moment from "moment"
import styles from "./style.less"
import AttributeStore from "../../../../stores/AttributeStore"
import ModelStore from "../../../../stores/ModelStore"

import constant from "../../../../constants/MetasheetConstants"
import modelActionCreators from "../../../../actions/modelActionCreators"

import commitMixin from '../commitMixin'
import editableInputMixin from '../editableInputMixin'
import selectableMixin from '../selectableMixin'
import DateValidatorMixin from './dateValidatorMixin'
import keyPressMixin from '../keyPressMixin'


var DateConfig = React.createClass({

	getInitialState: function () {
		var config = this.props.config;
		return {dateFormat: (config.dateFormat || 'DD/MM/YYYY')}
	},

	onFormatChange: function (event) {
		var config = this.props.config
		var column_id = config.column_id
		var view = this.props.view
		var data = view.data
		var col = data.columns[column_id]
		var value = event.target.value
		col.dateFormat = value

		this.setState({dateFormat: value})
	},

	onBlur: function (event) {
		var config = this.props.config
		var view = this.props.view
		var column_id = config.column_id
		var data = view.data
		var col = data.columns[column_id]

		col.dateFormat = this.state.dateFormat
		modelActionCreators.createView(view, false, true)
	},

	handleFocus: function () {
		modelActionCreators.setFocus('view-config')
	},

	render: function () {
		var config = this.props.config
		var key = "attr-" + config.id

		return <input type = "text"
				className = "menu-input text-input"
				spellCheck = "false"
				value = {this.state.dateFormat}
				onFocus = {this.handleFocus}
				onBlur = {this.onBlur}
				onChange = {this.onFormatChange}/>
	}
})

export default DateConfig