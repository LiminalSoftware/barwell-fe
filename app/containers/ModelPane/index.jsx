import React from "react"
import { RouteHandler } from "react-router"
import viewTypes from "containers/Views/viewTypes"
import ViewSelector from "./ViewSelector"
import styles from "./style.less"
import ModelDefinition from "./ModelDefinition"
import ModelStore from "../../stores/ModelStore"
import ViewStore from "../../stores/ViewStore"

var ModelPane = React.createClass({

	getInitialState: function () {
		return {activePane: "model-def"}
	},

	showModelDef: function () {
		this.setState({activePane: "model-def"})
	},

	showViewConfig: function () {
		this.setState({activePane: "view-config"})
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

	render: function() {
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
				key: "view-pane-" + view_id
			})

			viewDetailContent = React.createElement(configElement, {
				model: model,
				view: view,
				key: "view-config-" + view_id
			})
		}
		
		else {
			bodyContent = <div className="no-view-content view-body-wrapper">
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
		
		return <div className="model-views">
			<div className = "model-panes">
				<div className="detail-bar">
					<div className="detail-hider" onClick={this.toggleSidebar}><span className="small clickable right-align icon icon-arrow-left"></span></div>
					<ul className="detail-panels">
						<li><h2 className={activePane == "model-def" ? "active" : ""} onClick={this.showModelDef}>Model</h2></li>
						{ (!!view) ? <li><h2>Details</h2></li> : "" }
						{ (!!view) ? <li><h2 className={activePane == "view-config" ? "active" : ""} onClick={this.showViewConfig}>View</h2></li> : ""}
					</ul>
					{detailContent}
				</div>
				<div className = "model-panes">
				{bodyContent}
				</div>
			</div>
		</div>
	}
});

export default ModelPane