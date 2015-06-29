import React from "react"
import _ from "underscore"
import moment from "moment"
import AttributeStore from "../../stores/AttributeStore"
import FocusStore from "../../stores/FocusStore"

import modelActionCreators from "../../actions/modelActionCreators"

var commitMixin = {

	getInitialState: function () {
		return {
			value: this.props.value
		}
	},

	commitChanges: function () {

		var config = this.props.config
		var view = this.props.view
		var pk = this.props.pk
		var obj = this.props.object
		var patch = {}
		var selector = {}

		patch[config.column_id] = this.state.value
		selector[pk] = obj[pk]

		if (obj[pk]) modelActionCreators.patchRecords(view, patch, selector)
		else modelActionCreators.insertRecord(view, _.extend(obj, patch))
		this.revert();
	}
}

var editableInputMixin = {
	getInitialState: function () {
		return {
			editing: false
		}
	},
	
	handleKeyPress: function (event) {
		if (event.keyCode === 27) this.cancelChanges()
		if (event.keyCode === 13) this.commitChanges()
	},
	
	cancelChanges: function () {
		this.revert()
	},
	
	revert: function () {
		document.removeEventListener('keyup', this.handleKeyPress)
		this.setState({
			editing: false,
			value: this.props.value
		})
	},

	handleEdit: function (event) {
		var pk = this.props.pk;
		var column_id = this.props.config.column_id;
		
		document.addEventListener('keyup', this.handleKeyPress)
		this.setState({editing: true})
	},

	handleChange: function (event) {
		var val = this.parser(event.target.value)
		this.setState({value: val})
	}
}

var VanillaElement = React.createClass({

	mixins: [editableInputMixin, commitMixin],

	parser: _.identity,
	
	render: function () {
		var value = this.props.value
		var style = this.props.style
		var editing = this.props.editing

		return <td style={style} >
			{this.state.editing ?
			<input 
				className = "input-editor" 
				value = {this.state.value} 
				autoFocus
				onBlur = {this.revert}
				onChange = {this.handleChange} />
			:
			this.props.value}
		</td>
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
	mixins: [editableInputMixin, commitMixin],

	validator: function (input) {
		if (!(/^\d+$/).test(input))
			throw new Error('Validation Error')
		return parseInt(input)
	},

	parser: function (input) {
		return input.match(/^(\d*)/)[0]
	},

	render: function () {
		var value = this.props.value
		var style = this.props.style
		var editing = this.props.editing

		return <td style={style} >
			{this.state.editing ?
			<input 
				className = "input-editor" 
				value = {this.state.value} 
				autoFocus
				onBlur = {this.revert}
				onChange = {this.handleChange} />
			:
			this.props.value}
		</td>
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
		element: VanillaElement,
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
				var pk = config.related_primary_key
				
				if (value) return <td style={style}>{value.map(function(obj) {
					return <span key={config.column_id + '-' + (obj[pk] || obj.cid)} className="has-many-bubble">{obj[label]}</span>
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
		element: NumericElement
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
				var config = this.props.config;
				return {dateFormat: (config.dateFormat || 'DD/MM/YYYY')}
			},
			onFormatChange: function (event) {
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
						<input type="text" value={this.state.dateFormat} onChange={this.onFormatChange}/>
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

				return <td style={style}>{value ? prettyDate : ''}</td>
			}
		}),
		validator: _.identity,
		parser: _.identity
	}
}

export default fieldTypes;