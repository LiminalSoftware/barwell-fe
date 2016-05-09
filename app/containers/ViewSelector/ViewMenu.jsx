import _ from "underscore"
import React from "react"
import ViewStore from "../../stores/ViewStore"
import styles from "./style.less"
import viewTypes from "../Views/viewTypes"
import { Link } from "react-router"

import modelActionCreators from "../../actions/modelActionCreators.jsx"

import sortable from 'react-sortable-mixin';

import ViewList from './ViewList'
import ViewItemSingleton from './ViewItemSingleton';

import menuOverflowMixin from '../../menuOverflowMixin'

import sortItems from './sortItems';

var ViewMenu = React.createClass({

	mixins: [menuOverflowMixin],

	// LIFECYCLE ==============================================================

	componentWillMount: function () {
		ViewStore.addChangeListener(this._onChange);
		this.calibrateHeight();
	},

	componentWillUnmount: function () {
		ViewStore.removeChangeListener(this._onChange);
	},

	getInitialState: function () {
		return {
			editing: false,
			adding: false
		}
	},

	// HANDLERS ===============================================================
	
	_onChange: function () {
		this.forceUpdate()
	},

	handleAddNewView: function (type, e) {
		this.refs.viewList.addNewView(type);
		this.setState({adding: false});
	},

	handleAddNewChoices: function () {
		this.setState({
			adding: true, 
			editing: true
		});
	},

	handleEdit: function () {
		this.setState({editing: true})
	},

	handleSave: function () {
		this.refs.viewList.saveChanges();
		this.setState({editing: false, adding: false})
	},

	handleCancelEdit: function () {
		this.refs.viewList.cancelChanges();
		this.setState({editing: false, adding: false});
	},

	// UTILITY ================================================================

	getButtonBar: function () {
		return <div className="menu-item menu-config-row" key="detail-menu-items">
			{
				this.state.editing ?
				<div className = {"menu-sub-item padded menu-clickable " + (this.state.adding ? "border-bottom" : "")}
					onClick = {this.handleSave}>
					<span className = "icon icon-check"/> Save changes
				</div>
				:
				<div className = "menu-sub-item padded menu-clickable"
					onClick = {this.handleEdit}>
					<span className = "icon icon-pencil"/> Edit views
				</div>
			}
			{
				this.state.editing ?
				<div className = {"menu-sub-item padded menu-clickable " + (this.state.adding ? "border-bottom" : "")}
					onClick = {this.handleCancelEdit}>
					<span className = "icon icon-cross2"/>Cancel changes
				</div>
				:
				<div className="menu-sub-item padded menu-clickable" 
					onClick = {this.handleAddNewChoices}>
					<span className = "icon icon-plus"/> Add view
				</div>
			}
			
		</div>
	},

	// RENDER =================================================================

	// <div key="fixed-list" className = "dropdown-list">
	// 			{
	// 				views.map((v, idx) =>
	// 					<ViewItemSingleton 
	// 						selected = {v.view_id === view.view_id}
	// 						key = {'singleton-' + (v.cid || v.view_id)} 
	// 						view = {v} model = {model}/>
	// 				)
	// 			}
	// 			</div>


	render: function () {
		var _this = this;
		var model = this.props.model;
		var view = this.props.view || {};
		var views = ViewStore.query({model_id: model.model_id});
		var editing = this.state.editing;

		views = sortItems(model, views);

		return <div className = "dropdown-menu "
					key = "list-wrapper"
					style = {{minWidth: "400px", maxHeight: (this.state.windowHeight - 100) + 'px'}}>
			{
				
				<ViewList ref = "viewList"
					items = {views}
					editing = {this.state.editing} 
					{..._this.props}
					key = "orderable-list"/>
			}

			

			{
				this.state.editing && !this.state.adding ?
				<div className = "menu-item menu-config-row" key = "config-row">
					<div className="menu-sub-item padded menu-clickable" 
						onClick = {this.handleAddNewChoices}>
						<span className = "icon icon-plus"/> Add view
					</div>
				</div>
				: null
			}
			{
				this.state.adding ?
				<div className = "menu-item menu-config-row" key = "add-row">
					<div className="menu-sub-item padded">
						Select type for new view:
					</div>
				</div>
				: null
			}
			{
				this.state.adding ? 
				_.map(viewTypes, function (type, typeKey) {
		        	return <div className = "menu-item menu-item menu-sub-item menu-clickable"
		            	onClick = {_this.handleAddNewView.bind(_this, type)}
		            	key = {typeKey}>
		            	<span className = {"large icon view-icon " + type.icon}/>
		            	{type.type}
		            </div>
		        })
				:
				null
			}
			{this.getButtonBar()}
		</div>
	}
})

export default ViewMenu
