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

	itemHeight: 32,

	mixins: [blurOnClickMixin],

	_onChange: function () {
		this.forceUpdate()
	},

	getInitialState: function () {
		var view = this.props.view
		var columns = view.data.columnList

		return {
			open: false,
			dragItem: null,
			dragOffset: null,
			initOffset: null,
			hiddenCols: columns.filter(col => !col.visible).sort(util.numSort),
			visibleCols: columns.filter(col => col.visible).sort(util.numSort)
		}
	},

	componentWillReceiveProps: function (nextProps) {
		var view = this.props.view
		var columns = view.data.columnList

		this.setState({
			hiddenCols: columns.filter(col => !col.visible).sort(util.numSort),
			visibleCols: columns.filter(col => col.visible).sort(util.numSort)
		})
	},

	componentDidUpdate: function (props, state) {
    if (this.state.dragItem && !state.dragItem) {
      document.addEventListener('mousemove', this.onMouseMove)
      document.addEventListener('mouseup', this.onMouseUp)
    } else if (!this.state.dragItem && state.dragItem) {
      document.removeEventListener('mousemove', this.onMouseMove)
      document.removeEventListener('mouseup', this.onMouseUp)
    }
  },

	onMouseMove: function (e) {
    if (!this.state.dragItem) return
		var view = this.props.view
		var item = this.state.dragItem
		var dragOffset = e.pageY - this.state.initOffset
		console.log('dragOffset: ' + dragOffset)
		item.order = this.state.dragOrder + dragOffset / this.itemHeight
		console.log('order: ' + item.order)
		this.setState({
			visibleCols: util.enumerate(this.state.visibleCols),
			hiddenCols: util.enumerate(this.state.hiddenCols)
		})
    e.stopPropagation()
    e.preventDefault()
  },

	onMouseDown: function (event, config) {
		this.setState({
			dragItem: config,
			dragOrder: config.order,
			initOffset: event.pageY
		})
	},

	onMouseUp: function (event) {
		var view = this.props.view
		var columns = this.state.hiddenCols.concat(this.state.visibleCols)
		view.data.columns = _.indexBy(columns, 'column_id')
		modelActionCreators.createView(view, true, true);
		this.setState({dragItem: null})
    event.stopPropagation()
    event.preventDefault()
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

		var makeAttrDivs = function (columns) {
			return columns.map(function (col, idx) {
				return <ColumnDetail
					key = {"detail-" + col.column_id}
					_onDrag = {_this.onMouseDown}
					_onOpen = {_this.handleOpen}
					dragOffset = {col === _this.state.dragItem ? _this.state.dragOffset : 0}
					config = {col} view= {view}
					open = {_this.state.open}/>
			})
		}

    return <div className = "double header-section" >
			<div className="header-label">Table Columns</div>
			<div className="model-views-menu">
				{
					this.state.open ?
					<div className="model-views-menu-inner" onClick={this.clickTrap}>
					<div className = "dropdown-menu">
						<div className="menu-item menu-sub-item menu-divider">
							<div className="menu-divider-label">Hidden Attributes</div>
						</div>
						{makeAttrDivs(this.state.hiddenCols)}
						<div className="menu-item menu-sub-item menu-divider">
							<div className="menu-divider-label">Visible Attributes</div>
						</div>
						{makeAttrDivs(this.state.visibleCols)}
						<div className="menu-item column-item">
							<div className="menu-sub-item">Add new attribute</div>
							<div className="menu-sub-item">Edit attributes</div>
						</div>
					</div>
					</div>
					:
					<div className="model-views-menu-inner" onClick={this.clickTrap}>
					{makeAttrDivs(columns)}
					</div>
				}
				<div className="dropdown small grayed icon icon-geo-arrw-down" onClick = {this.handleOpen}></div>
			</div>
		</div>
	}
});

export default ColumnMenu;
