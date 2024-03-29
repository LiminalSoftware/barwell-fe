import _ from "underscore"
import React from "react"
import ViewStore from "../../stores/ViewStore"
import styles from "./style.less"
import viewTypes from "../Views/viewTypes"
import { Link } from "react-router"

import ViewItem from './ViewItem'
import modelActionCreators from "../../actions/modelActionCreators.jsx"

var ViewList = React.createClass({
	getInitialState: function () {
		return {
			editing: false,
			adding: false
		}
	},

	componentDidMount: function () {
		this.setState({mounted: true})
	},
	
	handleAddNewChoices: function () {
		this.setState({adding: true, editing: true})
	},

	handleEdit: function () {
		this.setState({editing: true})
	},

	handleDoneEdit: function () {
		this.setState({editing: false})
	},

	handleAddNewView: function (type, e) {
		var model = this.props.model
		var name = 'New ' + type.type
		var iter = 1
		while (ViewStore.query({model_id: model.model_id, view: name}).length > 0)
			name = 'New ' + type.type + ' ' + (iter++)

		modelActionCreators.createView({
			view: name,
			model_id: model.model_id,
			type: type.type,
			data: {}
		})
		this.setState({adding: false, editing: true})
	},

	render: function () {
		var _this = this
		var model = this.props.model
		var view = this.props.view
		var views = ViewStore.query({model_id: model.model_id})
		var editing = this.state.editing
		return <div className = "dropdown-menu "
					style = {{minWidth: "400px"}}>
			{views.map( v =>
				<ViewItem {...this.props}
					key = {v.view_id}
					selected = {(view || {}).view_id === v.view_id}
					view = {v}
					editing = {editing}/>
			)}
			<Link to={`/workspace/${model.workspace_id}/model/${model.model_id}/config`}
				className = "menu-item menu-sub-item no-left-padding" key="model-editor">
				<span className = {"small icon icon-geo-circle " + (!view ? " green" : " hovershow")}/>
				<span className = "large icon icon-tl-toolbox"></span>
				<span className = "double-column-config">Database Configuration</span>
			</Link>
			<div className="menu-item menu-config-row" key="detail-menu-items">
				{
					this.state.editing ?
					<div className = {"menu-sub-item padded " + (this.state.adding ? "border-bottom" : "")}
						onClick = {this.handleDoneEdit}>
						Save changes
					</div>
					:
					<div className = "menu-sub-item padded"
						onClick = {this.handleEdit}>
						Edit views
					</div>
				}
				{
					this.state.editing ?
					<div className = {"menu-sub-item padded " + (this.state.adding ? "border-bottom" : "")}
						onClick = {this.handleCancelEdit}>
						Cancel changes
					</div>
					:
					null
				}
				<div className="menu-sub-item padded" 
					onClick = {this.handleAddNewChoices}>
					Add view
				</div>
			</div>
			{
				this.state.adding ? 
				_.map(viewTypes, function (type, typeKey) {
		        	return <div className = "menu-item menu-item menu-sub-item"
		            	onClick = {_this.handleAddNewView.bind(_this, type)}
		            	key ={typeKey}>
		            	<span className = {"large icon view-icon " + type.icon}/>
		            	{type.type}
		            </div>
		        })
				:
				null
			}
		</div>
	}
})

export default ViewList
