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


var ViewMenu = React.createClass({

	// LIFECYCLE ==============================================================

	getInitialState: function () {
		return {
			editing: false,
			adding: false
		}
	},

	// componentWillMount: function () {
	// 	ViewStore.addChangeListener(this._onChange);
	// },

	// componentWillUnmunt: function () {
	// 	ViewStore.removeChangeListener(this._onChange);
	// },

	// _onChange: function () {
	// 	this.forceUpdate();
	// },

	// HANDLERS ===============================================================
	
	handleAddNewView: function (type, e) {
		console.log('handleAddNewView')
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
				<div className = {"menu-sub-item padded " + (this.state.adding ? "border-bottom" : "")}
					onClick = {this.handleSave}>
					<span className = "icon icon-check"/> Save changes
				</div>
				:
				<div className = "menu-sub-item padded"
					onClick = {this.handleEdit}>
					<span className = "icon icon-pencil"/> Edit views
				</div>
			}
			{
				this.state.editing ?
				<div className = {"menu-sub-item padded " + (this.state.adding ? "border-bottom" : "")}
					onClick = {this.handleCancelEdit}>
					<span className = "icon icon-cross2"/>Cancel changes
				</div>
				:
				<div className="menu-sub-item padded" 
					onClick = {this.handleAddNewChoices}>
					<span className = "icon icon-plus"/> Add view
				</div>
			}
			
		</div>
	},

	// RENDER =================================================================

	render: function () {
		var _this = this;
		var model = this.props.model;
		var view = this.props.view || {};
		var views = ViewStore.query({model_id: model.model_id});
		var editing = this.state.editing;

		return <div className = "dropdown-menu "
					style = {{minWidth: "400px"}}>
			{
				this.state.editing ? 
				<ViewList ref = "viewList"
					items = {views} editing = {this.state.editing} {..._this.props}/>
				:
				views.map((v,idx) =>
					<ViewItemSingleton 
						selected = {v.view_id === view.view_id}
						key = {v.view_id} view = {v} model = {model}/>
				)
			}
			
			<Link to = {`/workspace/${model.workspace_id}/model/${model.model_id}/config`}
				className = {"menu-item menu-sub-item " + 
					(!view ? " menu-selected " : " ")}
				 key="model-editor">
				<span className = "icon icon-pencil-ruler"></span>
				<span className = "double-column-config">Database Configuration</span>
			</Link>
			{
				this.state.editing && !this.state.adding ?
				<div className = "menu-item menu-config-row">
					<div className="menu-sub-item padded" 
						onClick = {this.handleAddNewChoices}>
						<span className = "icon icon-plus"/> Add view
					</div>
				</div>
				: null
			}
			{
				this.state.adding ?
				<div className = "menu-item menu-config-row">
					<div className="menu-sub-item padded">
						Select type for new view:
					</div>
				</div>
				: null
			}
			{
				this.state.adding ? 
				_.map(viewTypes, function (type, typeKey) {
		        	return <div className = "menu-item menu-item menu-sub-item"
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
