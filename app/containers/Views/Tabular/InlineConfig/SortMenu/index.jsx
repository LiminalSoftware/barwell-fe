import React from "react";
import { Link } from "react-router";
import _ from 'underscore';
import fieldTypes from "../../../fields"

import ViewStore from "../../../../../stores/ViewStore"
import ModelStore from "../../../../../stores/ModelStore"
import AttributeStore from "../../../../../stores/AttributeStore"

import SortDetail from "./SortDetail"

import modelActionCreators from "../../../../../actions/modelActionCreators.jsx"

var PureRenderMixin = require('react/addons').addons.PureRenderMixin;

var SortMenu = React.createClass({

	mixins: [PureRenderMixin],

	_onChange: function () {
		var view = ViewStore.get(this.props.view.view_id || this.props.view.cid)
		this.setState(view.data)
	},

	getInitialState: function () {
		return {open: false}
	},

	handleOpen: function () {
		return this.setState({open: true})
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
				<div className="model-views-menu-inner">
					{sortPreview}
				</div>
				<div className="dropdown small grayed icon icon-geo-arrw-down" onClick = {this.handleOpen}></div>
			</div>

		</div>
	}
});

export default SortMenu;
