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

import modelActionCreators from "../../../../actions/modelActionCreators.jsx"

var PureRenderMixin = require('react/addons').addons.PureRenderMixin;

var FilterMenu = React.createClass({

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

    return <div className = "header-section">
			<div className="header-label">
        Filter
      </div>
			<div className="model-views-menu" onClick = {this.onClick}>
				<div className="model-views-menu-inner">

				</div>
				<div className="dropdown small grayed icon icon-geo-arrw-down" onClick = {this.handleOpen}></div>
			</div>

		</div>
	}
});

export default FilterMenu;
