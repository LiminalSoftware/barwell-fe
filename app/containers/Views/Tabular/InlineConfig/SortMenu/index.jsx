import React from "react";
import { Link } from "react-router";
import _ from 'underscore';
import fieldTypes from "../../../fields"

import ViewStore from "../../../../../stores/ViewStore"
import ModelStore from "../../../../../stores/ModelStore"
import AttributeStore from "../../../../../stores/AttributeStore"

import SortDetail from "./SortDetail"

import modelActionCreators from "../../../../../actions/modelActionCreators.jsx"
import util from "../../../../../util/util"
import PureRenderMixin from 'react-addons-pure-render-mixin';
var blurOnClickMixin = require('../../../../../blurOnClickMixin')

var SortMenu = React.createClass({

	mixins: [blurOnClickMixin],

	getInitialState: function () {
		var view = this.props.view
		return {
			open: false,
			editing: false,
			sortList: view.data.sorting
		}
	},

	chooseItem: function (e) {
		var choice = e.target.value
		var sortList = _.clone(this.state.sortList)
		var attr = AttributeStore.get(choice)
		sortList.push(attr)
		this.setState({sortList: sortList})
	},

	render: function() {
		var _this = this
		var view = this.props.view
		var sortList = this.state.sortList
		var sortAttrs = _.pluck(sortList, 'attribute_id')
		var sortPreview
		var attrSelections = []

		if (sortList.length === 1) sortPreview = <SortDetail config = {sortList[0]} view = {view}/>
		else if (sortList.length > 1) sortPreview = <div className="menu-item closed menu-sub-item">Multiple sort levels</div>
		else if (sortList.length === 0) sortPreview = <div className="menu-item closed menu-sub-item empty-item">Default sort order</div>

		AttributeStore.query({model_id: view.model_id}).forEach(function (attr) {
			if (_.contains(sortAttrs, attr.attribute_id)) return;
			var attribute_id = (attr.attribute_id || attr.cid)
			attrSelections.push(
				<option value = {attribute_id} key = {attribute_id}>
						{attr.attribute}
				</option>
				);
		})

    return <div className = "header-section">
			<div className="header-label">Sort Order</div>
			<div className="model-views-menu" onClick = {util.clickTrap}>
				{
				this.state.open ?
				<div className="dropdown-menu">
					{
					this.state.sortList.map(function (sortItem) {
						return <SortDetail config = {sortItem} view = {view} editing = {true}/>
					})
					}
					<div className = "menu-item menu-sub-item">
						<select className = "menu-input selector" onChange = {this.chooseItem}>
							{attrSelections}
						</select>
					</div>
				</div>
				:
				<div className="model-views-menu-inner">
					{sortPreview}
				</div>
				}
				<div className="dropdown small grayed icon icon-chevron-down" onClick = {this.handleOpen}></div>
			</div>

		</div>
	}
});

export default SortMenu;
