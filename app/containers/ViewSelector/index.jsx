import React from "react"
import ViewStore from "../../stores/ViewStore"
import styles from "./style.less"
import viewTypes from "../Views/viewTypes"
import { Link } from "react-router"
// import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import PureRenderMixin from 'react-addons-pure-render-mixin';
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
				<div className="dropdown small grayed icon icon-chevron-down"
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
		var model = this.props.model
		var views = ViewStore.query({model_id: model.model_id})
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
			<Link to={`/workspace/${model.workspace_id}/model/${model.model_id}/config`}
					className = "menu-item menu-sub-item" key="model-editor">
				<span className="large view-icon icon icon-tl-toolbox"/>
				Database Configuration
			</Link>
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

		if (view) return <Link
				to = {`/workspace/${model.workspace_id}/model/${view.model_id}/view/${view.view_id}`}
				className= {"menu-item tight menu-sub-item " +
					(this.props.selected ? " selected" : "")}>
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
