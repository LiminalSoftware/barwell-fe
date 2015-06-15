import React from "react"
import _ from "underscore"
import moment from "moment"

var VanillaElement = React.createClass({
	render: function () {
		var value = this.props.value
		var style = this.props.style

		return <td style={style}>{value}</td>
	}
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
	render: function () {
		var value = this.props.value
		var style = this.props.style

		style.textAlign = 'right'
		return <td style={style}>{value}</td>
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
	render: function () {
		var value = this.props.value
		var style = this.props.style
		
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

	Color: {
		element: ColorElement,
		uneditable: true
	},

	Integer: {
		element: NumericElement,
		validator: function (input) {
			if (!(/^\d+$/).test(input))
				throw new Error('Validation Error')
			return parseInt(input)
		},
		parser: function (input) {
			return input.match(/^(\d*)/)[0]
		}
	},

	Decimal: {
		element: NumericElement,
		validator: function (input) {
			if (!(/^\d*(\.\d*)?$/).test(input))
				throw new Error('Validation Error')
			return parseInt(input)
		},
		parser: function (input) {
			return input.match(/^(\d*\.?\d*)/)[0]
		}
	},

	Timestamp: {
		element: VanillaElement,
		validator: _.identity,
		parser: _.identity
	},

	Date: {
		configCleanser: function (config) {
			config.dateFormat = config.dateFormat || "MM/DD/YYYY"
			return config
		},
		configRows: function (config, style) {
			var key = "attr-" + config.id

			return <tr key = {key + '-dateformat'} style={style}>
				<td className="width-10 no-line"></td>
				<td className="width-50">Date Format: </td>
				<td className="right-align" colSpan="2">
					<input type="text" value="DD MMMM YYYY"/>
				</td>
			</tr>
		},
		element: React.createClass({
			render: function () {
				var value = this.props.value
				var config = this.props.config || {}
				var style = this.props.style
				var format = config.dateFormat || "DD MMMM YYYY";
				var dateObj = new Date(value)
				var prettyDate = moment(parseInt(value)).format(format)

				style.textAlign = 'right'

				return <td style={style}>{prettyDate}</td>
			}
		}),
		validator: _.identity,
		parser: _.identity
	}
}

export default fieldTypes;