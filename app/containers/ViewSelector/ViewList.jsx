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
			editing: false
		}
	},
	
	addNew: function () {
		var model = this.props.model
		var name = 'New view'
		var iter = 0
		while (ViewStore.query({model_id: model.model_id, view: name}).length > 0) {
			name = 'New view ' + (iter++)
		}
		modelActionCreators.createView({
			view: name,
			model_id: model.model_id,
			type: 'Tabular',
			data: {}
		})
		this.setState({editing: true})
	},

	handleEdit: function () {
		this.setState({editing: true})
	},

	handleDoneEdit: function () {
		this.setState({editing: false})
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
					<div className = "menu-sub-item padded"
						onClick = {this.handleDoneEdit}>
						Save changes
					</div>
					:
					<div className = "menu-sub-item padded"
						onClick = {this.handleEdit}>
						Edit views
					</div>
				}
				<div className="menu-sub-item padded" onClick = {this.addNew}>
					Add view
				</div>
			</div>
		</div>
	}
})

export default ViewList
