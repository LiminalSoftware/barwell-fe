import React from "react";
import _ from 'underscore';
import fieldTypes from "../../fields"

import ViewStore from "../../../../stores/ViewStore"
import ModelStore from "../../../../stores/ModelStore"
import AttributeStore from "../../../../stores/AttributeStore"
import KeyStore from "../../../../stores/KeyStore"
import KeycompStore from "../../../../stores/KeycompStore"

import modelActionCreators from "../../../../actions/modelActionCreators.jsx"

var PureRenderMixin = require('react/addons').addons.PureRenderMixin;

var ColumnDetail = React.createClass({

	mixins: [PureRenderMixin],

	getInitialState: function () {
		return {editing: false}
	},

	commitChanges: function (colProps) {
		var view = this.props.view
		var column_id = this.props.config.column_id
		var col = view.data.columns[column_id]
		col = _.extend(col, colProps)
		view.data.columns[column_id] = col;

		modelActionCreators.createView(view, true, false)
	},

	updateWidth: function (e) {
		var width = e.target.value
		this.setState({tempWidth: width})
	},

	toggleDetails: function (event) {
		this.commitChanges({expanded: (!this.props.config.expanded)})
	},

	toggleVisibility: function (event) {
		var config = this.props.config
		this.commitChanges({visible: !config.visible})
	},

	toggleRightAlign: function (event) {
		var config = this.props.config
		this.commitChanges({align: 'right'})
	},

	toggleCenterAlign: function (event) {
		var config = this.props.config
		this.commitChanges({align: 'center'})
	},

	toggleLeftAlign: function (event) {
		var config = this.props.config
		this.commitChanges({align: 'left'})
	},

	handleDragStart (event) {
		var config = this.props.config
		event.dataTransfer.effectAllowed = 'move'
		event.dataTransfer.setData('application/json', JSON.stringify(config));
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
		var view = this.props.view
		var config = this.props.config
		var name = config.name
		var nameField = (this.state.editing ? <input type="textbox" value={name} /> : name)
		var key = "attr-" + config.column_id
		var detailsStyle = {}
		var fieldType = fieldTypes[config.type]
		var addlRows


		if (!config.expanded) detailsStyle.display = "none"
		if (!!fieldType && fieldType.configRows)
			addlRows = React.createElement(fieldType.configRows, {
				view: this.props.view,
				config: this.props.config,
				style: detailsStyle
			})
		else addlRows = null

		return <div>
			<div className="detail-row always-editable" key={key + '-row'}>
				<span className="draggable" key="drag-cell">
					<span className="tighter icon icon-Layer_2 model-reorder"></span>
				</span>
				<span className="width-30">
					{config.name}
				</span>
				<span className="width-10">
					<span className={"clickable icon icon-eye-" + (config.visible ? "3 ":"4 grayed")}
						onClick={this.toggleVisibility}></span>
				</span>
				<span className="width-10">
				</span>
				<span className="width-10">
				</span>
				<span className="width-30">
					<span className={"clickable icon icon-align-left "
						+ (config.align === 'left' ? '' : 'grayed')}
						onClick={this.toggleLeftAlign}>
					</span>
					<span className={"clickable icon icon-align-center "
						+ (config.align === 'center' ? '' : 'grayed')}
						onClick={this.toggleCenterAlign}>
					</span>
					<span className={"clickable icon icon-align-right "
						+ (config.align === 'right' ? '' : ' grayed')}
						onClick={this.toggleRightAlign}>
					</span>
				</span>
			</div>

		</div>
	}
});
export default ColumnDetail
