import React from "react"
import _ from "underscore"
import moment from "moment"
import AttributeStore from "../../stores/AttributeStore"
import FocusStore from "../../stores/FocusStore"
import ModelStore from "../../stores/ModelStore"

import $ from "jquery"

import modelActionCreators from "../../actions/modelActionCreators"

var commitMixin = {

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
	},

	getInitialState: function () {
		return {
			value: this.parser(this.props.value)
		}
	},
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
		this.props.handleBlur()
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

var PrimaryKeyElement = React.createClass({
	render: function () {
		var value = this.props.value
		var style = this.props.style
		var editing = this.props.editing

		return <td style={style} className="uneditable">
			{this.props.value}
		</td>
	}
})

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

	parser: function (input) {
		return (!!input);
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

var HasManyBubble = React.createClass({

	getInitialState: function () {
		return {
			dragging: false,
			relX: null,
			relY: null,
			posX: 0,
			posY: 0
		}
	},

	render: function () {
		var obj = this.props.obj
		var label = this.props.label
		var model = this.props.model
		var style = {
			position: this.state.dragging ? 'absolute' : 'relative',
			marginLeft: (this.state.posX),
			marginTop: (this.state.posY)
		}
		return <span key={obj[model.pk]} 
			className="has-many-bubble"
			style = {style} 
			onMouseDown = {this.onMouseDown}
			>
			{obj[label]}
		</span>
	},

	onMouseDown: function (e) {
	    if (e.button !== 0) return
	    var pos = $(this.getDOMNode()).offset()
	    this.setState({
	      dragging: true,
	      relX: e.pageX,
	      relY: e.pageY
	    })
	    e.stopPropagation()
	    e.preventDefault()
	},

	onMouseUp: function (e) {
   	var view = this.props.view   
		var viewData = view.data
		var col = this.props.column

		this.setState({
			dragging: false,
			posX: 0, 
			posY: 0
		})
	},

	onMouseMove: function (e) {
	   if (!this.state.dragging) return
	   this.setState({
	      posX: e.pageX - this.state.relX,
	      posY: e.pageY - this.state.relY
	   })
	},

	componentDidUpdate: function (props, state) {
		if (this.state.dragging && !state.dragging) {
			document.addEventListener('mousemove', this.onMouseMove)
			document.addEventListener('mouseup', this.onMouseUp)
		} else if (!this.state.dragging && state.dragging) {
		   document.removeEventListener('mousemove', this.onMouseMove)
		   document.removeEventListener('mouseup', this.onMouseUp)
		}
	},

})

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

	HAS_MANY: {
		configRows: React.createClass({

			handleEdit: function () {

			},
			
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
				var relatedModel = ModelStore.get(config.related_model_id)
				
				if (value) return <td style={style}> {value.map(function(obj) {
					return <HasManyBubble 
						key = {obj.cid || obj[relatedModel.pk]} 
						obj={obj} 
						model = {relatedModel} 
						label = {label} />
				})}</td>
				else return <td style={style}></td>
			}
		})

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