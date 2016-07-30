import React, { Component, PropTypes } from 'react';
import _ from "underscore"

import editableInputMixin from '../editableInputMixin'

import AlignChoice from "../textFieldConfig/AlignChoice"
import ColorChoice from "../textFieldConfig/ColorChoice"
import TextChoice from "../textFieldConfig/TextChoice"

import fieldUtils from "../fieldUtils"

import GenericTextField from "../GenericTextField"
import getGenericTextHTML from "../GenericTextField/getGenericTextHTML"

function format (value, _config) {
	if (value === undefined || value === null) return '';
	else return value
}

function parser (input) {
	if (input === null || input === undefined) return '';
	else return String(input);
}

function validator (input) {
	return String(input || '')
}

const stylers = []

const textField = {
		
	configParts: [AlignChoice, ColorChoice, TextChoice],
	
	sortable: true,

	category: 'General',

	defaultDefault: '',

	description: 'Text',
	
	sortIcon: 'sort-alpha-',
	
	icon: 'text-align-justify',
	
	canBeLabel: true,
	
	defaultWidth: 150,

	getDisplayHTML: getGenericTextHTML.bind(null, format, stylers),

	element: class TextField extends Component {
		render () {
			return <GenericTextField {...this.props}
				format = {_.identity}
				validator = {_.identity}
				parser = {_.identity}
				stylers = {[]}/>
		}
	}
}

export default textField
