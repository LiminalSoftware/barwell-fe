import React, { Component, PropTypes } from 'react'

import fieldUtils from "../fieldUtils"
import _ from "underscore"

import BackgroundChoice from "../ConfigParts/BackgroundChoice"
import getBackgroundStyles from "../ConfigParts/BackgroundChoice/getStyles"

import CheckboxElement from "../CheckboxElement"
import getHTML from "../CheckboxElement/getHTML"

const stylers = [getBackgroundStyles]

const parser = function (value) {
	if ((/^(false|f|no)$/i).test(value)) return false
	else if ((/^(true|t|yes|check)$/i).test(value)) return true
	else return false
}

var booleanField = {

	defaultWidth: 50,

	sortable: true,

	sortIcon: 'sort-amount-',

	category: 'General',

	description: 'Check-box',
	
	icon: 'check-square',

	configParts: [BackgroundChoice],

	expandable: false,

	parser: parser,

	defaultAlign: 'center',

	uneditable: false,

	getDisplayHTML: getHTML.bind(null, _.identity, stylers),

	stringify: function (input) {
		if (input === true) return 'true';
		else return 'false';
	},

	element: class BooleanField extends Component {

		handleEdit (e) {
			const field = this.refs.field
			this.refs.field.setValue()
		}

		commitChanges (e) {
			
		}

		handleBlur (commit) {
			
		}

		render () {
			return <CheckboxElement {...this.props}
				ref = "field"
				serializer = {_.identity}
				parser = {v=>!!v}
				stylers = {stylers}/>
		}
	}
}

export default booleanField
