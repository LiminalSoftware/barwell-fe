import React from "react";
import $ from 'jquery'

import { RouteHandler } from "react-router"
import ModelBar from "containers/ModelBar"
import ModelPane from "containers/ModelPane"
import styles from "./style.less"
import modelActionCreators from "../../actions/modelActionCreators"
import util from '../../util/util'
import contant from '../../constants/MetasheetConstants'

import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

import Notifier from '../Notifier'

import ModelStore from "../../stores/ModelStore"

var Application = React.createClass({

	// LIFECYCLE ==============================================================

	getInitialState: function () {
		return {
			popUp: null,
			popUpConfig: null
		}
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

	// TODO: what is the role of ModelPane?  Could be refactored here
	render: function() {
		var dummyStyle = {
			position: 'absolute', 
			left: 0, 
			top: 0, 
			height: '1px', 
			width: '1px'
		}
		return <div style = {{overflow: "hidden"}}>
			<ReactCSSTransitionGroup className = "application"
			{...contant.transitions.slideIn}>
				{
				this.state.loaded ?
				<ModelBar 
					{...this.props} 
					_clearPopUp={this.clearPopUp}
					_showPopUp={this.showPopUp}
					workspaceId = {this.props.params.workspaceId}/>
				: null
				}
				{
				this.state.loaded ?
				<ModelPane {...this.props} 
					_clearPopUp={this.clearPopUp}
					_showPopUp={this.showPopUp}/>
				: 
				<div className = "hero-banner">
					<span className="three-quarters-loader"/>
					<h1 className = "hero-header">Loading workspace data...</h1>
				</div>
				}
			</ReactCSSTransitionGroup>
			{this.state.popUpPart ?
				React.createElement(this.state.popUpPart, this.state.popUpConfig)
				: null 
			}

			<textarea style = {dummyStyle} id = "copy-paste-dummy" value=""></textarea>
		</div>
	}

})

export default Application
