import React from "react";
import { RouteHandler } from "react-router";
import DetailBar from "containers/DetailBar";
import TabularPane from "containers/TabularPane";
import barwell from "barwell";
import styles from "./style.less";

export default class ModelPane extends React.Component {
	static getProps(stores, params) {
		return params;
	}
	render() {
		return <div className="model-views">
			<div className="model-panes">
				<DetailBar modelId={this.props.modelId}/>
				<TabularPane modelId={this.props.modelId}/>
			</div>
		</div>;
	}
}

