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

import TextFieldConfig from "../textFieldConfig"

var textField = {
	configA: TextFieldConfig,
	sortable: true,
	element: React.createClass({
		mixins: [editableInputMixin, commitMixin, selectableMixin],
    detailIcon: 'icon-maximise-2',
    validator: _.identity,
		parser: _.identity
	})
}

export default textField
