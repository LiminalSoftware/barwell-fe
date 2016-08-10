import React, { Component, PropTypes } from 'react'

import fieldUtils from "../fieldUtils"
import _ from "underscore"

import BackgroundChoice from "../ConfigParts/BackgroundChoice"
import getBackgroundStyles from "../ConfigParts/BackgroundChoice/getStyles"

import BooleanElement from "../BooleanElement"
import getHTML from "../BooleanElement/getHTML"

const stylers = [getBackgroundStyles]

var booleanField = {

	defaultWidth: 50,

	sortable: true,

	sortIcon: 'sort-amount-',

	category: 'General',

	description: 'True / false',

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
			this.refs.genericField.handleEdit(e)
		}

		commitChanges (e) {
			
		}

		handleBlur (commit) {
			
		}

		render () {
			return <BooleanElement {...this.props}
				ref = "field"
				validator = {_.identity}
				parser = {v=>!!v}
				stylers = {stylers}/>
		}
	}
}

export default booleanField
