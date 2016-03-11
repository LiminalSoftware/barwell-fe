import React from "react";
import { Link } from "react-router";
import _ from 'underscore';
import fieldTypes from "../../../fields"

// uses the same components as tabular.  should probably refactor at some point
import ColumnDetail from "../../../Tabular/InlineConfig/ColumnMenu/ColumnDetail"
import ColumnMenuSection from "../../../Tabular/InlineConfig/ColumnMenu/ColumnMenuSection"

import constant from '../../../../../constants/MetasheetConstants'
import util from '../../../../../util/util'

import modelActionCreators from "../../../../../actions/modelActionCreators.jsx"

import AggregatePicker from './AggregatePicker'
import GroupSortPicker from './GroupSortPicker'

import PureRenderMixin from 'react-addons-pure-render-mixin';
var blurOnClickMixin = require('../../../../../blurOnClickMixin')

var CubeColumnMenu = React.createClass({

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
		var view = this.props.view;
		view.data.columns[column.column_id] = column;

		modelActionCreators.createView(view, true, true);
		this.setState({dragItem: null, committing: true});
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
		return columns[0]
	},

	sections : [
		{
			label: "Row Groupings",
			emptyText: "No row groups defined...",
			icon: "icon-layer-3",
			configParts: [GroupSortPicker],
			selector: function (view) {
				return view.data.columnList.filter(c => c.groupByRow).sort(util.orderSort)
			},
			enterTransform: function (col) {
				col.groupByColumn = false;
				col.groupByRow = true;
				col.inTableBody = false;
				col.visible = true;
				return col
			}
		},
		{
			label: "Column Groupings",
			emptyText: "No column groups defined...",
			icon: "icon-layer-3",
			configParts: [GroupSortPicker],
			selector: function (view) {
				return view.data.columnList.filter(c => c.groupByColumn).sort(util.orderSort)
			},
			enterTransform: function (col) {
				col.groupByColumn = true;
				col.groupByRow = false;
				col.inTableBody = false;
				col.visible = true;
				return col
			}
		},
    	{
			label: "Table Body Attributes",
			emptyText: "No table body attributes defined...",
			icon: "icon-layer-3",
			configParts: [AggregatePicker],
			selector: function (view) {
				return view.data.columnList.filter(c => c.inTableBody).sort(util.orderSort)
			},
			enterTransform: function (col) {
				col.groupByColumn = false;
				col.groupByRow = false;
				col.inTableBody = true;
				col.visible = true;
				return col
			}
		},
		{
			label: "Hidden Attributes",
			emptyText: "No hidden attributes...",
			icon: "icon-eye-4",
			selector: function (view) {
				return view.data.columnList.filter(c => !c.inTableBody && !c.groupByRow && !c.groupByColumn).sort(util.orderSort)
			},
			enterTransform: function (col) {
				col.groupByColumn = false;
				col.groupByRow = false;
				col.inTableBody = false;
				col.visible = false;
				return col
			}
		}
	],

	moveToSection: function (e, item, sectionIdx, direction) {
		var view = this.props.view
		var section = this.sections[sectionIdx]
		var el = this.refs["section-" + (sectionIdx)]
		if (!el) return false

		item = section.enterTransform(item)
		view.data.columns[item.column_id] = item
		el.dragInto(e, item, direction)
		console.log('====')
		console.log(view)
		console.log('====')
		return true
	},

	renderButtonBar: function () {
		return <div
			className="menu-item menu-config-row"
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
				Add new attribute
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
				viewConfigParts = {section.configParts}
				emptyText = {section.emptyText}
				columns = {section.selector(view)}
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

export default CubeColumnMenu;
