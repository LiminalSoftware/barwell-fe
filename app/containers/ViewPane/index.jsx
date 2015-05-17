import React from "react";
import { RouteHandler } from "react-router";
import DetailBar from "containers/DetailBar";
import TabularPane from "containers/Views/Tabular/Main";
import bw from "barwell";
import styles from "./style.less";
import prepTabularView from "../Views/Tabular/validateView";

export default class ModelPane extends React.Component {
	render() {
		var view = bw.MetaView.store.synget(901, this.props.params.viewId);
		var model = bw.ModelMeta.store.synget(101, this.props.params.modelId);
		
		if (!!view) prepTabularView(view);
		
		return <div className="model-views">
			<div className="model-panes">
				<DetailBar model={model} view={view} />
				<TabularPane model={model} view={view} />
			</div>
		</div>;
	}
}

