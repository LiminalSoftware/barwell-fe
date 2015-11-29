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
import util from "../../../../util/util"

import modelActionCreators from "../../../../actions/modelActionCreators.jsx"

var PureRenderMixin = require('react/addons').addons.PureRenderMixin;
var blurOnClickMixin = require('../../../../blurOnClickMixin')

var ColumnMenu = React.createClass({

	itemHeight: 30,

	mixins: [PureRenderMixin],

	componentWillMount: function () {
		ViewStore.addChangeListener(this._onChange);
	},

	componentWillUnmount: function () {
		ViewStore.removeChangeListener(this._onChange)
	},

	_onChange: function () {
		this.forceUpdate()
	},

	onMouseMove: function (e) {
    if (!this.state.dragItem) return
		var item = this.state.dragItem
		var order =  this.state.dragItemOrder
		var hiddenCols = this.state.hiddenCols
		var visibleCols = this.state.visibleCols
		var dragOffset = e.pageY - this.state.dragInitOffset
		var delta = Math.floor(Math.abs(dragOffset) / this.itemHeight)
			* Math.sign(dragOffset)

		if (Math.abs(delta) < 0) this.setState({
      dragOffset: dragOffset
    })



    e.stopPropagation()
    e.preventDefault()
  },

	getInitialState: function () {
		var view = this.props.view
		var columns = view.data.columnList
		var hiddenCols = columns.filter(col => !col.visible)
		var visibleCols = columns.filter(col => col.visible)

		return {
			open: false,
			hiddenCols: hiddenCols,
			numHidden: hiddenCols.length,
			visibleCols: visibleCols,
			dragItem: null,
			dragItemOrder: null,
			dragOffset: null,
			dragInitOffset: null
		}
	},

	handleBlur: function () {
		this.setState({
			open: false,
			editing: false
		})
		document.removeEventListener('keyup', this.handleKeyPress)
    document.removeEventListener('click', this.handleClick)
	},

	handleOpen: function () {
		this.setState({open: true})
		document.addEventListener('keyup', this.handleKeyPress)
    document.addEventListener('click', this.handleClick)
	},

	handleClick: function (event) {
		if (!event.__cancelBubble) this.handleBlur()
	},

	handleKeyPress: function (event) {
    if (event.keyCode === constant.keycodes.ESC) this.handleBlur()
  },

	clickTrap: function (event) {
		event.stopPropagation()
		event.preventDefault()
		event.nativeEvent.stopImmediatePropagation();
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
		var hiddenCols = this.state.hiddenCols
		var visibleCols = this.state.visibleCols

		var makeAttrDivs = function (columns) {
			return columns.map(function (col, idx) {
				return <ColumnDetail
					key = {"detail-" + col.column_id}
					config = {col} view= {view}
					open = {_this.state.open}
					index = {idx}/>
			})
		}

    return <div className = "double header-section" >
			<div className="header-label">Table Columns</div>
			<div className="model-views-menu">
				<div className="model-views-menu-inner" onClick={this.clickTrap}>
				{
					this.state.open ?
					<div className = "dropdown-menu">
						<div className="menu-item menu-sub-item menu-divider">
							<div className="menu-divider-label">Hidden Attributes</div>
						</div>
						{makeAttrDivs(hiddenCols)}
						<div className="menu-item menu-sub-item menu-divider">
							<div className="menu-divider-label">Visible Attributes</div>
						</div>
						{makeAttrDivs(visibleCols)}
						<div className="menu-item column-item">
							<div className="menu-sub-item">Add new attribute</div>
							<div className="menu-sub-item">Edit attributes</div>
						</div>
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
