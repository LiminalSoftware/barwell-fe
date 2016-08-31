import React, { Component, PropTypes } from 'react';
import _ from "underscore"
import update from 'react/lib/update'
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
import DatePicker from "../../../components/DatePickerWidget"

import detailStyle from "../ConfigParts/detailStyle"

import fieldUtils from "../fieldUtils"

import GenericTextElement from "../GenericTextElement"
import getHTML from "../GenericTextElement/getHTML"

import dateStyles from "../ConfigParts/DateFormatChoice/dateStyles"

const stylers = [getAlignStyles, getBackgroundStyles, getFontStyles, detailStyle]

const formatter = function (value, _config) {
	var config = _config || this.props.config || {}
	var format = config.formatString;
	var dateObj = moment(value, 'YYYY-MM-DD');
	var prettyDate = dateObj.isValid() ? dateObj.format(format) : '';
	return prettyDate
}

const serializer = function (input) {
	return input
}

const parser = function (input, config) {
	var formatter = config.formatString
	var date = moment(input, formatter)
	return (date.isValid()) ? date.format('YYYY-MM-DD') : '-infinity'
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

	formatter: formatter,

	serializer: serializer,

	stringify: function (value) {
		var val = moment(value)
		if (val.isValid()) return val.toISOString()
		else return null
	},

	configCleanser: function (config) {
		config.formatString = config.formatString || "MM/DD/YYYY"
		return config
	},

	getDisplayHTML: getHTML.bind(null, formatter, stylers),

	element: class DateField extends Component {

		constructor (props) {
			super(props)
			this.state = {pickerOpen: false}
		}

		handleEdit (e) {
			this.refs.genericField.handleEdit(e)
		}

		commitChanges (e) {
			this.refs.genericField.commitChanges(e)
		}

		handleBlur (commit) {
			this.refs.genericField.handleBlur(commit)
		}

		getDecoratorStyle () {
			const config = this.props.config
			let style = {
				position: "absolute", 
				top: 0, bottom: 0, 
				marginTop: 0,
				marginRight: 3,
				width: 25,
				lineHeight: `${this.props.rowHeight}px`,
				zIndex: 12
			}
			if (config.align === 'right') style.left = 0 
			else style.right = 0

			return style
		}

		showPicker = () => {
			console.log('showPicker')
			this.setState(update(this.state, {
				pickerOpen: {$set: true}
			}))
		}

		getDecorator = () => {
			return <span style={this.getDecoratorStyle()}
			onClick={this.showPicker}
			className="icon blue icon-calendar-31 clickable">
			{this.state.pickerOpen ? <DatePicker value={this.props.value}/> : null}
			</span>
		}

		render () {
			return <GenericTextElement {...this.props}
				ref = "genericField"
				formatter = {formatter}
				decorator = {this.getDecorator()}
				detailElement = {DatePicker}
				serializer = {_.identity}
				parser = {parser}
				stylers = {stylers}/>
		}

	}

}