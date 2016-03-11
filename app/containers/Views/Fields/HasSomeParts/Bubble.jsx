import React from "react"
import _ from "underscore"

import AttributeStore from "../../../../stores/AttributeStore"
import ModelStore from "../../../../stores/ModelStore"

import modelActionCreators from "../../../../actions/modelActionCreators"
import tinycolor from "tinycolor2"

var Bubble = React.createClass({

	handleDragStart (event) {
		var obj = this.props.obj
		event.dataTransfer.effectAllowed = 'move'
		event.dataTransfer.setData('application/json', JSON.stringify(obj))
		event.stopPropagation()
	},

	handleMousedown: function (event) {
		event.stopPropagation()
	},

	render: function () {
		var obj = this.props.obj
		var label = obj[this.props.label]
		var model = this.props.model
		var color = obj[this.props.color]
		var style = {}

		if (color) {
			// var c = tinycolor(color)
			// console.log('color:' + color)
			style.background = color
			style.color = 'white'
		}

		return <span key={obj[model._pk]}
			className="has-many-bubble"
			style = {style}
			onDrop = {this.handleDrop}
			draggable = "true"
			onDragStart = {this.handleDragStart}
			onMouseDown = {this.handleMousedown}
			>
			{label}
		</span>
	}

})

export default Bubble