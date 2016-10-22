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

	defaultHidden: false,
	
	defaultWidth: 80,
	
	defaultAlign: 'center',
	
	icon: 'list2',
	
	description: 'Ordering',

	category: "General",
	
	sortable: true,
	
	sortIcon: 'sort-numeric-',
	
	uneditable: true,

	changeMessage: 'Ordering cannot be directly modified.  You may drag and drop to re-sort items',
	
	unchangeable: true,

	parser: _.identity,

	formatter: _.identity,

	serializer: _.identity,

	getDisplayHTML: getHTML.bind(null, _.identity, stylers),

	element: class PrimaryKeyElement extends Component {

		handleEdit (e) {
			
		}

		commitChanges (e) {
			
		}

		handleBlur (commit) {
			
		}

		render () {
			const value = this.props.index
			return <GenericTextElement {...this.props}
				ref = "genericField"
				formatter = {_.identity}
				serializer = {_.identity}
				parser = {_.identity}
				stylers = {stylers}/>
		}
	}
}
