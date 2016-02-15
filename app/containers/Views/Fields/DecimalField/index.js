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

import TextFieldConfig from "../textFieldConfig"

var decimalField = {
	configA: TextFieldConfig,
	defaultAlign: 'right',
	element: React.createClass({
		mixins: [editableInputMixin, commitMixin, selectableMixin, keyPressMixin],

		sortable: true,

		configA: TextFieldConfig,

		configB: {
			getInitialState: function () {
				return {
					commas: true
				}
			},

			handleToggleCommas: function () {
				this.setState({commas: !this.state.commas})
			},

			render: function () {
				return <span>
					<span className={"pop-down clickable  " + (this.state.commas ? " selected " : "")}
			        onMouseDown = {this.handleToggleCommas}>,</span>
				</span>
			},
		},

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
