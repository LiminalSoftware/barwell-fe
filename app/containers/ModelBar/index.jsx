import React from "react"
import { Link } from "react-router"
import styles from "./style.less"

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
import ModelSection from './ModelSection'

import util from '../../util/util'

var ModelBar = React.createClass({

	componentWillMount: function () {
		ModelStore.addChangeListener(this._onChange)
		ViewStore.addChangeListener(this._onChange)
	},

	componentWillUnmount: function () {
		ModelStore.removeChangeListener(this._onChange)
		ViewStore.removeChangeListener(this._onChange)
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


	// HANDLERS ===============================================================
	
	handleAddModel: function (e) {
		modelActionCreators.createNewModel(this.props.workspaceId)
		e.preventDefault();
	},
	
	
	focus: function () {
		modelActionCreators.setFocus('view-config');
	},

	// RENDER =================================================================	

	render: function () {
		var curModelId = this.props.params.modelId
		var workspaceId = this.props.params.workspaceId
		var models  = ModelStore.query({workspace_id: workspaceId}, 'model');

		return <div className="mdlbar" onClick = {this.focus}>
			<h1 className="branding">metasheet.io</h1>
			<div className="mdlbar-list">
				{models.map((mdl, idx) => 
				<ModelSection
					{...this.props}
					index = {idx}
					key = {`model-link-${mdl.cid || mdl.model_id}`}
					model = {mdl}
					modelPath = {`/workspace/${workspaceId}/model/${mdl.model_id}`}/>
				)}
				<div className="mdlbar-adder" onClick = {this.handleAddModel}>
					<span  className="icon icon-plus"/>
					<span className="ellipsis">Add new dataset</span>
				</div>
			</div>
		</div>
	}

})
export default ModelBar