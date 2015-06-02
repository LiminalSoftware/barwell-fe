import React from "react"
import { RouteHandler } from "react-router"
import viewTypes from "containers/Views/viewTypes"
import bw from "barwell"
import ViewSelector from "./ViewSelector"
import styles from "./style.less"
import ModelDefinition from "./ModelDefinition"

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
	render: function() {
		var modelId = this.props.params.modelId
		var viewId = this.props.params.viewId
		var view = (!!viewId) ? bw.MetaView.store.synget(901, viewId) : null
		var model = bw.ModelMeta.store.synget(101, modelId)
		
		var viewDetailContent
		var detailContent
		var bodyContent

		if (!!view && view.synget(bw.DEF.VIEW_MODELID) !== modelId) view = null

		if (!!view) {
			var type = viewTypes[view.type]
			var bodyElement = type.mainElement
			var configElement = type.configElement

			bodyContent = React.createElement(bodyElement, {
				model: model,
				view: view,
				key: "view-pane-" + viewId		
			})

			viewDetailContent = React.createElement(configElement, {
				model: model,
				view: view,
				key: "view-config-" + viewId	
			})
		}
		else {
			bodyContent = <div className="no-view-content view-body-wrapper">
				<span className="icon icon-face-dark-nomimic"></span>No view selected
			</div>

			viewDetailContent = <div>Placeholder</div>
		}

		if (this.state.activePane === "model-def") {
			detailContent = <ModelDefinition model={model} />
		} else if (this.state.activePane === "view-config") {
			detailContent = <div className="view-details">
				<ViewSelector 
					view={view} 
					key={"view-selector-" + viewId}/>
				{viewDetailContent}
			</div>
		}
		
		return <div className="model-views">
			<div className = "model-panes">
				<div className="detail-bar">
					<div className="detail-hider" onClick={this.toggleSidebar}><span className="small clickable right-align icon icon-arrow-left"></span></div>
					<ul className="detail-panels">
						<li><h2 className={this.state.activePane == "model-def" ? "active" : ""} onClick={this.showModelDef}>Model</h2></li>
						{ (!!view) ? <li><h2>Details</h2></li> : "" }
						{ (!!view) ? <li><h2 className={this.state.activePane == "view-config" ? "active" : ""} onClick={this.showViewConfig}>View</h2></li> : ""}
					</ul>
					{detailContent}
				</div>
				<div className = "">
				{bodyContent}
				</div>
			</div>
		</div>
	}
});

export default ModelPane