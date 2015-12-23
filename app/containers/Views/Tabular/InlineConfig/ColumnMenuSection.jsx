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

var ColumnMenuSection = React.createClass({

	getInitialState: function () {
		return {
			dragItem: null,
			initOffset: null,
			columns: this.props.columns
		}
	},

	componentWillReceiveProps: function (nextProps) {
		this.setState({columns: nextProps.columns})
	},

	handleDragStart: function (event, config) {
		this.setState({
			dragItem: config,
			dragOrder: config.order,
			initOffset: event.pageY
		})
		event.stopPropagation()
		event.preventDefault()
	},

	handleDragEnd: function (event) {
		var view = this.props.view
		this.props._commitChanges(this.state.dragItem)
		this.setState({dragItem: null})
		event.stopPropagation()
		event.preventDefault()
	},

	handleMouseMove: function (e) {
    if (!this.state.dragItem) return
		var view = this.props.view
		var columns = this.state.columns
		var temp
		var item = this.state.dragItem
		var index = _.indexOf(columns, item)
		var dragOffset = e.pageY - this.state.initOffset
		var ROW_HEIGHT = 35

		if (dragOffset < (-1 * ROW_HEIGHT) && index > 0) {
			temp = item.order
			item.order = columns[index - 1].order - 0.5
			this.setState({
				initOffset: e.pageY,
				columns: columns
			})
		} else if (dragOffset > ROW_HEIGHT && index < columns.length - 1) {
			temp = item.order
			item.order = columns[index + 1].order + 0.5
			columns[index] = item
			this.setState({
				initOffset: e.pageY,
				columns: columns
			})
		}
    e.stopPropagation()
    e.preventDefault()
  },

	componentDidUpdate: function (props, state) {
    if (this.state.dragItem && !state.dragItem) {
      document.addEventListener('mouseup', this.handleDragEnd)
			document.addEventListener('mousemove', this.handleMouseMove)
    } else if (!this.state.dragItem && state.dragItem) {
      document.removeEventListener('mouseup', this.handleDragEnd)
			document.removeEventListener('mousemove', this.handleMouseMove)
    }
  },

	render: function() {
		var _this = this
		var view = this.props.view
    var editing = this.props.editing
    var columns = this.state.columns.sort(util.sortByOrder)

    return <div>
			<div className="menu-item menu-sub-item menu-divider">
				<div className="menu-divider-label">
					{this.props.label}
				</div>
      </div>
      {
			(columns.length === 0) ?
			<div className="menu-item menu-sub-item empty-item">
				{this.props.emptyText}
			</div>
			:
      columns.map(function (col, idx) {
        return <ColumnDetail
          _startDrag = {_this.handleDragStart}
					key = {"detail-" + col.column_id}
					config = {col}
          open = {true}
          editing = {editing}
					dragging = {col === _this.state.dragItem}
					view= {view}/>
      })
      }
		</div>
  }
});

export default ColumnMenuSection;
