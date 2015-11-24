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

import ColumnList from '../Config/ColumnList'
import ColumnDetail from '../Config/ColumnDetail'

import modelActionCreators from "../../../../actions/modelActionCreators.jsx"
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;

var ColumnMenu = React.createClass({

	mixins: [PureRenderMixin],

	render: function() {
		var view = this.props.view
		var columns = this.props.columns

    return <div className = "double header-section">
			<div className="header-label">Table Columns</div>
			<div className="model-views-menu" onClick = {this.onClick}>
				<div className="model-views-menu-inner">
					12 Columns
				</div>
			</div>
		</div>
	}
});

export default ColumnMenu;
