import React from "react"
import _ from "underscore"

import AttributeStore from "../../../../stores/AttributeStore"
import ModelStore from "../../../../stores/ModelStore"

import modelActionCreators from "../../../../actions/modelActionCreators"
import tinycolor from "tinycolor2"

var Bubble = React.createClass({

	handleDragStart (e) {
		var obj = this.props.obj;
		var model_id = this.props.model.model_id;
		obj._model_id = this.props.model.model_id;
		var json = JSON.stringify(obj);
		e.dataTransfer.effectAllowed = 'move';
		e.dataTransfer.setData('m' + obj._model_id, json);
		// e.stopPropagation()
	},

	handleMousedown: function (e) {
		e.stopPropagation()
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
			draggable = "true"
			onDragStart = {this.handleDragStart}
			onMouseDown = {this.handleMousedown}>
			{label}
			<span className = "icon icon-circle-cross"/>
		</span>
	}

})

export default Bubble