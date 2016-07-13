import React from "react";
import { RouteHandler } from "react-router";
import ModelBar from "containers/ModelBar";
import styles from "./style.less";
import modelActionCreators from "../../actions/modelActionCreators"
import util from '../../util/util'
import contant from '../../constants/MetasheetConstants'

import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import Notifier from '../Notifier'

import ModelStore from "../../stores/ModelStore"

var Application = React.createClass({

	getInitialState: function () {
		return {
			hiddenSidebar: false,
			loaded: false
		}
	},

	render: function() {
		var dummyStyle = {
			position: 'absolute', 
			left: 0, 
			top: 0, 
			height: '1px', 
			width: '1px'
		}
		return <ReactCSSTransitionGroup
			{...contant.transitions.slideIn}
			className= "application" id = "application">
			<textarea style = {dummyStyle} id = "copy-paste-dummy" value=""></textarea>
			{
				this.state.loaded ?
				this.props.children
				: <div className = "hero-banner">
					<span className="three-quarters-loader"/>
					<h1 className = "hero-header">Loading workspace data...</h1>
				</div>
			}
			{
				this.state.loaded ?
				<ModelBar {...this.props} workspaceId = {this.props.params.workspaceId}/>
				: null
			}
			
		</ReactCSSTransitionGroup>;
	},

	componentDidMount: function () {
		this.fetchModels(this.props.params.workspaceId);
	},

	fetchModels: function (workspaceId, retry) {
		var _this = this
		
		modelActionCreators.fetchModels(workspaceId).then(function() {
			_this.setState({loaded: true})
		})
	}

})

export default Application
