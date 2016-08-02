import React, { Component, PropTypes } from 'react';
import _ from "underscore"

import editableInputMixin from '../editableInputMixin'

import AlignChoice from "../textFieldConfig/AlignChoice"
import ColorChoice from "../textFieldConfig/ColorChoice"
import TextChoice from "../textFieldConfig/TextChoice"

import fieldUtils from "../fieldUtils"

import GenericTextField from "../GenericTextField"
import getGenericTextHTML from "../GenericTextField/getGenericTextHTML"


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

	getDisplayHTML: getGenericTextHTML.bind(null, _.identity, stylers),

	element: class TextField extends Component {

		handleEdit (e) {
			this.refs.genericField.handleEdit(e)
		}

		commitChanges (e) {
			this.refs.genericField.commitChanges(e)
		}

		handleBlur (commit) {
			this.refs.genericField.handleBlur(commit)
		}

		render () {
			return <GenericTextField {...this.props}
				ref = "genericField"
				format = {_.identity}
				validator = {_.identity}
				parser = {_.identity}
				stylers = {[]}/>
		}
	}
}

export default textField
