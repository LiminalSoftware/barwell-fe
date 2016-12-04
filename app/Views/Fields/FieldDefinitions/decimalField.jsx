import React, { Component, PropTypes } from 'react';
import _ from "underscore"

import numbro from "numbro"

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
import getHTML from "../DecimalElement/getHTML"

import displayStyles from "../ConfigParts/NumberFormatChoice/displayStyles"


const stylers = [getAlignStyles, getBackgroundStyles, getFontStyles]

const formatter = function (value, config) {
	if (config.zeroDash && value === 0) return '-'
	var prettyVal = numbro(value).format(config.formatString);
	return prettyVal;
}

const parser = function (input, config) {
	const format = config.formatString || ''
	if (input === null) return 0
	input = String(input).trim()
	if (format.slice(-1) === '%' && input.slice(-1) !== '%') input = input + '%'; 
	return numbro().unformat(input)
}

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

	standardConfig: {
		formatString: '0,0.[0000000]'
	},

	configCleanser: (config) => {
		var style = config.displayStyle
		if (!(config.displayStyle in displayStyles))
			config.displayStyle = "DECIMAL"
		if (!config.formatString)
			config.formatString = displayStyles[config.displayStyle].formatString
		return config
	},

	parser: parser,

	serializer: _.identity,
	
	formatter: formatter,
	
	getDisplayHTML: getHTML.bind(null, formatter, stylers),

	element: class DecimalField extends Component {

		handleEdit (e) {
			this.refs.genericField.handleEdit(e)
		}

		commitChanges (e) {
			this.refs.genericField.commitChanges(e)
		}

		handleBlur (commit) {
			this.refs.genericField.handleBlur(commit)
		}

		getDecorator () {
			const config = this.props.config
			return [<span className="decimal-prefix" key="prefix">{config.prefix}</span>]
		}

		render () {
			return <GenericTextElement {...this.props}
				ref = "genericField"
				decorators = {this.getDecorator()}
				formatter = {formatter}
				serializer = {_.identity}
				parser = {parser}
				stylers = {stylers}/>
		}
	}
}