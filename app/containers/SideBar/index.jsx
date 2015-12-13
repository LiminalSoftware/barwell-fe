import React from "react"
import { Link } from "react-router"
import styles from "./style.less"
import subHeader from "./subHeader.less"

import _ from "underscore"

import Header from "../Header";

import modelActionCreators from '../../actions/modelActionCreators'
import MetasheetDispatcher from '../../dispatcher/MetasheetDispatcher'

import ModelStore from "../../stores/ModelStore"
import ViewStore from "../../stores/ViewStore"
import MetasheetConst from '../../constants/MetasheetConstants'

var PureRenderMixin = require('react/addons').addons.PureRenderMixin;

import viewTypes from '../Views/viewTypes'
import Notifier from '../Notifier'

var SideBar = React.createClass({

	mixins: [PureRenderMixin],

	componentWillUnmount: function () {
		ModelStore.removeChangeListener(this._onChange)
	},

	componentWillMount: function () {
		ModelStore.addChangeListener(this._onChange)
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
			<ModelList editing = {this.state.editing} curModelId = {curModelId} />
			{
				this.state.editing ?
				<div className="padded">
					<ul className="light padded mb-buttons">
						<li onClick={this.handleRevertEdit}>Done editing</li>
					</ul>
				</div>
				: null
			}
		</div>
	}

})
export default SideBar

var ModelList = React.createClass ({

	render: function () {
		var _this = this

		return <ul className="sidebar-model-list"> {
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
		}
		<li className="add-new"><a href="#">+</a></li>
		</ul>
	}
})

var ModelLink = React.createClass ({

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

		var modelDisplay = (!!this.state.renaming) ?
			(<input className="renamer header-renamer" ref="renamer" value={this.state.name} onChange={this.handleNameUpdate} onBlur={this.commitChanges}/>) :
			(<span>{model.model}</span>) ;

		if (model.lock_user)
			lock_icon = <span className="icon grayed icon-lock-close"
							title={'locked by ' + model.lock_user}></span>

		return <li className={(this.props.active ? "active " : "") + (this.props.editing ? " editmode" : "")}>
			{this.props.editing ? <span className="tight grayed draggable icon icon-Layer_2 model-reorder"></span> : null}

			<Link to="model" params={{modelId: model_id, workspaceId: workspace_id}} key={"model-link-" + model_id} onDoubleClick={this.edit}>
			{lock_icon}
			{modelDisplay}
			{this.props.editing && !this.props.renaming ?
				<span className="grayed right-align icon icon-kub-trash"></span> : null}
			{this.props.editing && !this.props.renaming ?
				<span className="grayed right-align icon icon-tl-pencil" onClick={this.edit}></span> : null}
			</Link>
		</li>
	}
})
