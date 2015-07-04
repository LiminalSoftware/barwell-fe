import React from "react"
import { RouteHandler } from "react-router"
import styles from "./style.less"
import fieldTypes from "../../fields"

import ViewStore from "../../../../stores/ViewStore"
import ModelStore from "../../../../stores/ModelStore"
import AttributeStore from "../../../../stores/AttributeStore"
import KeyStore from "../../../../stores/KeyStore"
import KeycompStore from "../../../../stores/KeycompStore"
import FocusStore from "../../../../stores/FocusStore"


import modelActionCreators from "../../../../actions/modelActionCreators.jsx"
import _ from 'underscore'


var CubeViewConfig = React.createClass({

	componentWillMount: function () {
		ViewStore.addChangeListener(this._onChange)
		AttributeStore.addChangeListener(this._onChange)
		ModelStore.addChangeListener(this._onChange)
		FocusStore.addChangeListener(this._onChange)
	},

	componentWillUnmount: function () {
		ViewStore.removeChangeListener(this._onChange)
		AttributeStore.removeChangeListener(this._onChange)
		ModelStore.removeChangeListener(this._onChange)
		FocusStore.removeChangeListener(this._onChange)
	},

	_onChange: function () {
		var view = ViewStore.get(this.props.view.view_id || this.props.view.cid)
		this.setState(view.data)
	},

	getInitialState: function () {
		return {};
	},

	render: function() {
		var model = this.props.model
		var view = this.props.view
		var config = view.data

		return <div className = "grouping">

			<div className = "detail-block">
			<h3>Values</h3>
			<table className="detail-table">
				<tbody>
					<tr>
						<td>Aggregator</td>
						<td><select>
							<option>List</option>
							<option>Sum</option>
							<option>Average</option>
							<option>Maximum</option>
							<option>Minimum</option>
						</select></td>
					</tr>
					<tr>
						<td>Value</td>
						<td></td>
					</tr>
				</tbody>
			</table>
			</div>

			<div className = "detail-block">
			<h3>Rows</h3>
				<GroupingSelector
					dimension = 'rowGroups'
					config = {config}
					view = {view}
					model = {model} />
			</div>

			
			<h3>Columns</h3>
				<GroupingSelector
					dimension = 'columnGroups'
					config = {config}
					view = {view}
					model = {model} />
			

		</div>
	}
});

var GroupingSelector = React.createClass({
	render: function () {
		var dimension = this.props.dimension
		var model = this.props.model
		var view = this.props.view
		var config = this.props.config

		return <div className = "detail-block">
		<table className="detail-table">
			
			<tbody>
				{config[dimension].concat([null]).map(function (group, ord) {
					return <GroupingDetail 
						dimension = {dimension}
						config = {config}
						group = {group}
						order = {ord}
						model = {model}
						view = {view} />
				})}
			</tbody>
		</table>
		<div><a className="new-adder new-key" onClick={this.handleAddNewKey}>
			<span className="small reddened icon icon-kub-remove"></span>Clear all
		</a></div>
		</div>
	}
})

var GroupingDetail = React.createClass({

	getInitialState: function () {
		return {editing: false}
	},
	
	handleDelete: function () {
		var view = this.props.view
		var dimension = this.props.dimension
		var config = this.props.config
		var group = this.props.group || {}

		var groupings = (config[dimension] || [])
		groupings = groupings.filter(function (existing) {
			if (!existing) return false;
			return existing.attribute_id !== group.attribute_id
		})
		config[dimension] = groupings
		view.data = config
		modelActionCreators.createView(view, true, false)
	},

	handleAddGrouping: function (event) {
		var view = this.props.view
		var value = parseInt(event.target.value)
		var dimension = this.props.dimension
		var config = this.props.config
		var order = this.props.order
		var attr = AttributeStore.get(value)

		var groupings = (config[dimension] || [])
		groupings.push({
			attribute_id: value,
			attribute: attr.attribute,
			order: order
		})
		config[dimension] = groupings
		view.data = config

		modelActionCreators.createView(view, true, false)
	},
	
	render: function () {
		var model = this.props.model
		var view = this.props.view
		var dimension = this.props.dimension
		var config = this.props.config
		var group = this.props.group || {}
		var order = this.props.order
		var key = 'attr-' + (group.attribute_id || 'new')

		var existingGroups = _.pluck(config.rowGroups, 'attribute_id').concat(
			_.pluck(config.columnGroups, 'attribute_id'))

		var options = AttributeStore.query({model_id: model.model_id}).map(function (attr) {
			if (_.contains(existingGroups, attr.attribute_id) && attr.attribute_id !== group.attribute_id)
				return null
			return <option value = {attr.attribute_id} key={'choice-'+attr.attribute_id}> 
				{attr.attribute}
			</option>
		}).filter(_.identity);

		return <tr key={key + '-row'}>
			<td>
				<span className="num-circle">{order + 1}</span>
			</td>
			<td>
				{group.attribute_id ? 
				group.attribute
				:
				<select value = {group.attribute_id || 0} onChange={this.handleAddGrouping}>
					<option value={0} disabled> 
						-----
					</option>
					{options}
				</select>
				}
			</td>
			<td className="centered">
				{!!group.attribute_id ? 
				<span 
					onClick = {this.handleDelete}
					className = "small showonhover grayed clickable icon icon-kub-remove">
				</span>
				:
				null
				}
			</td>
		</tr>
	}
});

export default CubeViewConfig;