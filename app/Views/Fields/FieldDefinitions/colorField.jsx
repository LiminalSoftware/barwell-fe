import React, { Component, PropTypes } from 'react';
import _ from "underscore"
import tinycolor from "tinycolor2"

import GenericTextElement from "../GenericTextElement"
import getHTML from "../ColorElement/getHTML"

import detailStyle from "../ConfigParts/detailStyle"

const parser = function (input, config) {
	const color = tinycolor(input)
	if (color.isValid && input !== null) return color.toString()
	else return 'rgba(255,255,255,0)'
}

const formatter = function (value, config) {
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

	defaultDefault: '#FFF',

	parser: parser,

	getDisplayHTML: getHTML.bind(null, _.identity, stylers),

	element: class ColorElement extends Component {

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
			return {
				position: "absolute", 
				top: 0, bottom: 0, 
				marginTop: 0,
				marginRight: 3,
				width: 25,
				lineHeight: `${this.props.rowHeight}px`,
				zIndex: 12,
				right: 0
			}
		}

		getDecorator = () => {
			return [
				<span style={this.getDecoratorStyle()}
				onClick={this.showPicker}
				className="icon blue icon-palette clickable">
				{this.state.pickerOpen ? null : null}
				</span>,
				<div className="cell-decorator" style={{right: 0}}>
					<div className="color-sample" style={{
						background: this.props.value,
						right: 28
					}}/>
				</div>
			]
		}

		render () {
			return <GenericTextElement {...this.props}
				ref = "genericField"
				formatter = {formatter}
				decorator = {this.getDecorator()}
				serializer = {_.identity}
				parser = {parser}
				stylers = {stylers}/>
		}
	}
}
