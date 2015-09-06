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

var ColorElement = React.createClass({
	mixins: [editableInputMixin, commitMixin],

	validator: function (input) {
		if ((/^#[0-9A-F]{3,6}$/).test(input)) return input
		else return '#FFF'
	},

	format: function (value) {
		var value = this.props.value
		return <div style={{backgroundColor: value}} className="color-block"></div>
	}
});

var colorField = {
	element: ColorElement,
	uneditable: true
}

export default colorField;
