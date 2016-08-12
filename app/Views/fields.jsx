
import React from "react"
import _ from "underscore"
import moment from "moment"
import AttributeStore from "../stores/AttributeStore"
import FocusStore from "../stores/FocusStore"
import ModelStore from "../stores/ModelStore"
import constant from "../constants/MetasheetConstants"

import $ from "jquery"

import modelActionCreators from "../actions/modelActionCreators"

import hasManyField from './Fields/HasManyField'
import manyToManyField from './Fields/ManyToManyField'
import hasOneField from './Fields/HasOneField'
import colorField from './Fields/ColorField'
import integerField from './Fields/IntegerField'
import decimalField from './Fields/FieldDefinitions/decimalField'
import textField from './Fields/FieldDefinitions/textField'
import dateField from './Fields/DateField'
import booleanField from './Fields/FieldDefinitions/BooleanField'
import primaryKeyField from './Fields/primaryKeyField'
import commitMixin from './Fields/commitMixin'
import editableInputMixin from './Fields/editableInputMixin'
import selectableMixin from './Fields/selectableMixin'




var VanillaElement = React.createClass({
	mixins: [commitMixin, editableInputMixin, selectableMixin],
	validator: _.identity
});



function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}


var fieldTypes = {
	PRIMARY_KEY: primaryKeyField,
	TEXT: textField,
	BOOLEAN: booleanField,
	HAS_ONE: hasOneField,
	HAS_MANY: hasManyField,
	MANY_TO_MANY: manyToManyField,
	COLOR: colorField,
	INTEGER: integerField,
	DECIMAL: decimalField,
	TIMESTAMP: {
		element: VanillaElement,
		validator: _.identity,
		parser: _.identity
	},

	DATE: dateField
}

export default fieldTypes;
