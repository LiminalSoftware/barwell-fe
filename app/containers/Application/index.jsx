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

		// var { loading } = this.props;
		this.props.toggleSidebar = this.toggleSidebar
		return <div className="application ">

			<div className={"app-container " + (this.state.hiddenSidebar ? "hide-sidebar" : "")}>

				<SideBar {...this.props} />
				<RouteHandler {...this.props} />
			</div>
		</div>;
	},

	componentWillMount: function () {
		// modelActionCreators.setWorkspace(this.props.workspaceId)
		modelActionCreators.fetchModels()
	},

	componentWillReceiveProps: function (newProps) {
		console.log('newProps: ' + JSON.stringify(newProps))
	},

	toggleSidebar: function() {
		this.setState({
			hiddenSidebar: !this.state.hiddenSidebar
		})
	}
})

export default Application
