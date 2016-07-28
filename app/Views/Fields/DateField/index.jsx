import React from "react"
import _ from "underscore"
import $ from "jquery"
import moment from "moment"

import styles from "./style.less"
import AttributeStore from "../../../stores/AttributeStore"
import ModelStore from "../../../stores/ModelStore"

import constant from "../../../constants/MetasheetConstants"
import modelActionCreators from "../../../actions/modelActionCreators"

import commitMixin from '../commitMixin'
import editableInputMixin from '../editableInputMixin'
import selectableMixin from '../selectableMixin'
import DateValidatorMixin from './DateValidatorMixin'
import keyPressMixin from '../keyPressMixin'
import bgColorMixin from '../bgColorMixin';

import DatePicker from './DatePicker'

import AlignChoice from "../textFieldConfig/AlignChoice"
import ColorChoice from "../textFieldConfig/ColorChoice"
import TextChoice from "../textFieldConfig/TextChoice"
import DateConfig from "./DateConfig"


import TextFieldConfig from "../textFieldConfig"

var dateField = {

	detail: DatePicker,

	sortable: true,

	defaultDefault: null,

	defaultWidth: 100,

	defaultAlign: 'center',

	sortIcon: 'sort-time-',

	category: 'Dates and Times',

	description: 'Date',

	icon: 'calendar-31',

	stringify: function (value) {
		var val = moment(value)
		if (val.isValid()) return val.toISOString()
		else return null
	},

	configCleanser: function (config) {
		config.formatString = config.formatString || "MM/DD/YYYY"
		return config
	},

	configParts: [AlignChoice, ColorChoice, TextChoice, DateConfig],

	element: React.createClass({

		mixins: [editableInputMixin, bgColorMixin, commitMixin, selectableMixin, keyPressMixin],

		// revert: function () {
		// 	this.setState({
		// 		editing: false,
		// 		open: false
		// 	})
		// 	this.props._handleBlur()
		// },

		format: function (value, _config) {
			var config = _config || this.props.config || {}
			var format = config.formatString || "DD MMMM YYYY";
			var dateObj = moment(value);
			var prettyDate = dateObj.isValid() ? dateObj.format(format) : '';
			return prettyDate
		},

		validator: function (input) {
			console.log('date validator')
			var config = this.props.config || {}
			var format = config.formatString || "YYYY-MM-DD";
			var date = moment(input, format)
			if (!date.isValid()) date = moment(input, "YYYY-MM-DD")
				return date.isValid() ? date : null
		},

		parser: function (input) {
			return input
		},

		detailIcon: 'icon-calendar-31',

	})

}

export default dateField;
