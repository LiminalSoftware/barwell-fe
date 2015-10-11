import React from "react";
import { RouteHandler } from "react-router";
import SideBar from "containers/SideBar";
import styles from "./style.less";
import modelActionCreators from "../../actions/modelActionCreators"

var Application = React.createClass({

	getInitialState: function () {
		return {hiddenSidebar: false}
	},

	render: function() {
		return <div className="application ">
			<div className={"app-container " + (this.state.hiddenSidebar ? "hide-sidebar" : "")}>
				<SideBar {...this.props} />
				<RouteHandler {...this.props} />
			</div>
		</div>;
	},

	componentWillMount: function () {
		modelActionCreators.fetchModels(this.props.params.workspaceId)
	},

	componentWillReceiveProps: function (newProps) {
		if (newProps.params.workspaceId != this.props.params.workspaceId)
			modelActionCreators.fetchModels(newProps.params.workspaceId)
	},

	toggleSidebar: function() {
		this.setState({
			hiddenSidebar: !this.state.hiddenSidebar
		})
	}
})

export default Application
