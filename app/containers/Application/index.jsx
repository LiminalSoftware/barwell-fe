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
import FocusStore from "../../stores/FocusStore"

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

	componentWillMount: function () {
		ModelStore.addChangeListener(this._onChange)
		ViewStore.addChangeListener(this._onChange)
		FocusStore.addChangeListener(this._onChange)
	},

	componentWillUnmount: function () {
		ModelStore.removeChangeListener(this._onChange)
		ViewStore.removeChangeListener(this._onChange)
		FocusStore.removeChangeListener(this._onChange)
	},

	_onChange: function () {
		this.forceUpdate()
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
		const activeViews = viewIdString ? viewIdString.split(',').map(id=>ViewStore.get(id)) : []
		const multiViews = activeViews.length > 1

		return <div className = "application" id="application">
			{
			this.state.loaded ?
			<ModelBar 
				{...this.props}
				focus={FocusStore.getFocus()}
				activeViews={activeViews}
				workspaceId = {workspaceId}/>
			: this.renderLoader()
			}

			{activeViews.filter(_.identity).map(v=>
			<ModelPane {...this.props} 
				view={v}
				focus={FocusStore.getFocus()}
				model={ModelStore.get(v.model_id)}
				multiViews={multiViews}
				key={v.view_id}/>)}

			<textarea style = {dummyStyle} id = "copy-paste-dummy" value=""></textarea>
		</div>
	}

})

export default Application
