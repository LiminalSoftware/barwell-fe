import React from "react"
import _ from "underscore"
import $ from "jquery"

import AttributeStore from "../../../stores/AttributeStore"
import ModelStore from "../../../stores/ModelStore"

import constant from "../../../constants/MetasheetConstants"
import modelActionCreators from "../../../actions/modelActionCreators"

var hasManyField = {
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
					key = {obj.cid || obj[relatedModel._pk]} 
					obj={obj} 
					model = {relatedModel} 
					label = {label} />
			})}</td>
			else return <td style={style}></td>
		}
	})

}

export default hasManyField


// ============================================================================

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
		return <span key={obj[model._pk]} 
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

