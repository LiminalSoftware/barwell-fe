import React, { Component, PropTypes } from 'react';
import _ from "underscore"

import GenericTextElement from "../GenericTextElement"
import getHTML from "../GenericTextElement/getHTML"


export default {

	defaultHidden: true,
	
	defaultWidth: 80,
	
	defaultAlign: 'center',
	
	icon: 'key-hole',
	
	description: 'Unique identifier',
	
	sortable: true,
	
	sortIcon: 'sort-numeric-',
	
	uneditable: true,
	
	unchangeable: true,

	getDisplayHTML: getHTML.bind(null, _.identity, []),

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
				format = {_.identity}
				validator = {_.identity}
				parser = {_.identity}
				stylers = {[]}/>
		}
	}
}