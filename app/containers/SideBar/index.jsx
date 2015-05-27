import React from "react"
import { Link } from "react-router"
import bw from "barwell"
import styles from "./style.less"
import _ from "underscore"

var SideBar = React.createClass({ 
	getInitialState: function () {
		return {
			hidden: false,
			addingView: false
		}
	},

	handleHide: function () {
		this.setState({hidden: true})
	},

	render: function () {
		var _this = this;
		var modelLinks = bw.ModelMeta.store.getObjects().map(function (mdl) {
			return <ModelLink model={mdl} {..._this.props}/>;
		});
		return <div className="left-side-bar">
			<ul>{modelLinks}</ul>
			<a className="hide-button" onClick = {this.handleHide}><span className="icon icon-minimise"></span>Hide side bar</a>
		</div>
	}
})
export default SideBar

var ViewLink = React.createClass({
	render: function () {
		var view = this.props.view;
		var viewId = view.synget(bw.DEF.VIEW_ID);
		var modelId = view.synget(bw.DEF.VIEW_MODELID);
		return <li key={"view-li-" + view.synget(bw.DEF.VIEW_ID)}>
			<Link to="view" params={{modelId: modelId, viewId: viewId}} key={"view-link-" + viewId}>
				{view.synget(bw.DEF.VIEW_NAME)}
			</Link></li>;
	}
})

var ModelLink = React.createClass ({
	render: function() {
		var _this = this
		var model = this.props.model
		var modelId = model.synget(bw.DEF.MODEL_ID)
		var defaultView = model.synget(bw.DEF.MODEL_PRIMARYVIEW)
		var views = model.synget('Views').map(function (view) {
			return <ViewLink view={view} model={model}/>;
		})
		
		return <li key={"model-li-" + modelId}>
			<Link to="view" params={{modelId: model.synget(bw.DEF.MODEL_ID), viewId: defaultView}} key={"model-link-" + modelId}>
				{model.synget(bw.DEF.MODEL_NAME)}
			</Link>
			<ul key={"model-views-ul-" + modelId} className={modelId == this.props.params.modelId ? 'active' : 'hidden'}>
				{views}
				<ViewAdder key={"model-view-adder-"+modelId} model={model} />
			</ul>
		</li>
	}
})


var viewTypes = {
	Tabular: {
		type: "Tabular",
		icon: "icon-geo-sq-grid"
	},
	Cube: {
		type: "Cube",
		icon: "icon-geo-cube"
	},
	Calendar: {
		type: "Calendar",
		icon: "icon-calendar-selected"
	},
	Timeline : {
		type: "Timeline",
		icon: "icon-movie"
	}
}

var ViewAdder = React.createClass ({
	getInitialState: function () {
		return {
			addingView: false
		}
	},

	handleAddView: function() {
		this.setState({addingView: true});
	},

	cancelAddView: function() {
		this.setState({addingView: false});
	},

	makeViewCreationHandler: function (type) {
		return null;
	},

	render: function () {
		var _this = this
		var model = this.props.model
		var modelId = model.synget(bw.DEF.MODEL_ID)

		if (!this.state.addingView) {
			return <li key={"model-add-li-" + modelId}>
				<a href="#" onClick={this.handleAddView}><span className="small grayed icon icon-plus"></span> New view</a>
			</li>
		}
		else {
			var options = _.map(viewTypes, function (details, type) {
				var key = "new-view-option-" + type
				return <li key={key} className="new-view-choice">
				<a href="#" onClick={_this.handleAddView}>
					<span className={"icon " + details.icon}></span> {type}
				</a></li>
			})
			options.unshift(<li key="new-view-placeholder">
				<a className="active" href="#"><span className="icon icon-geo-square-br"></span>New View</a>
			</li>)
			return <li key={"model-add-li-" + modelId}>
				<ul className="view-type-options">
					{options}
					<li key="new-view-cancel"><a className="clickable" onClick={this.cancelAddView}>
						<span className="reddened icon icon-cr2-delete"></span>Cancel
					</a></li>
				</ul>
			</li>
		}
	}
})

