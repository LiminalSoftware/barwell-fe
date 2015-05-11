import React from "react";
import { Link } from "react-router";
import bw from "barwell";
import styles from "./style.less";


export default class SideBar extends React.Component {
	render() {
		var _this = this;
		var modelLinks = bw.ModelMeta.store.getObjects().map(function (mdl) {
			return <ModelLink model={mdl} {..._this.props}/>;
		});
		return <div className="left-side-bar">
			<ul>{modelLinks}</ul>
		</div>;
	}
}

class ViewLink extends React.Component {
	render() {
		var view = this.props.view;
		var viewId = view.synget(bw.DEF.VIEW_ID);
		var modelId = view.synget(bw.DEF.VIEW_MODELID);
		return <li key={"view-li-" + view.synget(bw.DEF.VIEW_ID)}>
			<Link to="view" params={{modelId: modelId, viewId: viewId}} key={"view-link-" + viewId}>
				{view.synget(bw.DEF.VIEW_NAME)}
			</Link></li>;
	}
}

export class ModelLink extends React.Component {
	render() {
		var _this = this;
		var mdl = this.props.model;
		var modelId = mdl.synget(bw.DEF.MODEL_ID);
		var defaultView = mdl.synget(bw.DEF.MODEL_PRIMARYVIEW);
		var views = mdl.synget('Views').map(function (view) {
			return <ViewLink view={view} model={mdl}/>;
		});
		
		return <li key={"mdl-li-" + modelId}>
			<Link to="view" params={{modelId: mdl.synget(bw.DEF.MODEL_ID), viewId: defaultView}} key={"model-link-" + modelId}>
				{mdl.synget(bw.DEF.MODEL_NAME)}
			</Link>
			<ul key={"model-views-ul-" + modelId} className={modelId == this.props.params.modelId ? 'active' : 'hidden'}>
				{views}
				<li key={"model-add-li-" + modelId}>
					<a key={"model-add-li-" + modelId}><span className="small grayed icon icon-plus"></span> New view</a>
				</li>
			</ul>
		</li>;
	}
}

