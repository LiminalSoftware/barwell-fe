import React from "react"
import _ from "underscore"

var VanillaElement = React.createClass({
	
	render: function () {
		var value = this.props.value
		var style = this.props.style
		var clicker = this.props.clicker
		return <td style={style}>{value}</td>
	}
});

var NumericElement = React.createClass({
	render: function () {
		var value = this.props.value
		var style = this.props.style
		var clicker = this.props.clicker

		style.textAlign = 'right'
		return <td style={style}>{value}</td>
	}
});

var CheckboxElement = React.createClass({
	render: function () {
		var value = this.props.value
		var style = this.props.style
		var clicker = this.props.clicker
		
		return <td style={style} className="checkbox">
			<input type="checkbox" checked={value}></input>
		</td>
	}
});

var fieldTypes = {
	Text: {
		element: VanillaElement,
		validator: _.identity,
		parser: _.identity
	},
	Boolean: {
		element: CheckboxElement,
		uneditable: true
	},
	HasOne: {
		element: VanillaElement,
		uneditable: true
	},
	Integer: {
		element: NumericElement,
		validator: function (input) {
			if (!(/^\d+$/).test(input))
				throw new Error('Validation Error')
			return parseInt(input)
		},
		parser: _.identity
	},
	Timestamp: {
		element: VanillaElement,
		validator: _.identity,
		parser: _.identity
	},
	Date: {
		element: VanillaElement,
		validator: _.identity,
		parser: _.identity
	}
}

export default fieldTypes;