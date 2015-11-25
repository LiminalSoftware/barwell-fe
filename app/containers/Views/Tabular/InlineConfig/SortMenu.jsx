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

import SortDetail from "./SortDetail"

import modelActionCreators from "../../../../actions/modelActionCreators.jsx"

var PureRenderMixin = require('react/addons').addons.PureRenderMixin;

var SortMenu = React.createClass({

	mixins: [PureRenderMixin],

	componentWillMount: function () {
		ViewStore.addChangeListener(this._onChange);
	},

	componentWillUnmount: function () {
		ViewStore.removeChangeListener(this._onChange)
	},

	_onChange: function () {
		var view = ViewStore.get(this.props.view.view_id || this.props.view.cid)
		this.setState(view.data)
	},

	getInitialState: function () {
		return {open: false}
	},

	onClick: function () {
		return this.setState({open: !this.state.open})
	},

	render: function() {
		var view = this.props.view
		var data = view.data
		var sortList = data.sorting


    return <div className = "header-section">
			<div className="header-label">Sort Order</div>
			<div className="model-views-menu" onClick = {this.onClick}>
				<div className="model-views-menu-inner">
					{
					sortList.map(function(config) {
						return <SortDetail config = {config} view = {view}/>
					})
					}
				</div>
			</div>
		</div>
	}
});

export default SortMenu;
