import React, { Component, PropTypes } from 'react';
import _ from "underscore"

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


import fieldUtils from "../fieldUtils"

import GenericTextElement from "../GenericTextElement"
import getHTML from "../GenericTextElement/getHTML"


const parser = input => ((input===null || input===undefined) ? '' : String(input))

const stylers = [getAlignStyles, getBackgroundStyles, getFontStyles]

const textField = {
	
	configParts: [AlignChoice, BackgroundChoice, TextChoice],
	
	sortable: true,

	category: 'General',

	defaultDefault: '',

	description: 'Text',
	
	sortIcon: 'sort-alpha-',
	
	icon: 'text-align-justify',
	
	canBeLabel: true,
	
	defaultWidth: 150,

	parser: parser,

	getDisplayHTML: getHTML.bind(null, _.identity, stylers),

	element: class TextField extends Component {

		handleEdit (e) {
			this.refs.genericField.handleEdit(e)
		}

		handleBlur (commit) {
			this.refs.genericField.handleBlur(commit)
		}

		render () {
			return <GenericTextElement {...this.props}
				ref = "genericField"
				format = {_.identity}
				validator = {_.identity}
				parser = {parser}
				stylers = {stylers}/>
		}
	}
}

export default textField
