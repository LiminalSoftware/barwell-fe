import React from "react"
import { Link } from "react-router"
import styles from "./style.less"
import subHeader from "./subHeader.less"

import _ from "underscore"

import modelActionCreators from '../../actions/modelActionCreators'
import MetasheetDispatcher from '../../dispatcher/MetasheetDispatcher'

import ModelStore from "../../stores/ModelStore"
import ModelConfigStore from "../../stores/ModelConfigStore";
import ViewStore from "../../stores/ViewStore"
import MetasheetConst from '../../constants/MetasheetConstants'

import PureRenderMixin from 'react-addons-pure-render-mixin';
import blurOnClickMixin from '../../blurOnClickMixin'

import viewTypes from '../Views/viewTypes'
import Notifier from '../Notifier'
import ModelContext from './ModelContext'

import util from '../../util/util'

var ModelBar = React.createClass({

	mixins: [PureRenderMixin],

	componentWillUnmount: function () {
		ModelStore.removeChangeListener(this._onChange)
	},

	componentWillMount: function () {
		ModelStore.addChangeListener(this._onChange)
		// modelActionCreators.fetchModels(this.props.workspaceId)
	},

	getInitialState: function () {
		return {
			keyControl: false,
			editing: false
		}
	},
	
	_onChange: function () {
		this.forceUpdate()
	},

	focus: function () {
		modelActionCreators.setFocus('view-config');
	},

	render: function () {
		var _this = this;
		var curModelId = this.props.params.modelId
		var workspaceId = this.props.params.workspaceId
		return <div className="model-bar" onClick = {this.focus}>
			<ModelList curModelId = {curModelId} workspaceId = {workspaceId}/>
		</div>
	}

})
export default ModelBar

var ModelList = React.createClass ({

	handleAddModel: function (e) {
		modelActionCreators.createNewModel(this.props.workspaceId)
		e.preventDefault();
	},

	render: function () {
		var _this = this
		var models  = ModelStore.query(null, 'model')

		return <div className="model-bar-container"> 
			<span className="model-bar-top"/>
			<div className = "model-bar-list">
			{
				models.map(function (model, idx) {
					var modelId = "" + (model.model_id || model.cid);
					return <ModelLink
						index = {idx}
						key = {'model-link-' + modelId}
						model = {model}
						last = {models.length - 1 === idx}
						active = {_this.props.curModelId === modelId}
						{..._this.movableProps} />;
				})
			}
			{
				models.length === 0 ?
					<span className = "model-bar-extra--left"> No models available </span>
					: null
			}
			<span className = "model-bar-extra--left"><a onClick = {this.handleAddModel}><span className = "icon icon-plus" /></a></span>
			</div>

			<div className = "model-bar-extras">
				<Notifier/>
			</div>

		</div>
	}
})

var ModelLink = React.createClass ({

	mixins: [blurOnClickMixin],

	getInitialState: function () {
		return {
			renaming: false,
			context: false
		}
	},

	_onChange: function (changeEvent) {
		this.forceUpdate()
	},

	focus: function () {
		modelActionCreators.setFocus('view-config');
	},

	handleCommit: function () {
		modelActionCreators.updateModel({
			model_id: this.props.model.model_id, 
			model: this.state.name
		})
		this.revert()
	},

	handleEdit: function () {
		var model = this.props.model;
		if (this.state.renaming) return
		this.setState({
			editing: true,
			context: false,
			name: model.model
		})
	},

	revert: function () {
		document.removeEventListener('keyup', this.handleKeyPress)
		this.setState({editing: false})
	},

	handleNameUpdate: function (e) {
		var name = e.target.value
		this.setState({name: name})
	},

	handleDelete: function (e) {
		modelActionCreators.destroy('model', true, this.props.model)
	},

	render: function () {
		var _this = this
		var model = this.props.model
		var model_id = model.model_id || model.cid
		var workspace_id = model.workspace_id
		var views

		var modelDisplay = (!!this.state.editing) ?
			(<input className="renamer header-renamer" ref="renamer" value={this.state.name} onChange={this.handleNameUpdate} onBlur={this.commitChanges}/>) :
			(<span>{model.model}</span>) ;

		return <span
			className="model-bar-tab "
			onClick = {util.clickTrap}>

			<Link to = {`/workspace/${workspace_id}/model/${model_id}`}
				className = {"model-bar-tab-link "
					+ (this.props.active ? " model-bar-tab-link--active " : "")
					+ (this.props.last ? " model-bar-tab-link--last " : "")}
				onContextMenu = {this.handleContext}
				onClick = {this.focus}
				onDoubleClick = {this.handleEdit}>
				{modelDisplay}
			</Link>
			{this.state.context ? <ModelContext 
				model = {this.props.model}
				_rename = {this.handleEdit}
				_delete = {this.handleDelete}/> : null}
		</span>
	}
})
