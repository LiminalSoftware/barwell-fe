import React from "react";
import { Link } from "react-router";
import bw from "barwell";
import styles from "./style.less";
import ModelDefinition from "./ModelDefinition";
import TabularViewConfig from "../Views/Tabular/Config";

var DetailBar = React.createClass({
	getInitialState: function () {
		return {activePane: "modelDef"};
	},
	showModelDef: function () {
		this.setState({activePane: "modelDef"});
	},
	showViewConfig: function () {
		this.setState({activePane: "viewConfig"});
	},
	render: function () {
		var _this = this;
		var view = this.props.view;
		var viewData = view.synget(bw.DEF.VIEW_DATA);
		var model = this.props.model;
		var content;

		
		if (this.state.activePane == "modelDef")
				content = <ModelDefinition view={view} model={model} />;
		if (this.state.activePane == "viewConfig") {
			if (viewData.type === 'Tabular')
				content = <TabularViewConfig view={view} model={model} />;
			else 
				content = <div>Placeholder</div>;
		}
			
		return <div key="detail-bar" className="detail-bar">
			<ul className="detail-panels">
				<li><h2 className={this.state.activePane == "modelDef" ? "active" : ""} onClick={this.showModelDef}>Model</h2></li>
				<li><h2 className={this.state.activePane == "viewConfig" ? "active" : ""} onClick={this.showViewConfig}>View</h2></li>
				<li><h2>Details</h2></li>
			</ul>
			{content}
		</div>;
	}
});

export default DetailBar;