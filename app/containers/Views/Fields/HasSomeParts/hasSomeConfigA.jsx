import React from "react"
import _ from "underscore"

import AttributeStore from "../../../../stores/AttributeStore"
import ModelStore from "../../../../stores/ModelStore"

import modelActionCreators from "../../../../actions/modelActionCreators"

var hasSomeConfigA = React.createClass({

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
})

export default hasSomeConfigA