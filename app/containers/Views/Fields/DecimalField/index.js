import React from "react"
import _ from "underscore"
import $ from "jquery"
import numeral from "numeral"

import AttributeStore from "../../../../stores/AttributeStore"
import ModelStore from "../../../../stores/ModelStore"

import constant from "../../../../constants/MetasheetConstants"
import modelActionCreators from "../../../../actions/modelActionCreators"

import commitMixin from '../commitMixin'
import editableInputMixin from '../editableInputMixin'
import selectableMixin from '../selectableMixin'
import keyPressMixin from '../keyPressMixin'
import bgColorMixin from '../bgColorMixin';

import displayStyles from './displayStyles'

import AlignChoice from "../textFieldConfig/AlignChoice"
import ColorChoice from "../textFieldConfig/ColorChoice"
import TextChoice from "../textFieldConfig/TextChoice"
import NumberFormatChoice from './NumberFormatChoice'

var blurOnClickMixin = require('../../../../blurOnClickMixin')

import TextFieldConfig from "../textFieldConfig"

var decimalField = {

	sortable: true,

	sortIcon: 'sort-numeric-',

	defaultAlign: 'right',

	defaultWidth: 100,

	configCleanser: function (config) {
		var style = config.displayStyle
		if (!(config.displayStyle in displayStyles))
			config.displayStyle = "DECIMAL"
		if (!config.formatString)
			config.formatString = displayStyles[config.displayStyle].formatString
		return config
	},

	configParts: [AlignChoice, ColorChoice, TextChoice, NumberFormatChoice],
	
	element: React.createClass({

		mixins: [
			editableInputMixin, 
			bgColorMixin, 
			commitMixin, 
			selectableMixin, 
			keyPressMixin
		],

		sortable: true,

		format: function (value, _config) {
			// var config = this.props.config || {}
			var config = _config || this.props.config || {}
			
			var prettyVal = numeral(value).format(config.formatString)
			return prettyVal
		},

		validator: function (input) {
			// console.log('validator input: ' + input)
			var config = this.props.config || {}
			if (_.isNumber(input)) return input
		},

		parser: function (input) {
			var config = this.props.config || {}
			var format = config.formatString || ''
			input = String(input).trim()
			if (format.slice(-1) === '%' && input.slice(-1) !== '%') input = input + '%'; 
			return numeral().unformat(input)
		}

	})
}

export default decimalField
