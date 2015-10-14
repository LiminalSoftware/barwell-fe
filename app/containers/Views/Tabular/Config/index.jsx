import React from "react";
import { Link } from "react-router";
import styles from "./style.less";
import _ from 'underscore';
import fieldTypes from "../../fields"

import ViewStore from "../../../../stores/ViewStore"
import ModelStore from "../../../../stores/ModelStore"
import AttributeStore from "../../../../stores/AttributeStore"
import KeyStore from "../../../../stores/KeyStore"
import KeycompStore from "../../../../stores/KeycompStore"

import ColumnList from './ColumnList'
import ColumnDetail from './ColumnDetail'
import modelActionCreators from "../../../../actions/modelActionCreators.jsx"
import groomView from '../../groomView'

var PureRenderMixin = require('react/addons').addons.PureRenderMixin;
var sortable = require('react-sortable-mixin');

var TabularViewConfig = React.createClass({

	mixins: [PureRenderMixin, sortable.ListMixin],

	componentWillMount: function () {
		ViewStore.addChangeListener(this._onChange);
		ModelStore.addChangeListener(this._onChange)
		AttributeStore.addChangeListener(this._onChange)
		KeyStore.addChangeListener(this._onChange)
	},

	componentWillUnmount: function () {
		var view = this.props.view
		ViewStore.removeChangeListener(this._onChange)
		ModelStore.removeChangeListener(this._onChange)
		AttributeStore.removeChangeListener(this._onChange)
		KeyStore.removeChangeListener(this._onChange)
	},

	_onChange: function () {
		var view = ViewStore.get(this.props.view.view_id || this.props.view.cid)
		this.setState(view.data)
	},

	getInitialState: function () {
		var view = this.props.view
		return view.data
	},

	focus: function () {
		modelActionCreators.setFocus('view-config')
	},

	render: function() {
		var _this = this
		var view = this.props.view
		var data = this.state
		var columns = data.columns

		var colList = (data.columnList || []).map(function (col) {
			return <ColumnDetail key = {"detail-" + col.attribute_id} config = {col} view= {view} />
		})
		var sortList = (data.sorting || []).map(function (sort) {
			var sortOrderClass = "small grayed icon icon-arrow-" + (sort.descending ? "up" : "down")
			var sortOrderLabel = sort.descending ? "Ascending" : "Descending"
			var attribute = AttributeStore.get(sort.attribute_id);

			return <div className="detail-row">
				<span className="width-40">{(attribute || {}).attribute}</span>
				<span className="width-40">
					{sortOrderLabel}
					<span className = {sortOrderClass}></span>
				</span>
				<span className="width-20 grayed">
					<span className = "small clickable icon icon-kub-remove"></span>
				</span>
			</div>
		})
		if (sortList.length === 0) {
			sortList = <div className="detail-row">
				<span className="grayed centered" colSpan="3">No sort order defined</span>
			</div>;
		}

		return <div className = "grouping" onClick={this.focus}>
			<div className = "detail-block">
				<div className="detail-section-header">
					<h3>Columns</h3>
				</div>
				<div className="detail-table">
					{colList}
				</div>
			</div>
			<div className = "detail-block">
				<div className="detail-section-header">
					<h3>Sorting</h3>
				</div>
				<div key="sort-table" className="detail-table">
					<div className="detail-header" key="sort-header-row">
						<span className="width-40">
							Column
						</span>
						<span className="width-40">
							Sort Order
						</span>
						<span className="width-20">
						</span>
					</div>
					{sortList}
				</div>
				<div className = "detail-block">
				</div>
			</div>
		</div>
	}
});

export default TabularViewConfig;
