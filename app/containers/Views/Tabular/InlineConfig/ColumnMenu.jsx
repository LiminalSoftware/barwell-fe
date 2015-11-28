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
import constant from '../../../../constants/MetasheetConstants'

import modelActionCreators from "../../../../actions/modelActionCreators.jsx"

var PureRenderMixin = require('react/addons').addons.PureRenderMixin;
var blurOnClickMixin = require('../../../../blurOnClickMixin')

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

	handleBlur: function () {
		console.log('blurrrrrr')
		this.setState({open: false})
		document.removeEventListener('keyup', this.handleKeyPress)
    document.removeEventListener('click', this.handleBlur)
	},

	handleOpen: function () {
		this.setState({open: true})
		document.addEventListener('keyup', this.handleKeyPress)
    document.addEventListener('click', this.handleBlur)
	},

	handleKeyPress: function (event) {
    if (event.keyCode === constant.keycodes.ESC) this.handleBlur()
  },

	render: function() {
		var _this = this
		var view = this.props.view
		var data = view.data
		var columns = view.data.columnList
		var column
		if (!this.state.open) {
			columns = columns.filter(col => col.visible)
			column = columns[data.pointer.left]
			if (column) columns = [column]
			else columns = []
		}
		var hiddenAttr = columns.filter(col => !col.visible)
		var visibleAttr = columns.filter(col => col.visible)
		var makeAttrDivs = function (columns) {
			return columns.map(function (col) {
				return <ColumnDetail
					key = {"detail-" + (col.attribute_id || col.relationship_id)}
					config = {col} view= {view}
					open = {_this.state.open}/>
			})
		}

    return <div className = "double header-section">
			<div className="header-label">Table Columns</div>
			<div className="model-views-menu" >
				<div className="model-views-menu-inner">
				{
					this.state.open ?
					<div className = "dropdown-menu">
						<div className="menu-item menu-sub-item menu-divider">
							<div className="menu-divider-label">Hidden Atributes</div>
						</div>
						{makeAttrDivs(hiddenAttr)}
						<div className="menu-item menu-sub-item menu-divider">
							<div className="menu-divider-label">Visible Atributes</div>
						</div>
						{makeAttrDivs(visibleAttr)}
						<div className="menu-item menu-sub-item column-item">Add new attribute</div>
					</div>
					:
					makeAttrDivs(columns)
				}
				<div className="dropdown small grayed icon icon-geo-arrw-down" onClick = {this.handleOpen}></div>
				</div>
			</div>
		</div>
	}
});

export default ColumnMenu;
