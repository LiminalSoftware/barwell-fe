import React from "react"
import _ from "underscore"
import $ from "jquery"

import AttributeStore from "../../../stores/AttributeStore"
import ModelStore from "../../../stores/ModelStore"
import KeyStore from "../../../stores/KeyStore"
import KeycompStore from "../../../stores/KeycompStore"
import constant from "../../../constants/MetasheetConstants"
import modelActionCreators from "../../../actions/modelActionCreators"

import selectableMixin from './selectableMixin'

var hasManyField = {
	configA: React.createClass({

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

			col.label = label
			this.setState({'label': label})

			modelActionCreators.create('view', true, view)
		},

		render: function () {
			var config = this.props.config
			var view = this.props.view
			var style = this.props.style
			var key = "attr-" + config.id
			var model_id = config.related_model_id

			return <span className="double-column-config"
				key = {key + '-label-attribute'} >
				<select onChange={this.onLabelChange}
					className = "menu-input selector"
					value={this.state.label}>
					{AttributeStore.query({model_id: model_id}).map(function (attr) {
						return <option key = {'a' + attr.attribute_id} value={'a' + attr.attribute_id}>{attr.attribute}</option>
					})}
				</select>
			</span>
		}
	}),

	element: React.createClass({
		mixins: [selectableMixin],

		getInitialState: function () {
			return {droppable: false}
		},

		handleDragEnter: function (event) {
			event.preventDefault();
			this.setState({droppable: true})
		},

		preventDefault: function (event) {
			event.preventDefault();
		},

		handleDragLeave: function () {
			this.setState({droppable: false})
		},

		handleDragEnd: function () {
			this.setState({droppable: false})
		},

		handleDrop: function (event) {
			var model = this.props.model
			var config = this.props.config
			var obj = this.props.object
			var rObj = JSON.parse(
				event.dataTransfer.getData('application/json')
			)

			var relatedKeyId = config.related_key_id
			var localKeyId = config.key_id

			modelActionCreators.moveHasMany(localKeyId, relatedKeyId, obj, rObj)
			event.dataTransfer.dropEffect = 'move'
			this.setState({droppable: false})
		},

		render: function () {
			var model = this.props.model
			var value = this.props.value
			var config = this.props.config || {}
			var style = this.props.style
			var label = config.label
			var parentObj = this.props.object
			var relatedModel = ModelStore.get(config.related_model_id)
			var className = (this.props.className || '') + ' table-cell '
				+ (this.state.selected ? ' selected ' : '');

			return <span
				className = {className}
				style = {style}
				onDragEnter = {this.handleDragEnter}
				onDragLeave = {this.handleDragLeave}
				onDragEnd = {this.handleDragEnd}
				onDragOver = {this.preventDefault}
				onDrop = {this.handleDrop}
				>
				<span className="table-cell-inner">
					{this.state.droppable ?
						<span className = "has-many-bubble placeholder"/> :null}
					{(value || []).map(function(obj) {
						return <HasManyBubble
							key = {obj.cid || obj[relatedModel._pk]}
							obj = {obj}
							parentPk = {parentObj[model._pk]}
							model = {relatedModel}
							label = {label} />
					})}
				</span>
			</span>

		}
	})

}

export default hasManyField


// ============================================================================

var HasManyBubble = React.createClass({

	handleDragStart (event) {
		var obj = this.props.obj
		var model = this.props.model
		obj._model_id = model.model_id
		obj._parentPk = this.props.parentPk

		event.dataTransfer.effectAllowed = 'move'
		event.dataTransfer.setData('application/json', JSON.stringify(obj));
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
