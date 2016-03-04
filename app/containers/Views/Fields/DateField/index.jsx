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

import DateDetail from "./detail"

import AlignChoice from "../textFieldConfig/AlignChoice"
import ColorChoice from "../textFieldConfig/ColorChoice"
import TextChoice from "../textFieldConfig/TextChoice"
import DateConfig from "./DateConfig"


import TextFieldConfig from "../textFieldConfig"

var dateField = {

	detail: DateDetail,

	sortable: true,

	stringify: function (value) {
		var val = moment(value)
		if (val.isValid()) return val.toISOString()
		else return null
	},

	configCleanser: function (config) {
		config.dateFormat = config.dateFormat || "MM/DD/YYYY"
		return config
	},

	configParts: [AlignChoice, ColorChoice, TextChoice, DateConfig],

	element: React.createClass({

		mixins: [editableInputMixin, commitMixin, selectableMixin, keyPressMixin],

		format: function (value) {
			var config = this.props.config || {}
			var format = config.dateFormat || "DD MMMM YYYY";
			var prettyDate = value ? moment(value).format(format) : ''
			return prettyDate
		},

		validator: function (input) {
			var config = this.props.config || {}
			var format = config.dateFormat || "YYYY-MM-DD";
			var date = moment(input, format)
			if (!date.isValid()) date = moment(input, "YYYY-MM-DD")
				return date.isValid() ? date : null
		},

		parser: function (input) {
			return input
		},

		detailIcon: 'icon-calendar-selected',

	})

}

export default dateField;
