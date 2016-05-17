import React from "react";
import { RouteHandler } from "react-router";
import ModelBar from "containers/ModelBar";
import styles from "./style.less";
import modelActionCreators from "../../actions/modelActionCreators"
import util from '../../util/util'

import Notifier from '../Notifier'

import ModelStore from "../../stores/ModelStore"

var Application = React.createClass({

	getInitialState: function () {
		return {
			hiddenSidebar: false,
			loading: false
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
		return this.state.loading ? 
		<div className = "application application--loading">
			<div className = "loading-notice">
				<span className="three-quarters-loader"></span>
				Loading data...
			</div>
		</div> 
		:
		<div className="application " id="application">
			<textarea style = {dummyStyle} id = "copy-paste-dummy" value=""></textarea>
			{this.props.children}
			<Notifier {...this.props}/>
			<ModelBar {...this.props} workspaceId = {this.props.params.workspaceId}/>
		</div>;
	},

	// _onChange: function () {
	// 	this.forceUpdate()
	// },

	componentDidMount: function () {
	// 	ModelStore.addChangeListener(this._onChange)
		
		this.fetchModels(this.props.params.workspaceId);
	},

	// componentWillUnmount: function () {
	// 	ModelStore.removeChangeListener(this._onChange)
	// },

	// componentWillReceiveProps: function (newProps) {
	// 	if (newProps.params.workspaceId != this.props.params.workspaceId) this.fetchModels(newProps.params.workspaceId)
	// },

	fetchModels: function (workspaceId) {
		var _this = this

		modelActionCreators.createNotification({
			copy: 'Fetching workspace details', 
			type: 'loading',
			icon: ' icon-sync spin ',
			notification_key: 'workspaceLoad',
			notificationTime: 0
		});
		modelActionCreators.fetchModels(workspaceId).then(function() {
			_this.setState({loading: false})
		}).then(function () {
			modelActionCreators.clearNotification({
				notification_key: 'workspaceLoad'
			})
		}).catch(function (error) {
			modelActionCreators.createNotification({
				copy: 'Error loading workspace details: ' + JSON.stringify(error), 
				type: 'error',
				icon: ' icon-warning ',
				notification_key: 'workspaceError'
			});
		});
	}

})

export default Application
