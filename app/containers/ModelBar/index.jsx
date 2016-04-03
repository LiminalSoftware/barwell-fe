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

	_onChange: function () {
		this.forceUpdate()
	},

	getInitialState: function () {
		return {
			keyControl: false,
			editing: false
		}
	},

	render: function () {
		var _this = this;
		var curModelId = this.props.params.modelId
		var workspaceId = this.props.params.workspaceId
		return <div className="model-bar">
			<ModelList curModelId = {curModelId} workspaceId = {workspaceId}/>
		</div>
	}

})
export default ModelBar

var ModelList = React.createClass ({

	handleAddModel: function (e) {
		var name = 'New model'
		var workspaceId = this.props.workspaceId
		var iter = 1
		while (ModelStore.query({workspace_id: workspaceId, model: name}).length > 0) {
			name = 'New model ' + (iter++)
		}
		modelActionCreators.create('model', true, {
			model: name,
			workspace_id: workspaceId,
			plural: 'New models'
		})
		e.preventDefault();
	},

	render: function () {
		var _this = this

		return <ul className="model-bar-list"> {
			ModelStore.query(null, ['model']).map(function (model, idx) {
				var modelId = "" + (model.model_id || model.cid);
				return <ModelLink
					index = {idx}
					key = {'model-link-' + modelId}
					model = {model}
					active = {_this.props.curModelId === modelId}
					{..._this.movableProps} />;
			})
		}
		<li className="clickable add-new"><a onClick = {this.handleAddModel}><span className = "icon icon-plus" style={{fontSize: '14px'}}/></a></li>
		</ul>
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

	handleCommit: function () {
		var model = this.props.model;
		model.model = this.state.name
		modelActionCreators.createModel(model)
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

	doDelete: function (e) {
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

		return <li
			className={(this.props.active ? "active " : "") + (this.props.editing ? " editmode" : "")}
			onClick = {util.clickTrap}>

			<Link to = {this.props.active ? '' : `/workspace/${workspace_id}/model/${model_id}`}
				onContextMenu = {this.handleContext}
				onDoubleClick = {this.handleEdit}>
				{modelDisplay}
			</Link>
			{this.state.context ? <ModelContext 
				model = {this.props.model} 
				_rename = {this.handleEdit}
				_delete = {this.doDelete}/> : null}
		</li>
	}
})
