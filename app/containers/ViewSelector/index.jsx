import React from "react"
import ViewStore from "../../stores/ViewStore"
import styles from "./style.less"
import viewTypes from "../Views/viewTypes"
import { Link } from "react-router"
// var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

var PureRenderMixin = require('react/addons').addons.PureRenderMixin;
var blurOnClickMixin = require('../../blurOnClickMixin')

var ViewSelector = React.createClass({

	mixins: [PureRenderMixin, blurOnClickMixin],

	getInitialState: function () {
		return {open: false}
	},

	render: function() {
    var model = this.props.model
    var view = this.props.view
		if (!model) return null

		return <div className = "header-section ">
			<div className="header-label">View Selector</div>
			<div className="model-views-menu" onClick = {this.clickTrap}>
				<div className="model-views-menu-inner" onClick = {this.handleOpen}>
					<ViewItem {...this.props} className="inline"/>
				</div>
				{this.state.open ? <ViewsList {...this.props}/> : null}
				<div className="dropdown small grayed icon icon-geo-arrw-down"
					onClick = {this.handleOpen}></div>
			</div>

		</div>
	}
});

var ViewsList = React.createClass({
	getInitialState: function () {
			return {
				editing: false
			}
	},

	addNew: function () {

	},

	handleEdit: function () {
		this.setState({editing: true})
	},

	handleDoneEdit: function () {
		this.setState({editing: false})
	},

	render: function () {
		var _this = this
		var views = ViewStore.query({model_id: this.props.model.model_id})
		var editing = this.state.editing
		return <div className = "dropdown-menu "
					style = {{minWidth: "250px"}}>
			{views.map( view =>
				<ViewItem {...this.props}
					key = {view.view_id}
					selected = {_this.view === view}
					view = {view}
					editing = {editing}/>
			)}
			<div className="menu-item column-item menu-config-row" key="detail-menu-items">
				{
					this.state.editing ?
					<div className = "menu-sub-item"
						onClick = {this.handleDoneEdit}>
						Save changes
					</div>
					:
					<div className = "menu-sub-item"
						onClick = {this.handleEdit}>
						Edit views
					</div>
				}
				<div className="menu-sub-item">
					Add view
				</div>
			</div>
		</div>
	}
})

var ViewItem = React.createClass({
	render: function () {
		var view = this.props.view
		var model = this.props.model

		if (view) return <Link to="view"
				className= {"menu-item tight menu-sub-item " +
					(this.props.selected ? " selected" : "")}
				params={{
					modelId: view.model_id,
					workspaceId: model.workspace_id,
					viewId: view.view_id
				}}>
				{this.props.editing ?
						<span className = "half-column-config">
							<span className="draggable icon grayed icon-Layer_2"/>
						</span>
						: null}
				<span className = "half-column-config">
					<span className={"large view-icon icon " + (viewTypes[view.type].icon)}/>
				</span>
				<span className = "double-column-config">
					{view.view}
				</span>
				{this.props.editing ?
						<span className = "half-column-config">
							<span className = "icon red icon-cr-delete"></span>
						</span>
						: null}
			</Link>
		else return <div className = "menu-item menu-sub-item ">
			No view selected
		</div>
	}
})

export default ViewSelector
