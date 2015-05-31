import React from "react"
import { Link } from "react-router"
import bw from "barwell"
import styles from "./style.less"
import _ from "underscore"

var SideBar = React.createClass({
	componentWillMount: function () {
		this.modelCursor = bw.models.getCursor({sortBy: 102})
		this.viewCursor = bw.views.getCursor({sortBy: bw.DEF.VIEW_NAME})
	},
	componentDidMount: function () {
		var curModelId = this.props.params.modelId
		this.modelCursor.on('fetch', this.handleFetch)
		this.modelCursor.on('add', this.handleFetch)
		this.modelCursor.on('remove', this.handleFetch)
		this.modelCursor.fetch()
		
		this.viewCursor.on('fetch', this.handleFetch)
		this.viewCursor.on('add', this.handleFetch)
		this.viewCursor.on('remove', this.handleFetch)
		this.viewCursor.fetch()
	},
	componentWillUnmount: function () {
		var curModelId = this.props.params.modelId
		this.modelCursor.release()
		this.modelCursor.removeListener('fetch', this.handleFetch)
		this.modelCursor.removeListener('add', this.handleFetch)
		this.modelCursor.removeListener('remove', this.handleFetch)
		
		this.viewCursor.release()
		this.viewCursor.removeListener('fetch', this.handleFetch)
		this.viewCursor.removeListener('add', this.handleFetch)
		this.viewCursor.removeListener('remove', this.handleFetch)
	},
	handleFetch: function () {
		this.forceUpdate()
	},
	render: function () {
		var _this = this;
		var curModelId = this.props.params.modelId
		var modelLinks = this.modelCursor.map(function (model, idx) {
			if (!model) return <li key={"loader-" + idx}><a>Loading</a></li>
			var modelId = model.synget(bw.DEF.MODEL_ID)
			return <ModelLink viewCursor = {_this.viewCursor} key={'model-link-' + modelId} model={model} active={curModelId == modelId}/>;
		});
		return <div className="left-side-bar">
			<ul>{modelLinks}</ul>
		</div>
	}
})
export default SideBar

var ModelLink = React.createClass ({
	render: function() {
		var _this = this
		var model = this.props.model
		var modelId = model.synget(bw.DEF.MODEL_ID)
		var defaultView = model.synget(bw.DEF.MODEL_PRIMARYVIEW)
		var sublist = []
		var views

		if (this.props.active) {
			views = this.props.viewCursor.map(function (view) {
				var viewId = view.synget(bw.DEF.VIEW_ID)
				var viewModelId = view.synget(bw.DEF.VIEW_MODELID)
				if (viewModelId !== modelId) return;
				return <ViewLink key={'view-link-' + viewId} view={view} model={model}/>	
			})
			views.push(<ViewAdder key={"model-view-adder-"+modelId} model={model} />)
		} else views = ""
		
		return <li>
			<ul key={"model-views-ul-" + modelId}>
				<li className={"li-model" + (this.props.active ? " li-hilite" : "")}>
					<Link to="model" params={{modelId: model.synget(bw.DEF.MODEL_ID)}} key={"model-link-" + modelId}>
						{model.synget(bw.DEF.MODEL_NAME)}
					</Link>
				</li>
				{views}
			</ul>
		</li>
	}
})

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
		return <li className="li-view" key={"view-li-" + view.synget(bw.DEF.VIEW_ID)}>
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
		return <li className="li-view li-hilite" key={"model-add-li-" + modelId}>
			<a className="addNew clickable" onClick={this.handleAddView}>
				<span className="small addNew icon icon-plus"></span> Create new view
			</a>
		</li>
	}
})

