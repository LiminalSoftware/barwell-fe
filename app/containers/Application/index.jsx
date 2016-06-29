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

	componentDidMount: function () {
		this.fetchModels(this.props.params.workspaceId);
	},

	fetchModels: function (workspaceId, retry) {
		var _this = this
		
		modelActionCreators.fetchModels(workspaceId).then(function() {
			_this.setState({loading: false})
		})
	}

})

export default Application
