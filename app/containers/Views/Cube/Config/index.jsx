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

	getOptions: function () {
		var model = this.props.model
		var view = this.props.view
		var config = view.data
		var group = this.props.group || {}
		var existingGroups = config.rowGroups.concat(config.columnGroups)

		return AttributeStore.query({model_id: model.model_id}).map(function (attr) {
			if (_.contains(existingGroups, attr.attribute_id) && attr.attribute_id !== group)
				return null
			return <option value = {attr.attribute_id} key={'choice-'+attr.attribute_id}> 
				{attr.attribute}
			</option>
		}).filter(_.identity);
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
					<tr className="top-line">
						<td className="width-30">Aggregator:</td>
						<td className="width-70"><select>
							<option>List</option>
							<option>Sum</option>
							<option>Average</option>
							<option>Maximum</option>
							<option>Minimum</option>
						</select></td>
					</tr>
					<tr>
						<td>Value:</td>
						<td>
							<select value={config.valueAttribute}>
								{this.getOptions()}
							</select>
						</td>
					</tr>
				</tbody>
			</table>
			</div>

			<div className = "detail-block">
			<h3>Grouping</h3>
			<table className="detail-table">
				<tbody>
				<tr className="top-line"><td colSpan={3} className="top-line">Row Groupings</td></tr>
				</tbody>
			</table>
			<table className="detail-table">
				<GroupingSelector
					dimension = 'rowGroups'
					config = {config}
					getOptions = {this.getOptions}
					view = {view}
					model = {model} />
				<tr><td colSpan={3}>Column Groupings</td></tr>
				<GroupingSelector
					dimension = 'columnGroups'
					config = {config}
					getOptions = {this.getOptions}
					view = {view}
					model = {model} />
			</table>
			<div><a className="new-adder new-key">
			<span className="small grayed icon icon-kub-remove"></span>Clear all
			</a></div>
			</div>

			
			

		</div>
	}
});

var GroupingSelector = React.createClass({
	render: function () {
		var _this = this
		var dimension = this.props.dimension
		var model = this.props.model
		var config = this.props.config

		return <tbody>
				{config[dimension].concat([null]).map(function (group, ord) {
					return <GroupingDetail 
						{... _this.props} 
						group = {group}
						order = {ord}/>
				})}
				</tbody>
			
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
			return existing !== group
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
		groupings.push(value)
		config[dimension] = groupings
		view.data = config

		modelActionCreators.createView(view, true, false)
	},

	commit: function () {

	},
	
	render: function () {
		var model = this.props.model
		var config = this.props.config
		var group = this.props.group || null
		var order = this.props.order
		var key = 'attr-' + (group || 'new')
		console.log('group: '+ JSON.stringify(group, null, 2));
		var attr = AttributeStore.get(group) || {}

		return <tr key={key + '-row'} >
			<td className="width-10">
				<span className="num-circle">{order + 1}</span>
			</td>
			<td className="width-80">
				{group ? 
				attr.attribute
				:
				<select value = {attr.attribute_id || 0} onChange={this.handleAddGrouping}>
					<option value={0} disabled> 
						-----
					</option>
					{this.props.getOptions()}
				</select>
				}
			</td>
			<td className="centered width-10">
				{!!attr.attribute_id ? 
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