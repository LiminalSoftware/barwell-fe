import React from "react";
import { RouteHandler } from "react-router";
import DetailBar from "containers/DetailBar";
import TabularPane from "containers/Views/Tabular/Main";
import bw from "barwell";
import styles from "./style.less";

var ModelPane = React.createClass({
	render: function() {
		var viewId = this.props.params.viewId
		var view = !!viewId ? bw.MetaView.store.synget(901, this.props.params.viewId) : null
		var model = bw.ModelMeta.store.synget(101, this.props.params.modelId)
		var body
		
		this.view = view

		if (!!view) body = <TabularPane 
			key={"tabular-pane-"+viewId} 
			model={model} 
			view={view} />
		else body = <div className="no-view-content view-body-wrapper">
			<span className="icon icon-face-dark-nomimic"></span>No view selected
		</div>
		
		return <div className="model-views">
			<div className="model-panes">
				<DetailBar 
					model={model} 
					view={view} />
				{body}
			</div>
		</div>;
	}
});

export default ModelPane;