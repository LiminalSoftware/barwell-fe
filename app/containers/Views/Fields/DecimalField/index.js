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

import displayStyles from './displayStyles'

import AlignChoice from "../textFieldConfig/AlignChoice"
import ColorChoice from "../textFieldConfig/ColorChoice"
import TextChoice from "../textFieldConfig/TextChoice"
import NumberFormatChoice from './NumberFormatChoice'

var blurOnClickMixin = require('../../../../blurOnClickMixin')

import TextFieldConfig from "../textFieldConfig"

var decimalField = {

	defaultAlign: 'right',

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
		mixins: [editableInputMixin, commitMixin, selectableMixin, keyPressMixin],

		sortable: true,

		format: function (value) {
			var config = this.props.config || {}
			
			var prettyVal = numeral(value).format(config.formatString)
			if (config.displayStyle === 'PIE') {
				var parts = Math.round(value/8, 0);
				var icon;
				if (parts < 1) icon = 'icon-pie2';
				if (parts >= 1 && parts <= 7) icon = ('icon-pie2-' + parts);
				if (parts > 7) icon = 'icon-pie';
				return <span className = {"icon " + icon}/>
			}
			return prettyVal
		},

		validator: function (input) {
			var config = this.props.config || {}
			if (_.isNumber(input)) return input
		},

		parser: function (input) {
			return numeral().unformat(input)
		}

	})
}

export default decimalField
