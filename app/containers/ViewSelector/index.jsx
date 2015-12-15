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
	edit: function () {

	},
	addNew: function () {

	},
	render: function () {
		var views = ViewStore.query({model_id: this.props.model.model_id})
		return <div className = "dropdown-menu ">
			{views.map(view => <ViewItem {...this.props} view={view}/>)}
			<div className="menu-item">
				<span className="menu-sub-item">

					Edit views
				</span>
				<span className="menu-sub-item">

					Add view
				</span>
			</div>
		</div>
	}
})

var ViewItem = React.createClass({
	render: function () {
		var view = this.props.view
		var model = this.props.model
		if (view) return <div className = "menu-item">
		<Link to="view" params={{
			modelId: view.model_id,
			workspaceId: model.workspace_id,
			viewId: view.view_id}}
			className= {"menu-item menu-sub-item "}>
			<span className={"large view-icon icon " + (viewTypes[view.type].icon)}/>
			{view.view}
		</Link></div>
		else return <div className = "menu-item menu-sub-item ">
			No view selected
		</div>
	}
})

export default ViewSelector
