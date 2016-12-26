import React, { Component, PropTypes } from 'react'
import _ from "underscore"

import { RouteHandler } from "react-router"
import ModelBar from "containers/ModelBar"
import ModelPane from "containers/ModelPane"
import Notifier from "../Notifier"
import styles from "./style.less"

import modelActionCreators from "../../actions/modelActionCreators"
import util from '../../util/util'
import constants from '../../constants/MetasheetConstants'

import ViewStore from "../../stores/ViewStore"
import ModelStore from "../../stores/ModelStore"
import FocusStore from "../../stores/FocusStore"

import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

import { DragDropContext } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'

const dummyStyle = {
	position: 'absolute',
	left: 0,
	top: 0,
	height: '1px',
	width: '1px'
}

@DragDropContext(HTML5Backend)
export default class Application extends Component {

	// LIFECYCLE ==============================================================

	constructor (props) {
		super(props)
		this.state = {loaded: false}
	}

	componentWillMount () {
		ModelStore.addChangeListener(this._onChange)
		ViewStore.addChangeListener(this._onChange)
		FocusStore.addChangeListener(this._onChange)
	}

	componentWillUnmount () {
		ModelStore.removeChangeListener(this._onChange)
		ViewStore.removeChangeListener(this._onChange)
		FocusStore.removeChangeListener(this._onChange)
	}

	_onChange = () => {
		this.forceUpdate()
	}

	componentDidMount = () => {
		this.fetchModels(this.props.params.workspaceId);
	}

	fetchModels = (workspaceId, retry) => {
		var _this = this
		
		modelActionCreators.fetchModels(workspaceId).then(function() {
			_this.setState({loaded: true})
		})
	}

	// UTILITY ================================================================

	

	// RENDER ===================================================================
	renderLoader () {
		return <div className = "loader-overlay"><div className="loader-hero">
			<span className="loader" style={{display: "inline-block", marginRight: 20, marginBottom: -8}}/>
			<span>Loading workspace data...</span>
		</div></div>
	}
	
	render () {
		const workspaceId = this.props.params.workspaceId
		const viewIdString = this.props.params.viewId
		const activeViews = viewIdString ? viewIdString.split(',')
			.map(id=>ViewStore.get(id))
			.filter(_.identity) : []
		const multiViews = activeViews.length > 1
		let left = 0

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

			<div className="model-views">

			{activeViews.map((v,idx)=>
			<ModelPane {...this.props}
				view={v}
				focus={FocusStore.getFocus()}
				model={ModelStore.get(v.model_id)}
				multiViews={multiViews}
				style={{left: 0, top: 0, right: 0, bottom: 0, position: "absolute"}}
				key={v.cid || v.view_id}/>)}
			</div>
			{
			this.state.loaded ?
			<Notifier/>
			: null
			}

			<textarea style = {dummyStyle} id = "copy-paste-dummy" value=""></textarea>
		</div>
	}

}