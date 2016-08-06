import React from "react";
import $ from 'jquery'
import _ from "underscore"

import { RouteHandler } from "react-router"
import ModelBar from "containers/ModelBar"
import ModelPane from "containers/ModelPane"
import styles from "./style.less"

import modelActionCreators from "../../actions/modelActionCreators"
import util from '../../util/util'
import contant from '../../constants/MetasheetConstants'

import ViewStore from "../../stores/ViewStore"
import ModelStore from "../../stores/ModelStore"

import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

import Notifier from '../Notifier'

const dummyStyle = {
	position: 'absolute',
	left: 0,
	top: 0,
	height: '1px',
	width: '1px'
}

var Application = React.createClass({

	// LIFECYCLE ==============================================================

	getInitialState: function () {
		return {loaded: false}
	},

	componentDidMount: function () {
		this.fetchModels(this.props.params.workspaceId);
	},

	fetchModels: function (workspaceId, retry) {
		var _this = this
		
		modelActionCreators.fetchModels(workspaceId).then(function() {
			_this.setState({loaded: true})
		})
	},

	// UTILITY ================================================================

	

	// RENDER ===================================================================
	renderLoader: function () {
		return <div className = "hero-banner">
			<span className="three-quarters-loader"/>
			<h1 className = "hero-header">Loading workspace data...</h1>
		</div>
	},
	
	render: function() {
		const workspaceId = this.props.params.workspaceId
		const viewIdString = this.props.params.viewId
		const views = viewIdString.split(',').map(id=>ViewStore.get(id))
		const multiViews = views.length > 1

		return <div className = "application">
			{
			this.state.loaded ?
			<ModelBar {...this.props}
				workspaceId = {workspaceId}/>
			: this.renderLoader()
			}

			{views.filter(_.identity).map(v=>
			<ModelPane {...this.props} 
				view={v}
				multiViews={multiViews}
				key={v.view_id}/>)}

			<textarea style = {dummyStyle} id = "copy-paste-dummy" value=""></textarea>
		</div>
	}

})

export default Application
