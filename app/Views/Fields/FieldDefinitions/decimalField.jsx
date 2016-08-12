import React, { Component, PropTypes } from 'react';
import _ from "underscore"

import editableInputMixin from '../editableInputMixin'

/*
 *	Align styler
 */
import AlignChoice from "../ConfigParts/AlignChoice"
import getAlignStyles from "../ConfigParts/AlignChoice/getStyles"

/*
 *	Background color styler
 */

import BackgroundChoice from "../ConfigParts/BackgroundChoice"
import getBackgroundStyles from "../ConfigParts/BackgroundChoice/getStyles"

/*
 *	Font style styler
 */

import TextChoice from "../ConfigParts/TextChoice"
import getFontStyles from "../ConfigParts/TextChoice/getStyles"

/*
 *	Numeric formatter
 */

import NumberFormatChoice from "../ConfigParts/NumberFormatChoice"

import fieldUtils from "../fieldUtils"

import GenericTextElement from "../GenericTextElement"
import getHTML from "../GenericTextElement/getHTML"

import displayStyles from "../ConfigParts/NumberFormatChoice/displayStyles"


const stylers = [getAlignStyles, getBackgroundStyles, getFontStyles]

export default {

	configParts: [AlignChoice, BackgroundChoice, TextChoice, NumberFormatChoice],

	sortable: true,
	
	sortIcon: 'sort-numeric-',

	icon: 'dial',

	defaultDefault: 0,

	category: 'Numbers and Values',

	description: 'Decimal',

	defaultAlign: 'right',

	defaultWidth: 150,

	configCleanser: (config) => {
		var style = config.displayStyle
		if (!(config.displayStyle in displayStyles))
			config.displayStyle = "DECIMAL"
		if (!config.formatString)
			config.formatString = displayStyles[config.displayStyle].formatString
		return config
	},
	
	getDisplayHTML: getHTML.bind(null, _.identity, stylers),

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
			return <GenericTextElement {...this.props}
				ref = "genericField"
				format = {_.identity}
				validator = {_.identity}
				parser = {_.identity}
				stylers = {stylers}/>
		}
	}
}