import React, { Component, PropTypes } from 'react';
import _ from "underscore"

import GenericTextElement from "../GenericTextElement"
import getHTML from "../GenericTextElement/getHTML"


const parser = function (input) {
	if (_.isNumber(input) )
		return Math.floor(input)
	if (!(/^\d+$/).test(input))
		return null
	return parseInt(input)
}

export default {

	defaultHidden: false,
	
	defaultWidth: 80,
	
	defaultAlign: 'right',
	
	icon: 'abacus',
	
	description: 'Integer',

	category: 'Numbers and Values',
	
	sortable: true,
	
	sortIcon: 'sort-numeric-',
	
	uneditable: true,
	
	unchangeable: true,

	getDisplayHTML: getHTML.bind(null, _.identity, []),

	element: class IntegerElement extends Component {

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
				parser = {parser}
				stylers = {[]}/>
		}
	}
}