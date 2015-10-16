import React from "react"
import { RouteHandler, Link } from "react-router"
import viewTypes from "containers/Views/viewTypes"
import ViewSelector from "./ViewSelector"
import styles from "./style.less"
import detailStyles from "./detail.less"
import ModelDefinition from "../ModelDefinition"
import ModelStore from "../../stores/ModelStore"
import ViewStore from "../../stores/ViewStore"
import sortable from 'react-sortable-mixin'

import modelActionCreators from "../../actions/modelActionCreators"
var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

var ModelPane = React.createClass({

	getInitialState: function () {
		return {
			selection: "model",
			viewListOpen: false,
			miniaturized: false
		}
	},

	selectModel: function () {
		this.setState({selection: "model"})
	},

	selectView: function () {
		this.setState({selection: "view"})
	},

	componentWillUnmount: function () {
		ModelStore.removeChangeListener(this._onChange)
		ViewStore.removeChangeListener(this._onChange)
	},

	componentWillMount: function () {
		ModelStore.addChangeListener(this._onChange)
		ViewStore.addChangeListener(this._onChange)
	},

	_onChange: function () {
		this.forceUpdate()
	},

	toggleSidebar: function () {
		this.props.toggleSidebar();
	},

	focus: function () {
   	modelActionCreators.setFocus('model-config')
   },

	 toggleViewList: function () {
		 var toggle = !(this.state.viewListOpen)
		 this.setState({viewListOpen: toggle})
	 },

	render: function() {
		var _this = this
		var workspace_id = this.props.params.workspaceId
		var model_id = this.props.params.modelId
		var view_id = this.props.params.viewId
		var view = ViewStore.get(view_id)
		var model = ModelStore.get(model_id)

		var viewDetailContent
		var detailContent
		var bodyContent

		var activePane = this.state.activePane

		if (view && view.model_id != model_id) view = null
		if (!view) activePane = 'model-def'

		if (!!view && (view.type in viewTypes)) {
			var type = viewTypes[view.type]
			var bodyElement = type.mainElement
			var configElement = type.configElement

			bodyContent = React.createElement(bodyElement, {
				model: model,
				view: view,
				key: "view-pane-" + (view.cid || view.view_id)
			})

			viewDetailContent = React.createElement(configElement, {
				model: model,
				view: view,
				key: "view-config-" + view_id
			})
		}

		else {
			bodyContent = <div className="no-view-content view-body-wrapper" key="no-view">
				<span className="icon icon-face-nomimic"></span>No view selected
			</div>

			viewDetailContent = <div>Placeholder</div>
		}

		if (activePane === "model-def") {
			detailContent = <ModelDefinition model={model} />
		} else if (activePane === "view-config") {
			detailContent = <div className="view-details">
				<ViewSelector
					view={view}
					key={"view-selector-" + view_id}/>
				{viewDetailContent}
			</div>
		}

		var views = ViewStore.query({model_id: model_id})

		return <div className="model-views">
			<div className = "model-panes">
				<ReactCSSTransitionGroup component="div" className="detail-bar" transitionName="detail-bar" onClick={this.focus}>

				<div className="right-header header-container" >
					<h1>{model ? model.model : null}</h1>
					{view ? <h1>/</h1> : null}
					{view ? <h1>{view.view}</h1> : null}


					<ul className="dark padded mb-buttons right-margin"><li onClick={this.toggleViewList}>
						<span className={"small icon tight icon-chevron-" + (this.state.viewListOpen ? "up" : "down")}></span>
					</li></ul>
				</div>

				<div className = {"views-list-container " + (this.state.viewListOpen ? " open" : " closed")}
					style = {{maxHeight: this.state.viewListOpen ? ((80 + views.length * 70) + 'px') : 0}}>

					<div className="sidebar-sub-header rh-sidebar-subheader">
						<h2>Views</h2>
						<ul className="light padded mb-buttons">
							<li onClick={this.handleEdit}>Edit</li>
							<li onClick={this.handleAddModel} className="plus">+</li>
						</ul>
					</div>

					<ul className="views-list" onClick={this.toggleViewList}> {
						views.map(function (view) {
							return <li key={'view-link-' + view.view_id}>
								<Link to="view" params={{modelId: model_id, workspaceId: workspace_id, viewId: view.view_id}}>
									<span className={"large icon " + viewTypes[view.type].icon}></span>
									{view.view}
								</Link>
							</li>
						})
					}</ul>
				</div>

				<ul className="rh-sidebar-accordian">
					<li className="accordian-header" onClick={this.selectModel}>
						<h3>Database Definition</h3>
						<span className={"small icon tight icon-chevron-" + (this.state.selection === 'model' ? "up" : "down")}></span>
					</li>
					<li className={"accordian-content " + (this.state.selection === 'model' ? ' open' : ' closed')}>
						<ModelDefinition model = {model} />
					</li>
					<li className="accordian-header" onClick={this.selectView}>
						<h3>View Configuration</h3>
						<span className={"small icon tight icon-chevron-" + (this.state.selection === 'view' ? "up" : "down")}></span>
					</li>
					<li className={"accordian-content " + (this.state.selection === 'view' ? ' open' : ' closed')}>
						{viewDetailContent}
					</li>
					<li className="accordian-header">
						<h3>Selection Details</h3>
						<span className={"small icon tight icon-chevron-" + (this.state.selection === 'details' ? "up" : "down")}></span>
					</li>
					<li className="accordian-header">
						<h3>Change History</h3>
						<span className={"small icon tight icon-chevron-" + (this.state.selection === 'details' ? "up" : "down")}></span>
					</li>
				</ul>

				</ReactCSSTransitionGroup>


				<div className = "model-panes">
				<div className="view-body-wrapper">
				<div className="right-header header-container">
					<h3 className="current-user-label">Signed in as</h3>
				</div>
				{bodyContent}
				</div>
				</div>

			</div>
		</div>
	}
});

export default ModelPane
