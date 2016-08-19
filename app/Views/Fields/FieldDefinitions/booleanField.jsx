import React, { Component, PropTypes } from 'react'

import fieldUtils from "../fieldUtils"
import _ from "underscore"

import BackgroundChoice from "../ConfigParts/BackgroundChoice"
import getBackgroundStyles from "../ConfigParts/BackgroundChoice/getStyles"

import CheckboxElement from "../CheckboxElement"
import getHTML from "../CheckboxElement/getHTML"

const stylers = [getBackgroundStyles]

var booleanField = {

	defaultWidth: 50,

	sortable: true,

	sortIcon: 'sort-amount-',

	category: 'General',

	description: 'Check-box',
	
	icon: 'check-square',

	configParts: [BackgroundChoice],

	expandable: false,

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
				validator = {_.identity}
				parser = {v=>!!v}
				stylers = {stylers}/>
		}
	}
}

export default booleanField
