import React from "react";
import { Link } from "react-router";
import styles from "./style.less";
import _ from 'underscore';
import fieldTypes from "../../../fields"

import ColumnDetail from "./ColumnDetail"
import ColumnMenuSection from "./ColumnMenuSection"
import constant from '../../../../../constants/MetasheetConstants'
import util from "../../../../../util/util"

import modelActionCreators from "../../../../../actions/modelActionCreators.jsx"

import PureRenderMixin from 'react-addons-pure-render-mixin';
var blurOnClickMixin = require('../../../../../blurOnClickMixin')

var ColumnMenu = React.createClass({

	itemHeight: 35,

	mixins: [blurOnClickMixin],

	_onChange: function () {
		this.forceUpdate()
	},

	getInitialState: function () {
		var view = this.props.view
		var columns = view.data.columnList
		return {
			open: false,
			editing: false,
			columns: view.data.columnList
		}
	},

	componentWillReceiveProps: function (nextProps) {
		this.setState({columns: nextProps.view.data.columnList})
	},

	commitChanges: function (column) {
		var view = this.props.view
		var columns = this.state.columns
		view.data.columns = _.indexBy(columns, 'column_id')
		view.data.columns[column.column_id] = column

		modelActionCreators.createView(view, true, true);
		this.setState({dragItem: null})
	},

	handleEdit: function () {
		this.setState({editing: true})
	},

	handleDoneEdit: function () {
		this.setState({editing: false})
	},

	getCurrentCol: function () {
		var view = this.props.view
		var data = view.data
		var columns = view.data.columnList
		columns = columns.filter(col => col.visible)
		return columns[data.pointer.left]
	},

	sections : [
		{
			label: "Hidden Attributes",
			emptyText: "No hidden attributes...",
			icon: "icon-eye-4",
			selector: function (columns) {
				return columns.filter(c => !c.visible).sort(util.orderSort)
			},
			enterTransform: function (col) {
				col.visible = false
				col.fixed = false
				return col
			}
		},
		{
			label: "Fixed Attributes",
			emptyText: "No fixed attributes...",
			icon: "icon-Layer_1",
			selector: function (columns) {
				return columns.filter(c => c.visible && c.fixed).sort(util.orderSort)
			},
			enterTransform: function (col) {
				col.visible = true
				col.fixed = true
				return col
			}
		},
		{
			label: "Visible Attributes",
			emptyText: "No visible attributes...",
			icon: "icon-Layer_1",
			selector: function (columns) {
				return columns.filter(c => c.visible && !c.fixed).sort(util.orderSort)
			},
			enterTransform: function (col) {
				col.visible = true
				col.fixed = false
				return col
			}
		}
	],

	moveToSection: function (e, item, sectionIdx, direction) {
		var section = this.sections[sectionIdx]
		var el = this.refs["section-" + (sectionIdx)]
		if (!el) return false

		item = section.enterTransform(item)
		el.dragInto(e, item, direction)
		return true
	},

	renderButtonBar: function () {
		return <div
			className="menu-item column-item menu-config-row"
			key="detail-menu-items">
			{
				this.state.editing ?
				<div className = "menu-sub-item"
					onClick = {this.handleDoneEdit}>
					Save changes
				</div>
				:
				<div className = "menu-sub-item"
					onClick = {this.handleEdit}>
					Edit attributes
				</div>
			}
			<div className="menu-sub-item">
				<span className="grayed icon icon-plus"/>Add new attribute
			</div>
		</div>
	},

	render: function() {
		var _this = this
		var view = this.props.view
		var data = view.data
		var columns = view.data.columnList
		var sections = this.sections.map(function (section, idx) {
			return <ColumnMenuSection
				view = {view}
				key = {"section-" + idx}
				label = {section.label}
				ref = {"section-" + idx}
				icon = {section.icon}
				index = {idx}
				emptyText = {section.emptyText}
				columns = {section.selector(columns)}
				editing = {_this.state.editing}
				_startDrag = {_this.handleDragStart}
				_commitChanges = {_this.commitChanges}
				_moveToSection = {_this.moveToSection}/>
		})

    	return <div className = "double header-section" >
				<div className="header-label">Table Columns</div>
				<div className="model-views-menu">
				{
					this.state.open ?
					// full dropdown menu with all columns
					<div className="model-views-menu-inner" onClick={this.clickTrap}>
					<div className = "dropdown-menu" style = {{minWidth: '500px'}}>
						{sections}
						{this.state.editing ?
							<div className="menu-item menu-sub-item warning-item">
								<span className = "icon icon-kub-warning"></span>Warning: making changes here will affect all views for this model
							</div> : null
						}
						{this.renderButtonBar()}
					</div>
					</div>
					:
					// detail for currently selected column
					<div className="model-views-menu-inner" onClick={this.clickTrap}>
						<ColumnDetail config = {this.getCurrentCol()} view= {view}/>
					</div>
				}
				<div className="dropdown small grayed icon icon-chevron-down" onClick = {this.handleOpen}></div>
			</div>
		</div>
	}
});

export default ColumnMenu;
