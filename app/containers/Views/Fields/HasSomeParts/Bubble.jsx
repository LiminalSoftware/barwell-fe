import React from "react"
import _ from "underscore"

import AttributeStore from "../../../../stores/AttributeStore"
import ModelStore from "../../../../stores/ModelStore"

import modelActionCreators from "../../../../actions/modelActionCreators"


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
		var label = this.props.label
		var model = this.props.model
		var style = {}
		return <span key={obj[model._pk]}
			className="has-many-bubble"
			style = {style}
			onDrop = {this.handleDrop}
			draggable = "true"
			onDragStart = {this.handleDragStart}
			onMouseDown = {this.handleMousedown}
			>
			{obj[label]}
		</span>
	}

})

export default Bubble