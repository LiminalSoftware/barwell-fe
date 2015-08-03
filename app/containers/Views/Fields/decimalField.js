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

var decimalField = {
	element: React.createClass({
		mixins: [editableInputMixin, commitMixin],

		validator: function (input) {
			if (!(/^\d*(\.\d*)?$/).test(input))
				return null
			return parseFloat(input)
		},

		parser: function (input) {
			return input.match(/^(\d*\.?\d*)/)[0]
		}
	})
}

export default decimalField