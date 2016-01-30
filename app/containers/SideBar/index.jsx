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

import PureRenderMixin from 'react-addons-pure-render-mixin';

import viewTypes from '../Views/viewTypes'
import Notifier from '../Notifier'

var SideBar = React.createClass({

	mixins: [PureRenderMixin],

	componentWillUnmount: function () {
		ModelStore.removeChangeListener(this._onChange)
	},

	componentWillMount: function () {
		ModelStore.addChangeListener(this._onChange)
		modelActionCreators.fetchModels(this.props.workspaceId)
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
		return <div className="left-side-bar">
			<ModelList curModelId = {curModelId} workspaceId = {workspaceId}/>
		</div>
	}

})
export default SideBar

var ModelList = React.createClass ({

	handleAddModel: function (e) {
		var name = 'New model'
		var workspaceId = this.props.workspaceId
		var iter = 0
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
		<li className="clickable add-new"><a onClick = {this.handleAddModel}>+</a></li>
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

		var modelDisplay = (!!this.state.renaming) ?
			(<input className="renamer header-renamer" ref="renamer" value={this.state.name} onChange={this.handleNameUpdate} onBlur={this.commitChanges}/>) :
			(<span>{model.model}</span>) ;

		return <li
			className={(this.props.active ? "active " : "") + (this.props.editing ? " editmode" : "")}>

			<Link to = {`/workspace/${workspace_id}/model/${model_id}`}
				onDoubleClick = {this.edit}>
				{modelDisplay}
			</Link>
		</li>
	}
})
