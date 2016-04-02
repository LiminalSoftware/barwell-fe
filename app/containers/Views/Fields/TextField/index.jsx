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
// import TextFieldConfig from "../textFieldConfig"

import AlignChoice from "../textFieldConfig/AlignChoice"
import ColorChoice from "../textFieldConfig/ColorChoice"
import TextChoice from "../textFieldConfig/TextChoice"

var textField = {
	configParts: [AlignChoice, ColorChoice, TextChoice],
	sortable: true,
	sortIcon: 'sort-alpha-',
	canBeLabel: true,
	element: React.createClass({
		mixins: [editableInputMixin, commitMixin, selectableMixin, keyPressMixin],
    	validator: _.identity,
		parser: function (input) {
			input = String(input);
			input = input.replace(/[\r\n]/g, '');
			return input;
		}
	})
}

export default textField
