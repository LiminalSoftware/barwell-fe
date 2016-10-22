import React, { Component, PropTypes } from 'react';
import _ from "underscore"

import AlignChoice from "../ConfigParts/AlignChoice"
import getAlignStyles from "../ConfigParts/AlignChoice/getStyles"

import GenericTextElement from "../GenericTextElement"
import getHTML from "../GenericTextElement/getHTML"

import uneditableStyle from "../ConfigParts/uneditableStyle"

const stylers = [uneditableStyle, getAlignStyles]

export default {

	configParts: [AlignChoice],

	defaultHidden: true,
	
	defaultWidth: 80,
	
	defaultAlign: 'center',
	
	icon: 'key-hole',
	
	description: 'Unique identifier',
	
	sortable: false,
	
	sortIcon: 'sort-numeric-',
	
	uneditable: true,
	
	unchangeable: true,

	getDisplayHTML: getHTML.bind(null, _.identity, stylers),

	element: class PrimaryKeyElement extends Component {

		handleEdit (e) {
			
		}

		commitChanges (e) {
			
		}

		handleBlur (commit) {
			
		}

		render () {
			return <GenericTextElement {...this.props}
				ref = "genericField"
				formatter = {_.identity}
				serializer = {_.identity}
				parser = {_.identity}
				stylers = {stylers}/>
		}
	}
}