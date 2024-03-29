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

import constants from '../../../../constants/MetasheetConstants'

import modelActionCreators from "../../../../actions/modelActionCreators.jsx"
import _ from 'underscore'

import PureRenderMixin from 'react-addons-pure-render-mixin';

var CubeViewConfig = React.createClass({

	mixins: [PureRenderMixin],

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
		return {

		};
	},

	getOptions: function () {
		var model = this.props.model
		var view = this.props.view
		var group = this.props.group || {}
		var existingGroups = view.row_aggregates.concat(view.column_aggregates)

		return AttributeStore.query({model_id: model.model_id}).map(function (attr) {
			if (_.contains(existingGroups, attr.attribute_id) && attr.attribute_id !== group)
				return null
			return <option value = {attr.attribute_id} key={'choice-' + attr.attribute_id}>
				{attr.attribute}
			</option>
		}).filter(_.identity);
	},

	handleSelectAggregator: function (event) {
		var view = this.props.view
		view.aggregator = event.target.value
		modelActionCreators.createView(view, true, false)
	},

	handleSelectValue: function (event) {
		var view = this.props.view
		view.value = event.target.value
		modelActionCreators.createView(view, true, false)
	},

	render: function() {
		var model = this.props.model
		var view = this.props.view
		var uniqSet = false

		return <div className = "grouping">
			<div className = "detail-block">
			<h3>Grouping</h3>
			<table className="detail-table">
				<tbody>
				<tr className="top-line">
					<td style={{width: "10%"}}></td>
					<td className="width-60 top-line">Row Groupings</td>
					<td style={{width: "20%"}}>Order</td>
					<td style={{width: "10%"}}></td>
				</tr>
				</tbody>
				<GroupingSelector
					dimension = 'row_aggregates'
					getOptions = {this.getOptions}
					view = {view}
					model = {model} />
				<tbody>
				<tr className="top-line">
					<td style={{width: "10%"}}></td>
					<td className="width-60 top-line">Column Groupings</td>
					<td style={{width: "20%"}}>Order</td>
					<td style={{width: "10%"}}></td>
				</tr>
				</tbody>
				<GroupingSelector
					dimension = 'column_aggregates'
					getOptions = {this.getOptions}
					view = {view}
					model = {model} />
			</table>
			<div><a className="new-adder new-key">
			<span className="small grayed icon icon-kub-remove"></span>Clear all
			</a></div>
			</div>

			<div className = "detail-block">
			<h3>Values</h3>
			<table className="detail-table">
				<thead>
					<tr className="top-line">
						<th style={{width: "10%"}}></th>
						<th style={{width: "65%"}}>Value</th>
						<th style={{width: "25%"}}>Aggregator</th>

					</tr>
				</thead>
				<tbody>
					<tr>
						<td style={{width: "10%"}}><span className="icon grayed icon-Layer_6"></span></td>
						<td>
							<select value={view.value} onChange={this.handleSelectValue}>
								{this.getOptions()}
							</select>
						</td>
						<td style={{width: "75%"}}><select value = {view.aggregator} onChange={this.handleSelectAggregator}>
							{_.map(constants.aggregators, function (label, key) {
								return <option value = {key} key = {key}>
									{label}
								</option>
							})}
						</select></td>
					</tr>
				</tbody>
			</table>
			</div>

		</div>
	}
});

var GroupingSelector = React.createClass({
	render: function () {
		var _this = this
		var dimension = this.props.dimension
		var view = this.props.view

		return <tbody>
			{(view[dimension] || []).concat([null]).map(function (group, ord) {
				var key = 'attr-' + (group || 'new');
				return <GroupingDetail
					{... _this.props}
					group = {group}
					order = {ord}
					key = {key + '-row'}
					index = {group}
					/>
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
		var group = this.props.group || {}

		var groupings = (view[dimension] || [])
		groupings = groupings.filter(function (existing) {
			return existing !== group
		})

		view[dimension] = groupings
		modelActionCreators.createView(view, true, false)
	},

	handleAddGrouping: function (event) {
		var view = this.props.view
		var value = parseInt(event.target.value)
		var dimension = this.props.dimension
		var order = this.props.order
		var attr = AttributeStore.get(value)

		var groupings = (view[dimension] || [])
		groupings.push(value)
		view[dimension] = groupings
		view.data.sorting[value] = {}

		modelActionCreators.createView(view, true, false)
	},

	commit: function () {

	},

	handleFlipSort: function (event) {
		var view = this.props.view
		var group = this.props.group || null
		var sorting = view.data.sorting [group]
		console.log('sorting: ' + sorting)
		view.data.sorting [group] = !sorting

		modelActionCreators.createView(view, true, false)
	},

	render: function () {
		var view = this.props.view
		var model = this.props.model
		var group = this.props.group || null
		var order = this.props.order
		var attr = AttributeStore.get(group) || {}
		var sorting = !!view.data.sorting [group]
		var dimension = this.props.dimension

		return <tr>
			<td style={{width: "10%"}}>
				<span className={"grayed icon " + (dimension === 'column_aggregates' ? "icon-Layer_1" : "icon-Layer_8")}></span>
			</td>
			<td style={{width: "60%"}}>
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
			<td className="centered width-20">
				{group ? <span
					onClick = {this.handleFlipSort}
					className={"small clickable grayed icon icon-arrow-" + (sorting ? 'down' : 'up')}>
				</span> : null}
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
