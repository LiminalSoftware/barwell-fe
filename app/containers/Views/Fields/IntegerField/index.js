import React from "react"
import _ from "underscore"
import $ from "jquery"
import moment from "moment"

import AttributeStore from "../../../../stores/AttributeStore"
import ModelStore from "../../../../stores/ModelStore"

import constant from "../../../../constants/MetasheetConstants"
import modelActionCreators from "../../../../actions/modelActionCreators"

import commitMixin from '../commitMixin'
import editableInputMixin from '../editableInputMixin'
import selectableMixin from '../selectableMixin'
import keyPressMixin from '../keyPressMixin'

import AlignChoice from "../textFieldConfig/AlignChoice"
import ColorChoice from "../textFieldConfig/ColorChoice"
import TextChoice from "../textFieldConfig/TextChoice"

var integerField = {
	sortable: true,
	defaultWidth: 50,
	configParts: [AlignChoice, ColorChoice, TextChoice],
	element: React.createClass({
		mixins: [editableInputMixin, commitMixin, selectableMixin, keyPressMixin],

		validator: function (input) {
			if (_.isNumber(input) )
				return Math.floor(input)
			if (!(/^\d+$/).test(input))
				return null
			return parseInt(input)
		},

		parser: function (input) {
			input = '' + input
			return input.match(/^(\d*)/)[0]
		}
	})
}

export default integerField
