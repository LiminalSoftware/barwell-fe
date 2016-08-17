import React, { Component, PropTypes } from 'react';
import _ from "underscore"
import moment from "moment"

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

import DateFormatChoice from "../ConfigParts/DateFormatChoice"
// import DatePicker from ""

import detailStyle from "../ConfigParts/detailStyle"

import fieldUtils from "../fieldUtils"

import GenericTextElement from "../GenericTextElement"
import getHTML from "../GenericTextElement/getHTML"

import dateStyles from "../ConfigParts/DateFormatChoice/dateStyles"

const stylers = [getAlignStyles, getBackgroundStyles, getFontStyles, detailStyle]

const format = function (value, _config) {
	var config = _config || this.props.config || {}
	var format = config.formatString;
	var dateObj = moment(value,'YYYY-MM-DD');
	var prettyDate = dateObj.isValid() ? dateObj.format(format) : '';
	return prettyDate
}

const validator = function (input) {
	var config = this.props.config || {}
	var format = config.formatString || "YYYY-MM-DD";
	var date = moment(input, format)
	if (!date.isValid()) date = moment(input, "YYYY-MM-DD")
		return date.isValid() ? date : null
}

const parser = function (input, config) {
	var format = config.formatString
	var date = moment(input, format)
	return date.format('YYYY-MM-DD')
}

export default {

	configParts: [AlignChoice, BackgroundChoice, TextChoice, DateFormatChoice],

	// detail: DatePicker,

	detailIcon: 'calendar-31',

	sortable: true,

	defaultDefault: null,

	defaultWidth: 100,
	
	defaultAlign: 'center',

	sortIcon: 'sort-time-',

	category: 'Dates and Times',

	description: 'Date',

	icon: 'calendar-31',

	parser: parser,

	format: format,

	validator: validator,

	stringify: function (value) {
		var val = moment(value)
		if (val.isValid()) return val.toISOString()
		else return null
	},

	configCleanser: function (config) {
		config.formatString = config.formatString || "MM/DD/YYYY"
		return config
	},

	getDisplayHTML: getHTML.bind(null, format, stylers),

	element: class DateField extends Component {

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
				format = {format}
				validator = {_.identity}
				parser = {parser}
				stylers = {stylers}/>
		}

	}

}