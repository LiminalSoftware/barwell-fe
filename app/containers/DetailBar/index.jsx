import React from "react";
import { Link } from "react-router";
import bw from "barwell";
import styles from "./style.less";
import ModelDefinition from "./ModelDefinition";
import TabularViewConfig from "../Views/Tabular/Config";
import ViewSelector from "./ViewSelector"

var DetailBar = React.createClass({
	getInitialState: function () {
		return {activePane: "model-def"};
	},
	showModelDef: function () {
		this.setState({activePane: "model-def"});
	},
	showViewConfig: function () {
		this.setState({activePane: "view-config"});
	},
	toggleSidebar: function () {
		// this.props.toggleSidebar();
	},
	render: function () {
		var _this = this
		var view = this.props.view
		var model = this.props.model
		var viewConfig
		var content
		
		if (!view || this.state.activePane == "model-def") {
			this.state.activePane = "model-def"
			content = <ModelDefinition view={view} model={model} />
		} else if (this.state.activePane == "view-config") {
			var viewData = view.synget(bw.DEF.VIEW_DATA)
			if (viewData.type === 'Tabular') viewConfig = <TabularViewConfig view={view} model={model}/>
			else  viewConfig = <div>Placeholder</div>
			content = <div className="view-details">
				<ViewSelector view={view}/>
				{viewConfig}
			</div>
		}

		return <div key="detail-bar" className="detail-bar">
			<div className="detail-hider" onClick={this.toggleSidebar}><span className="small clickable right-align icon icon-arrow-left"></span></div>
			<ul className="detail-panels">
				<li><h2 className={this.state.activePane == "model-def" ? "active" : ""} onClick={this.showModelDef}>Model</h2></li>
				{ (!!view) ? <li><h2>Details</h2></li> : "" }
				{ (!!view) ? <li><h2 className={this.state.activePane == "view-config" ? "active" : ""} onClick={this.showViewConfig}>View</h2></li> : ""}
			</ul>
			{content}
		</div>
	}
});



export default DetailBar;