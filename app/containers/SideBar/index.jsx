import React from "react"
import { Link } from "react-router"
import bw from "barwell"
import styles from "./style.less"
import _ from "underscore"

var SideBar = React.createClass({
	getInitialState: function () {
		return {
			addingView: false
		}
	},

	render: function () {
		var _this = this;
		var modelLinks = bw.ModelMeta.store.getObjects().map(function (mdl) {
			return <ModelLink model={mdl} {..._this.props}/>;
		});
		return <div className="left-side-bar">
			<ul>{modelLinks}</ul>
		</div>
	}
})
export default SideBar

var ViewLink = React.createClass({
	getInitialState: function () {
		var view = this.props.view
		var viewName = view.synget(bw.DEF.VIEW_NAME)
		return {
			renaming: false,
			name: viewName
		}
	},
	handleNameUpdate: function (e) {
		var name = e.target.value
		this.setState({name: name})
	},
	render: function () {
		var view = this.props.view;
		var viewId = view.synget(bw.DEF.VIEW_ID);
		var modelId = view.synget(bw.DEF.VIEW_MODELID)
		var viewName = view.synget(bw.DEF.VIEW_NAME)
		var viewData = view.synget(bw.DEF.VIEW_DATA)
		var key = "view-link-" + viewId
		var viewDisplay = (!!this.state.renaming) ?  
			(<input className="view-renamer" ref="renamer" value={this.state.name} onChange={this.handleNameUpdate} onBlur={this.commitChanges}/>) : 
			(<span>{this.state.name}</span>) ;
		return <li key={"view-li-" + view.synget(bw.DEF.VIEW_ID)}>
			<Link to="view" params={{modelId: modelId, viewId: viewId}} key={key} onDoubleClick={this.edit} >
				<span className={"icon "+viewData.icon}></span>{viewDisplay}
			</Link></li>;
	},
	commitChanges: function () {
		var view = this.props.view;
		view.set(bw.DEF.VIEW_NAME, this.state.name)
		this.revert()
	},
	cancelChanges: function () {
		var view = this.props.view
		var name = view.synget(bw.DEF.VIEW_NAME)
		this.setState({name: name})
		this.revert()
	},
	edit: function () {
		var view = this.props.view;
		var viewId = view.synget(bw.DEF.VIEW_ID);
		if (this.state.renaming) return
		this.setState({renaming: true}, function () {
			React.findDOMNode(this.refs.renamer).focus();
		})
		document.addEventListener('keyup', this.handleKeyPress)
	},
	revert: function () {
		document.removeEventListener('keyup', this.handleKeyPress)
		this.setState({renaming: false})
	},
	handleKeyPress: function (event) {
		if (event.keyCode === 27) this.cancelChanges()
		if (event.keyCode === 13) this.commitChanges()
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


var ViewAdder = React.createClass ({
	
	handleAddView: function() {
		var model = this.props.model
		var modelId = model.synget(bw.DEF.MODEL_ID)
		bw.MetaView.instantiate({
			902: modelId,
			904: {"type":'Tabular', "icon": 'icon-db-datasheet'},
			905: "New view"
		})
	},

	render: function () {
		var _this = this
		var model = this.props.model
		var modelId = model.synget(bw.DEF.MODEL_ID)
		
		return <li key={"model-add-li-" + modelId}>
			<a href="#" onClick={this.handleAddView}><span className="small grayed icon icon-plus"></span> New view</a>
		</li>
	}
})

