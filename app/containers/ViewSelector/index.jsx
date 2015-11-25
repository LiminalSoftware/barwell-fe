import React from "react"
import ViewStore from "../../stores/ViewStore"
import sortable from 'react-sortable-mixin'
import styles from "./style.less"
import viewTypes from "../Views/viewTypes"
import { Link } from "react-router"
// var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

var ViewSelector = React.createClass({
	getInitialState: function () {
		return {open: false}
	},

	onClick: function () {
		return this.setState({open: !this.state.open})
	},

	render: function() {
    var model = this.props.model
    var view = this.props.view
		if (!model) return null

		return <div className = "header-section">
			<div className="header-label">View Selector</div>
			<div className="model-views-menu" onClick = {this.onClick}>
				<div className="model-views-menu-inner">
					<ViewItem {...this.props} className="inline"/>
				</div>

				{this.state.open ? <ViewsList {...this.props}/> : null}
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
		return <div className = "dropdown-menu">
			{views.map(view => <ViewItem {...this.props} view={view} />)}
			<div className="menu-item">
				<span className="menu-sub-item">
					<span className="large view-icon icon icon-pencil-2"/>
					Edit
				</span>
				<span className="menu-sub-item">
					<span className="large view-icon icon icon-cr-add"/>
					Add new
				</span>
			</div>
		</div>
	}
})

var ViewItem = React.createClass({
	render: function () {
		var view = this.props.view
		var model = this.props.model
		if (view) return <Link to="view" params={{
			modelId: view.model_id,
			workspaceId: model.workspace_id,
			viewId: view.view_id}}
			className="menu-item menu-sub-item">
			<span className={"large view-icon icon " + (viewTypes[view.type].icon)}/>
			{view.view}
		</Link>
		else return <div className = "menu-item menu-sub-item">
			No view selected
		</div>
	}
})

export default ViewSelector
