import React from "react";
import { RouteHandler } from "react-router";
import ModelBar from "containers/ModelBar";
import styles from "./style.less";
import modelActionCreators from "../../actions/modelActionCreators"
import util from '../../util/util'

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
		<div className="application ">
			<ModelBar {...this.props} workspaceId = {this.props.params.workspaceId}/>
			{this.props.children}
			<textarea style = {dummyStyle} id = "copy-paste-dummy" value=""></textarea>
		</div>;
	},

	// _onChange: function () {
	// 	this.forceUpdate()
	// },

	componentDidMount: function () {
	// 	ModelStore.addChangeListener(this._onChange)
		this.fetchModels(this.props.params.workspaceId)
	},

	// componentWillUnmount: function () {
	// 	ModelStore.removeChangeListener(this._onChange)
	// },

	// componentWillReceiveProps: function (newProps) {
	// 	if (newProps.params.workspaceId != this.props.params.workspaceId) this.fetchModels(newProps.params.workspaceId)
	// },

	fetchModels: function (workspaceId) {
		var _this = this
		console.log('workspaceId: ' + workspaceId)
		modelActionCreators.fetchModels(workspaceId).then(function() {
			_this.setState({loading: false})
		})
	}

})

export default Application
