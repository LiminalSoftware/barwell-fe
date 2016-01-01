import React from "react";
import { Link } from "react-router";
import _ from 'underscore';
import fieldTypes from "../../../fields"

import ViewStore from "../../../../../stores/ViewStore"
import ModelStore from "../../../../../stores/ModelStore"
import AttributeStore from "../../../../../stores/AttributeStore"

import SortDetail from "./SortDetail"

import modelActionCreators from "../../../../../actions/modelActionCreators.jsx"

import PureRenderMixin from 'react-addons-pure-render-mixin';
var blurOnClickMixin = require('../../../../../blurOnClickMixin')

var SortMenu = React.createClass({

	mixins: [blurOnClickMixin],

	_onChange: function () {
		var view = ViewStore.get(this.props.view.view_id || this.props.view.cid)
		this.setState(view.data)
	},

	getInitialState: function () {
		return {open: false}
	},

	render: function() {
		var view = this.props.view
		var data = view.data
		var sortList = data.sorting
		var sortPreview

		if (sortList.length === 1) sortPreview = <SortDetail config = {sortList[0]} view = {view}/>
		else if (sortList.length > 1) sortPreview = <div className="menu-item closed menu-sub-item">Multiple sort levels</div>
		else if (sortList.length === 0) sortPreview = <div className="menu-item closed menu-sub-item empty-item">Default sort order</div>

    return <div className = "header-section">
			<div className="header-label">Sort Order</div>
			<div className="model-views-menu" onClick = {this.onClick}>
				{
				this.state.open ?
				<div className="dropdown-menu">
					<div className = "menu-item menu-sub-item">
						
					</div>
					<div className = "menu-item menu-sub-item">
						Select
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
