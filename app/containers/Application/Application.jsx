import React, { Component, PropTypes } from 'react'
import { Provider, connect } from 'react-redux'
import _ from "underscore"



// COMPONENTS
import CopyPasteDummy from "./CopyPasteDummy"
import ModelBar from "containers/ModelBar"
import ViewPane from "containers/ViewPane"
import Notifier from "../Notifier"
import { RouteHandler } from "react-router"

// STYLES
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




@DragDropContext(HTML5Backend)
export default class Application extends Component {

	// LIFECYCLE ==============================================================

	constructor (props) {
		super(props)
		this.state = {
			loaded: false,
			isSidebarHidden: false
		}
	}

	componentDidMount = () => {
		this.fetchWorkspace(this.props.params.workspaceId);
	}

	fetchWorkspace = (workspaceId, retry) => {
		var _this = this

		modelActionCreators.fetchWorkspace(workspaceId).then(function() {
			_this.setState({loaded: true})
		})
	}

	toggleSidebar = () => {
		this.setState({isSidebarHidden: !this.state.isSidebarHidden})
	}

	// UTILITY ================================================================



	// RENDER ===================================================================


	render () {
		const {views, models, focus, history} = this.props
		const {workspaceId, viewId = ''} = this.props.params
		const activeViewIds =
			viewId.split(',')
			.filter( id => id in views.byKey)

		console.log('viewId: ' + viewId)

		if (!this.state.loaded)
		return <div className = "loader-overlay" key="application">
			<div className="loader-hero">
			<span className="loader"  style={{display: "inline-block", marginRight: 20, marginBottom: -8}}/>
			<span>Loading workspace data...</span>
			<CopyPasteDummy key="copy-paste-dummy"/>
		</div></div>

		return <div className="application" id="application">

				<ModelBar
					history={history}
					activeViewIds={activeViewIds}
					workspaceId={workspaceId}/>

				<div className="model-views">

					{activeViewIds.map(id => views.byKey[id]).map((v,idx) =>
					<ViewPane
						view={v}
						model={models.byKey[v.model_id]}
						focus={focus}
						style={{left: 0, top: 0, right: 0, bottom: 0}}
						key={v.view_id}/>)}
				</div>

				<Notifier/>

				<CopyPasteDummy key="copy-paste-dummy"/>
		</div>

	}

}
