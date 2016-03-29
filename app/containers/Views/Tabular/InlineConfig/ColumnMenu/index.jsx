import React from "react";
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { Link } from "react-router";
import styles from "./style.less";
import _ from 'underscore';
import fieldTypes from "../../../fields"

import ColumnList from "./ColumnList"
import ColumnDetail from "./ColumnDetailListable"
import constant from '../../../../../constants/MetasheetConstants'
import util from "../../../../../util/util"

import modelActionCreators from "../../../../../actions/modelActionCreators.jsx"

import PureRenderMixin from 'react-addons-pure-render-mixin';
import blurOnClickMixin from '../../../../../blurOnClickMixin';
import sortable from 'react-sortable-mixin';


var ColumnMenu = React.createClass({

	mixins: [blurOnClickMixin],

	_onChange: function () {
		this.forceUpdate();
	},

	getInitialState: function () {
		return {
			open: false,
			editing: false,
		};
	},

	commitChanges: function (column) {
		var view = this.props.view;
		view.data.columns[column.column_id] = column;
		modelActionCreators.createView(view, true, true);
		this.setState({dragItem: null})
	},

	handleEdit: function () {
		// console.log('edit')
		this.setState({editing: true})
	},

	handleDoneEdit: function () {
		this.setState({editing: false})
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

		//set the first section separately so you can't drag on top of it
		var firstSection = this.props.sections[0]; 

		var transitionProps = {
			transitionName: "fade-in",
			transitionAppear: true,
			transitionEnterTimeout: 500,
			transitionLeaveTimeout: 500,
			transitionAppearTimeout: 500
		};

    	return <div className = "double header-section" >
			<div className="header-label">Columns</div>
				<div className = "model-views-menu">
					<ReactCSSTransitionGroup 
						component = "div"
						onClick={this.clickTrap}
						className="model-views-menu-inner"
						{...transitionProps}>
						{
							this.state.open ? 
							<div className = "dropdown-menu" style = {{minWidth: '500px'}}>
								<div className="menu-item menu-sub-item menu-divider" >
									{firstSection.label}
								</div>
								<ColumnList {...this.props} editing = {this.state.editing}/>
								{this.renderButtonBar()}
							</div>
							:
							currentCol ? 
							<ColumnDetail
								singleton = {true} key = {currentCol.column_id}
								config = {currentCol} view = {view}/>
							:
							<div className="singleton menu-item menu-sub-item">
								No selection...
							</div>
						}
					</ReactCSSTransitionGroup>
				<div className="dropdown small grayed icon icon-chevron-down" onClick = {this.handleOpen}/>
			</div>
		</div>
	}
});

export default ColumnMenu;
