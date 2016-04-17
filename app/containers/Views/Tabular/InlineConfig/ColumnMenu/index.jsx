import React from "react";
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { Link } from "react-router";
import styles from "./style.less";
import _ from 'underscore';
import fieldTypes from "../../../fields";

import ColumnList from "./ColumnList";
import ColumnDetail from "./ColumnDetailSingleton";

import AttributeStore from "../../../../../stores/AttributeStore";
import constant from '../../../../../constants/MetasheetConstants';
import util from "../../../../../util/util";

import modelActionCreators from "../../../../../actions/modelActionCreators.jsx";

import PureRenderMixin from 'react-addons-pure-render-mixin';
import blurOnClickMixin from '../../../../../blurOnClickMixin';
import sortable from 'react-sortable-mixin';


var ColumnMenu = React.createClass({

	mixins: [blurOnClickMixin],

	componentWillMount: function () {
		AttributeStore.addChangeListener(this._onChange);
	},

	componentWillUnmount: function () {
		AttributeStore.removeChangeListener(this._onChange);
	},

	_onChange: function () {
		this.forceUpdate();
	},

	getInitialState: function () {
		return {
			open: false,
			editing: false,
			dirty: false,
			newColumns: []
		};
	},

	markDirty: function (isDirty) {
		this.setState({dirty: (isDirty === false) ? false : true})
	},

	commitUpdates: function () {
		this.setState({dirty: false})
		this.refs.list.commitUpdates();
	},

	handleEdit: function () {
		if (this.refs.list.revertChanges) this.refs.list.revertChanges()
		this.setState({editing: true, dirty: false})
	},

	handleDoneEdit: function () {
		this.setState({editing: false})
	},

	handleAddColumn: function () {
		var view = this.props.view;
		var model = this.props.model;
		var idx = 0;
		var attr = {attribute: 'New attribute', model_id: model.model_id, type: 'TEXT'};
		while (AttributeStore.query({attribute: attr.attribute}).length > 0) {
			attr.attribute = 'New attribute ' + idx++;
		}
		modelActionCreators.create('attribute', false, attr);
		modelActionCreators.createView(view, false, false);
	},

	renderButtonBar: function () {
		var editing = this.state.editing;
		return <div key = "buttons">
			{
				this.props.confirmChanges && this.state.dirty ?
				<div className="menu-item menu-config-row">
					<div className = "menu-sub-item" onClick = {this.commitUpdates}>
					<span className = "icon icon-check"/> Update cube
					</div>
				</div> : null
			}
			{
				editing ?
				<div className="menu-item menu-config-row"
					onClick = {this.handleAddColumn}>
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

	blurChildren: function () {
		if (this.refs.list) this.refs.list.blurChildren()
	},

	render: function() {
		
		var _this = this;
		var view = this.props.view;
		var viewconfig = this.props.viewconfig || {};
		var data = view.data;
		var columns = view.data.columnList;

		var currentCol = this.props._getColumnAt(viewconfig.pointer);

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
								<ColumnList 
									{...this.props} ref = "list" 
									_markDirty = {this.markDirty}
									editing = {this.state.editing}/>
								{this.renderButtonBar()}
							</div>
							:
							currentCol ? 
							<ColumnDetail
								ref = 'columnDetail'
								key = {currentCol.column_id}
								
								_blurChildren = {e => _this.refs.columnDetail.blurSubMenus()}
								config = {currentCol} view = {view}/>
							:
							<div className="singleton menu-item menu-sub-item">
								No selection...
							</div>
						}
					</ReactCSSTransitionGroup>
				<div className="dropdown icon--small icon icon-chevron-down" onClick = {this.handleOpen}/>
			</div>
		</div>
	}
});

export default ColumnMenu;
