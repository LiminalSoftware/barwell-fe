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

import ColumnDetail from "./ColumnDetail"

import modelActionCreators from "../../../../actions/modelActionCreators.jsx"

var PureRenderMixin = require('react/addons').addons.PureRenderMixin;

var ColumnMenu = React.createClass({

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
		var columns = (_.filter(view.data.columnList, 'visible') || [])
		var col = columns[data.pointer.left]

    return <div className = "double header-section">
			<div className="header-label">Table Columns</div>
			<div className="model-views-menu" onClick = {this.onClick}>
				<div className="model-views-menu-inner">
				<ColumnDetail key = {"detail-" + (col.attribute_id || col.relationship_id)}
					config = {col} view= {view}	 />
				</div>
				<div className="dropdown icon icon-"></div>
			</div>
		</div>
	}
});

// {
// 	columns.map(function (col) {
// 		return <ColumnDetail
// 			key = {"detail-" + (col.attribute_id || col.relationship_id)}
// 			config = {col} view= {view}	 />
// 	})
// }

export default ColumnMenu;
