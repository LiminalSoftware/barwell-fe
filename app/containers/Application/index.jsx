import React from "react";
import { RouteHandler } from "react-router";
import SideBar from "containers/SideBar";
import styles from "./style.less";
import modelActionCreators from "../../actions/modelActionCreators"
import util from '../../util/util'

var Application = React.createClass({

	getInitialState: function () {
		return {hiddenSidebar: false}
	},

	render: function() {
		var dummyStyle = {
			position: 'absolute', 
			left: 0, 
			top: 0, 
			height: '1px', 
			width: '1px'
		}
		return <div className="application ">
				<SideBar {...this.props} workspaceId = {this.props.params.workspaceId}/>
				{this.props.children}
				<textarea style = {dummyStyle} id = "copy-paste-dummy" value=""></textarea>
		</div>;
	},

	componentWillReceiveProps: function (newProps) {
		if (newProps.params.workspaceId != this.props.params.workspaceId)
			modelActionCreators.fetchModels(newProps.params.workspaceId)
	}

})

export default Application
