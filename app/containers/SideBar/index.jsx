import React from "react"
import { Link } from "react-router"
import styles from "./style.less"
import _ from "underscore"

import Header from "../Header";

import modelActionCreators from '../../actions/modelActionCreators'
import MetasheetDispatcher from '../../dispatcher/MetasheetDispatcher'

import ModelStore from "../../stores/ModelStore"
import ViewStore from "../../stores/ViewStore"
import MetasheetConst from '../../constants/MetasheetConstants'

var PureRenderMixin = require('react/addons').addons.PureRenderMixin;
var sortable = require('react-sortable-mixin');

import viewTypes from '../Views/viewTypes'
import Notifier from '../Notifier'

var SideBar = React.createClass({

	mixins: [PureRenderMixin],

	componentWillUnmount: function () {
		ModelStore.removeChangeListener(this._onChange)
		ViewStore.removeChangeListener(this._onChange)
	},

	componentWillMount: function () {
		ModelStore.addChangeListener(this._onChange)
		ViewStore.addChangeListener(this._onChange)
	},

	_onChange: function () {
		this.forceUpdate()
	},

	getInitialState: function () {
		return {
			keyControl: false,
			editing: false
		}
	},

	handleAddModel: function (event) {
		var model = {
			model: 'New model',
			plural: 'New models'
		}
		modelActionCreators.create('model', true, model)
		event.preventDefault();
	},

	handleEdit: function (event) {
		this.setState({editing: true});
	},

	handleRevertEdit: function (event) {
		this.setState({editing: false});
	},

	render: function () {
		var _this = this;
		var curModelId = this.props.params.modelId
		return <div className="left-side-bar">
			<Header />
			<div className="sidebar-sub-header">
				<h2>Databases</h2>
				<ul className="dark mb-buttons">
					<li onClick={this.handleEdit}>Edit</li>
					<li onClick={this.handleAddModel}>+</li>
				</ul>
			</div>
			<ModelList editing = {this.state.editing} curModelId = {curModelId} />
			{
				this.state.editing ?
				<div className="padded">
					<ul className="dark mb-buttons">
						<li onClick={this.handleRevertEdit}>Done editing</li>
					</ul>
				</div>
				: null
			}

			<Notifier/>
		</div>
	}

})
export default SideBar

var ModelList = React.createClass ({
	mixins: [sortable.ListMixin],

	render: function () {
		var _this = this
		return <ul className="sidebar-model-list">{
			ModelStore.query(null, ['model']).map(function (model, idx) {
				var modelId = model.cid || model.model_id;
				return <ModelLink
					index = {idx}
					key = {'model-link-' + modelId}
					model = {model}
					editing = {_this.props.editing}
					active = {_this.props.curModelId == modelId}
					{..._this.movableProps} />;
			})
		}</ul>
	}
})

var ModelLink = React.createClass ({

	mixins: [sortable.ItemMixin],

	getInitialState: function () {
		return {renaming: false}
	},

	_onChange: function (changeEvent) {
		this.forceUpdate()
	},

	commitChanges: function () {
		var model = this.props.model;
		model.model = this.state.name
		modelActionCreators.createModel(model)
		this.revert()
	},

	cancelChanges: function () {
		this.revert()
	},

	edit: function () {
		var model = this.props.model;
		if (this.state.renaming) return
		this.setState({
			renaming: true,
			name: model.model
		}, function () {
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
	},

	handleNameUpdate: function (event) {
		var name = event.target.value
		this.setState({name: name})
	},

	handleDelete: function (event) {

	},

	render: function() {
		var _this = this
		var model = this.props.model
		var model_id = model.cid || model.model_id
		var workspace_id = model.workspace_id
		var views
		var lock_icon

		console.log('workspace_id: ' + workspace_id)

		var modelDisplay = (!!this.state.renaming) ?
			(<input className="model-renamer" ref="renamer" value={this.state.name} onChange={this.handleNameUpdate} onBlur={this.commitChanges}/>) :
			(<span>{model.model}</span>) ;

		if (model.lock_user)
			lock_icon = <span className="icon grayed icon-lock-close"
							title={'locked by ' + model.lock_user}></span>

		return <li className={(this.props.active ? "active " : "") + (this.props.editing ? " editmode" : "")}>
			{this.props.editing ? <span className="draggable icon icon-Layer_2 model-reorder"></span> : null}

			<Link to="model" params={{modelId: model_id, workspaceId: workspace_id}} key={"model-link-" + model_id} onDoubleClick={this.edit}>
			{lock_icon}
			{modelDisplay}
			{this.props.editing && !this.props.renaming ? <span className="grayed right-align icon icon-trash"></span> : null}
			{this.props.editing && !this.props.renaming ? <span className="grayed right-align icon icon-tl-pencil" onClick={this.edit}></span> : null}
			{this.props.active && !this.props.editing ? <span className="icon right-align icon-chevron-right"></span> : null}
			</Link>
		</li>
	}
})

var ViewLink = React.createClass({

	componentDidMount: function () {
		var _this = this
		var view = this.props.view;
		setTimeout(function () {
			view._new = false;
			modelActionCreators.create('view', false, view)
		}, 0)
	},

	getInitialState: function () {
		return {
			renaming: false,
			isnew: true
		}
	},

	handleClick: function (e) {
		modelActionCreators.setFocus('sidebar')
	},

	handleNameUpdate: function (e) {
		var name = e.target.value
		this.setState({name: name})
	},

	handleDelete:function (event) {
		var view = this.props.view;
		modelActionCreators.destroyView(view)
		event.preventDefault();
	},



	render: function () {
		var view = this.props.view;
		var model = this.props.model;
		var viewDisplay = (!!this.state.renaming) ?
			(<input className="view-renamer" ref="renamer" value={this.state.name} onChange={this.handleNameUpdate} onBlur={this.commitChanges}/>) :
			(<span>{view.view}</span>) ;

		return <li className={"li-view " + (view._new ? "new" : "")} >
			<Link to="view" params={{modelId: model.model_id, viewId: (view.view_id || view.cid), workspaceId: 123}}
				onDoubleClick={this.edit} onClick={this.handleClick}>
				<span className={"icon "+viewTypes[view.type].icon}></span>{viewDisplay}
			</Link>
			<span className="view-delete grayed icon icon-kub-trash" onClick={this.handleDelete}></span>
			</li>;
	},

	commitChanges: function () {
		var view = this.props.view;
		var model = this.props.model;
		view.view = this.state.name

		modelActionCreators.createView(view)
		this.revert()
	},

	cancelChanges: function () {
		this.revert()
	},

	edit: function () {
		var view = this.props.view;
		if (this.state.renaming) return
		this.setState({renaming: true, name: view.view}, function () {
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

	handleAddView: function(event) {
		var model = this.props.model
		var view = {
			_new: true,
			model_id: model.model_id,
			view: (model.model + ' - New view'),
		}
		modelActionCreators.createView(view, true, true)
		event.preventDefault()
	},

	render: function () {
		var _this = this
		var model = this.props.model

		return <li className="li-view li-hilite">
			<a herf="#" className="addNew clickable" onClick={this.handleAddView}>
				<span className="small addNew icon icon-plus"></span> Create new view
			</a>
		</li>
	}

})
