import React, { Component, PropTypes } from 'react';
import _ from "underscore"
import tinycolor from "tinycolor2"

import GenericTextElement from "../GenericTextElement"
import getHTML from "../ColorElement/getHTML"

import detailStyle from "../ConfigParts/detailStyle"

const parser = function (input) {
	const color = tinycolor(input)
	if (color.isValid) return color.toString()
	else return 'rgba(255,255,255,0)'
}

const format = function (value, config) {
	return value;
}

const stylers = [detailStyle]

export default {

	defaultHidden: false,
	
	defaultWidth: 80,

	sortable: false,

	category: 'General',

	description: 'Color',

	icon: 'eye-dropper',

	getDisplayHTML: getHTML.bind(null, _.identity, stylers),

	element: class ColorElement extends Component {

		handleEdit (e) {
			this.refs.genericField.handleEdit(e)
		}

		commitChanges (e) {
			this.refs.genericField.commitChanges(e)
		}

		handleBlur (commit) {
			this.refs.genericField.handleBlur(commit)
		}

		getDecorator = () => {
			return <div className="cell-decorator" style={{right: 0}}>
				<div className="color-sample" style={{
					background: this.props.value
				}}/>
			</div>
		}

		render () {
			return <GenericTextElement {...this.props}
				ref = "genericField"
				format = {format}
				decorator = {this.getDecorator()}
				validator = {_.identity}
				parser = {parser}
				stylers = {stylers}/>
		}
	}
}
