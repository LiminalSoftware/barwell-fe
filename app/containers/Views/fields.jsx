import React from "react"
import _ from "underscore"
import moment from "moment"
import AttributeStore from "../../stores/AttributeStore"

import modelActionCreators from "../../actions/modelActionCreators.js"

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

	HAS_MANY: {
		configRows: React.createClass({
			getInitialState: function () {
				var view = this.props.view 
				var config = this.props.config
				return {label: config.label}
			},
			onLabelChange: function (event) {
				var label = event.target.value
				var config = this.props.config
				var column_id = config.column_id
				var view = this.props.view
				var data = view.data
				var col = data.columns[column_id] 
				var value = event.target.value

				this.setState({'label': label})
				col.label = label
				modelActionCreators.create('view', true, view)
			},
			render: function () {
				var config = this.props.config
				var view = this.props.view
				var style = this.props.style
				var key = "attr-" + config.id
				var model_id = config.related_model_id

				return <tr key = {key + '-label-attribute'} style={style}>
					<td className="no-line"></td>
					<td>Label attribute: </td>
					<td className="right-align" colSpan="2">
						<select onChange={this.onLabelChange} value={this.state.label}>
							{AttributeStore.query({model_id: model_id}).map(function (attr) {
								return <option value={'a' + attr.attribute_id}>{attr.attribute}</option>
							})}
						</select>
					</td>
				</tr>
			}	
		}),
		element: React.createClass({
			render: function () {
				var value = this.props.value
				var config = this.props.config || {}
				var style = this.props.style
				var label = config.label;
				
				if (value) return <td style={style}>{value.map(function(obj) {
					return <span className="has-many-bubble">{obj[label || 0]}</span>
				})}</td>
				else return <td style={style}></td>
			}
		}),
	},

	COLOR: {
		element: ColorElement,
		uneditable: true
	},

	INTEGER: {
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

	DECIMAL: {
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

	TIMESTAMP: {
		element: VanillaElement,
		validator: _.identity,
		parser: _.identity
	},

	DATE: {
		configCleanser: function (config) {
			config.dateFormat = config.dateFormat || "MM/DD/YYYY"
			return config
		},
		configRows: React.createClass({
			getInitialState: function () {
				return {dateFormat: 'DD/MM/YYYY'}
			},
			onDateChange: function (event) {
				var config = this.props.config
				var column_id = config.column_id
				var view = this.props.view
				var data = view.data
				var col = data.columns[column_id] 
				var value = event.target.value
				this.setState({dateFormat: value})

				// _.debounce(function () {
				col.dateFormat = value
				modelActionCreators.create('view', false, view, false)
				// }, 100)
			},
			render: function () {
				var config = this.props.config
				var key = "attr-" + config.id
				var style = this.props.style

				return <tr key = {key + '-dateformat'} style={style}>
					<td className="no-line"></td>
					<td className="">Date Format: </td>
					<td className="" colSpan="2">
						<input type="text" value={this.state.dateFormat} onChange={this.onDateChange}/>
					</td>
				</tr>	
			}	
		}),
		element: React.createClass({
			render: function () {
				var value = this.props.value
				var config = this.props.config || {}
				var style = this.props.style
				var format = config.dateFormat || "DD MMMM YYYY";
				var dateObj = new Date(value)
				var prettyDate = moment(value).format(format)

				style.textAlign = 'right'

				return <td style={style}>{value ? prettyDate : ''}</td>
			}
		}),
		validator: _.identity,
		parser: _.identity
	}
}

export default fieldTypes;