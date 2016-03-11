import React from "react";
import { Link } from "react-router";
import styles from "./style.less";
import _ from 'underscore';
import fieldTypes from "../../../fields"

import ColumnDetail from "./ColumnDetail"
import constant from '../../../../../constants/MetasheetConstants'
import util from "../../../../../util/util"

import modelActionCreators from "../../../../../actions/modelActionCreators.jsx"
import PureRenderMixin from 'react-addons-pure-render-mixin';
var blurOnClickMixin = require('../../../../../blurOnClickMixin')

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

	handleDragStart: function (e, item) {
		this.setState({
			dragItem: item,
			initOffset: e.pageY
		})
		e.stopPropagation()
		e.preventDefault()
	},

	handleDragEnd: function (e) {
		var view = this.props.view
		this.props._commitChanges(this.state.dragItem)
		this.setState({dragItem: null})
		e.stopPropagation()
		e.preventDefault()
	},

	dragInto: function (e, item, direction) {
		var columns = this.state.columns
		if(columns && columns.length > 0) 
			item.order = (direction === 'up') ? 
			_.last(columns).order + 0.5 : 
			_.first(columns).order - 0.5
		else item.order -= 0.5

		columns.push(item)

		this.setState({
			dragItem: item,
			initOffset: e.pageY,
			columns: columns
		})
		e.stopPropagation()
		e.preventDefault()
	},

	handleMouseMove: function (e) {
		var view = this.props.view
		var columns = this.state.columns
		var temp
		var item = this.state.dragItem
		var index = _.indexOf(columns, item)
		var dragOffset = e.pageY - this.state.initOffset
		var ROW_HEIGHT = 35

		if (!this.state.dragItem) return
		if (dragOffset < (-1 * ROW_HEIGHT) && index > 0) {
			temp = item.order
			item.order = columns[index - 1].order - 0.5
			this.setState({
				initOffset: e.pageY,
				columns: columns
			})
		} else if (dragOffset < (-2 * ROW_HEIGHT) && index === 0) {
			if (this.props._moveToSection(e, item, this.props.index - 1, "up")) {
				this.setState({
					dragItem: null,
					columns: _.without(columns, item)
				})
			}
		} else if (dragOffset > ROW_HEIGHT && index < columns.length - 1) {
			temp = item.order
			item.order = columns[index + 1].order + 0.5
			columns[index] = item
			this.setState({
				initOffset: e.pageY,
				columns: columns
			})
		} else if (dragOffset > (2 * ROW_HEIGHT) && index === (columns.length - 1)) {
			if (this.props._moveToSection(e, item, this.props.index + 1, "down")) {
				this.setState({
					dragItem: null,
					columns: _.without(columns, item)
				})
			}
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
			<div className="column-config menu-divider-label">
			{this.props.label}
			</div>
			</div>
			{
				(columns.length === 0) ?
				// if there's no content then show the emptyText message
				<div className="menu-item menu-sub-item padded empty-item">
					{this.props.emptyText}
				</div>
				:
				// otherwise iterate through all the content items
				columns.map(function (col, idx) {
					return <ColumnDetail
					_startDrag = {_this.handleDragStart}
					key = {"detail-" + col.column_id}
					config = {col}
					open = {true}
					editing = {editing}
					viewConfigParts = {_this.props.viewConfigParts}
					dragging = {col === _this.state.dragItem}
					view= {view}/>
				})
			}
		</div>
	}
});

export default ColumnMenuSection;
