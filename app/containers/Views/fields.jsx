
import React from "react"
import _ from "underscore"
import moment from "moment"
import AttributeStore from "../../stores/AttributeStore"
import FocusStore from "../../stores/FocusStore"
import ModelStore from "../../stores/ModelStore"
import constant from "../../constants/MetasheetConstants"

import $ from "jquery"

import modelActionCreators from "../../actions/modelActionCreators"

import hasManyField from './Fields/hasManyField'
import dateField from './Fields/dateField'
import commitMixin from './Fields/commitMixin'
import editableInputMixin from './Fields/editableInputMixin'


var PrimaryKeyElement = React.createClass({
	render: function () {
		var value = this.props.value
		var style = this.props.style

		return <td style={style} className="uneditable">
			{this.props.value}
		</td>
	}
})

var VanillaElement = React.createClass({
	mixins: [commitMixin, editableInputMixin],
	validator: _.identity
});

var HasOneElement = React.createClass({
	render: function () {
		var value = this.props.value
		var config = this.props.config || {}
		var style = this.props.style || {}
		var object = this.props.object

		return <td style={style}>{value}</td>
	}
});

var NumericElement = React.createClass({
	mixins: [editableInputMixin, commitMixin],

	validator: function (input) {
		if (_.isNumber(input) ) 
			return Math.floor(input)
		if (!(/^\d+$/).test(input))
			return null
		return parseInt(input)
	},

	parser: function (input) {
		return input.match(/^(\d*)/)[0]
	}
});




var ColorElement = React.createClass({
	render: function () {
		var value = this.props.value
		var style = this.props.style || {}
		var config = this.props.col

		if (!!value) try {
			var color = JSON.parse(this.props.value)
			style.background = "rgb(" + [color.r, color.g, color.b].join(",") + ")"
		} catch (err) {
			style.background = "white"
		}
		
		return <td style={style}></td>
	}
});

var CheckboxElement = React.createClass({
	
	mixins: [commitMixin],

	revert: _.noop,

	validator: function (input) {
		return (!!input)
	},

	handleClick: function (event) {
		this.toggle()
		event.preventDefault()
	},

	toggle: function () {
		this.setState({value: !this.state.value})
		this.commitChanges()
	},

	render: function () {
		var value = this.props.value
		var style = this.props.style
		
		return <td style={style} className="checkbox">
			<input type="checkbox" checked={value} onChange={this.handleClick}></input>
		</td>
	}
});


var fieldTypes = {
	PRIMARY_KEY: {
		element: PrimaryKeyElement,
		uneditable: true
	},
	TEXT: {
		element: VanillaElement,
		validator: _.identity,
		parser: _.identity
	},
	BOOLEAN: {
		element: CheckboxElement,
		uneditable: true
	},

	HasOne: {
		element: VanillaElement,
		uneditable: true
	},

	HAS_MANY: hasManyField,

	COLOR: {
		element: ColorElement,
		uneditable: true
	},

	INTEGER: {
		element: React.createClass({
			mixins: [editableInputMixin, commitMixin],

			validator: function (input) {
				if (_.isNumber(input) ) 
					return Math.floor(input)
				if (!(/^\d+$/).test(input))
					return null
				return parseInt(input)
			},

			parser: function (input) {
				return input.match(/^(\d*)/)[0]
			}
		})
	},

	DECIMAL: {element: React.createClass({
			mixins: [editableInputMixin, commitMixin],

			validator: function (input) {
				if (!(/^\d*(\.\d*)?$/).test(input))
					return null
				return parseFloat(input)
			},

			parser: function (input) {
				return input.match(/^(\d*\.?\d*)/)[0]
			}
		})
	},

	TIMESTAMP: {
		element: VanillaElement,
		validator: _.identity,
		parser: _.identity
	},

	DATE: dateField
}

export default fieldTypes;