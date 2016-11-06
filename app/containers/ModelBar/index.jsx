import React from "react"
import { Link } from "react-router"

import styles from "./style.less"

import modelActionCreators from '../../actions/modelActionCreators'
import MetasheetDispatcher from '../../dispatcher/MetasheetDispatcher'

import ModelStore from "../../stores/ModelStore"
import ModelConfigStore from "../../stores/ModelConfigStore";
import ViewStore from "../../stores/ViewStore"
import FocusStore from "../../stores/FocusStore"

import MetasheetConst from '../../constants/MetasheetConstants'

import PureRenderMixin from 'react-addons-pure-render-mixin';
import blurOnClickMixin from '../../blurOnClickMixin'

import viewTypes from '../../Views/viewTypes'
import Notifier from '../Notifier'
import ModelContext from './ModelContext'
import ModelSection from './ModelSection'

import util from '../../util/util'

var ModelBar = React.createClass({

	
	getInitialState: function () {
		return {
			keyControl: false,
			editing: false
		}
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
		const workspaceId = this.props.params.workspaceId
		const models  = ModelStore.query({workspace_id: workspaceId}, 'model');
		const activeViews = this.props.activeViews
		const focus = FocusStore.getFocus()
		const focusedViewId = (/^v\d+/).test(focus) ? parseInt(focus.slice(1)) : null

		return <div className="mdlbar" onClick = {this.focus}>
			<h1 className="branding">metasheet.io</h1>
			<div className="mdlbar-list">
				{models.map((mdl, idx) => 
				<ModelSection
					{...this.props}
					index = {idx}
					activeViews = {this.props.activeViews}
					focusedViewId = {focusedViewId}
					key = {`model-link-${mdl.cid || mdl.model_id}`}
					model = {mdl}
					modelPath = {`/workspace/${workspaceId}/model/${mdl.model_id}`}/>
				)}
				<div className="mdlbar-adder" onClick = {this.handleAddModel}>
					<span  className="icon icon-plus"/>
					<span className="ellipsis">Add new dataset</span>
				</div>
			</div>
			<Notifier {...this.props}/>
		</div>
	}

})
export default ModelBar