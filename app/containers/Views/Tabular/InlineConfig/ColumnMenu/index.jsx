import React from "react";
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
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

	blurChildren: function () {
		var _this = this;
		this.sections.forEach(function (section) {
			_this.refs[section].blurChildren();
		})
	},

	componentWillReceiveProps: function (nextProps) {
		this.setState({columns: nextProps.view.data.columnList})
	},

	commitChanges: function (column) {
		var view = this.props.view
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

	moveToSection: function (e, item, sectionIdx, direction) {
		var view = this.props.view
		var section = this.props.sections[sectionIdx]
		var el = this.refs["section-" + (sectionIdx)]
		if (!el) return false

		item = section.enterTransform(item, view)
		el.dragInto(e, item, direction)
		return true
	},

	renderButtonBar: function () {
		var editing = this.state.editing;
		return <div key = "buttons">
			{
				editing ?
				<div className="menu-item menu-config-row">
					<div className = "menu-sub-item">
					<span className = "icon icon-plus"/> Add column
					</div>
				</div> : null
			}
			<div className="menu-item menu-config-row" key="detail-menu-items">
			{
				this.state.editing ?
				<div className = "menu-sub-item"
					onClick = {this.handleDoneEdit}>
					<span className = "icon icon-check"/>
					Save changes
				</div>
				:
				<div className = "menu-sub-item"
					onClick = {this.handleEdit}>
					<span className = "icon icon-pencil"/> 
					Edit columns
				</div>
			}
			{
				this.state.editing ?
				<div className = "menu-sub-item"
					onClick = {this.handleDoneEdit}>
					<span className = "icon icon-cross2"/>
					Cancel changes
				</div>
				:
				<div className = "menu-sub-item"
					onClick = {this.handleDoneEdit}>
					<span className = "icon icon-plus"/>
					Add column
				</div>
			}
		</div>


		</div>
	},

	render: function() {
		var _this = this;
		var view = this.props.view;
		var data = view.data;
		var columns = view.data.columnList;
		var currentCol = view.data.currentColumn;
		var sections = this.props.sections.map(function (section, idx) {
			return <ColumnMenuSection
				view = {view}
				key = {section.section}
				label = {section.label}
				ref = {section.section}
				icon = {section.icon}
				index = {idx}
				emptyText = {section.emptyText}
				columns = {section.selector(view)}
				editing = {_this.state.editing}
				_startDrag = {_this.handleDragStart}
				_commitChanges = {_this.commitChanges}
				_moveToSection = {_this.moveToSection}/>
		})

    	return <div className = "double header-section" >
				<div className="header-label">Columns</div>
				<div className = "model-views-menu">
					<ReactCSSTransitionGroup 
						component = "div"
						onClick={this.clickTrap}
						className="model-views-menu-inner"
						transitionName="fade-in"
						transitionAppear={true}
						transitionEnterTimeout={500}
						transitionLeaveTimeout={500}
						transitionAppearTimeout={500}>
						{
						this.state.open ?
							<div className = "dropdown-menu" style = {{minWidth: '500px'}}>
								{sections}
								{this.renderButtonBar()}
							</div>
							:
							currentCol ? 
							<ColumnDetail 
								singleton = {true} key = {currentCol.column_id} 
								config = {currentCol} view = {view}/>
							:
							<div className="singleton menu-item menu-sub-item">No selection...</div>
						}
					</ReactCSSTransitionGroup>
				<div className="dropdown small grayed icon icon-chevron-down" onClick = {this.handleOpen}/>
			</div>
		</div>
	}
});

export default ColumnMenu;
