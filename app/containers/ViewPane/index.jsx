import React from "react";
import { RouteHandler } from "react-router";
import DetailBar from "containers/DetailBar";
import TabularPane from "containers/Views/Tabular/Main";
import bw from "barwell";
import styles from "./style.less";

var ModelPane = React.createClass({
	render: function() {
		var view = bw.MetaView.store.synget(901, this.props.params.viewId);;
		var model = bw.ModelMeta.store.synget(101, this.props.params.modelId);

		this.view = view;
		return <div className="model-views">
			<div className="model-panes">
				<DetailBar model={model} view={view} />
				<TabularPane model={model} view={view} />
			</div>
		</div>;
	}
});

export default ModelPane;