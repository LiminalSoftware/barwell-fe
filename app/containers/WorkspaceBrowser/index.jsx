import React from "react";
import { RouteHandler } from "react-router";
import SideBar from "containers/SideBar";
import styles from "./style.less";
import modelActionCreators from "../../actions/modelActionCreators"

var WorkspaceBrowser = React.createClass({
	getInitialState: function () {
		return {}
	},

	render: function() {
    return <div className="workspace-browser-container">
      <h1>Workspace Browser</h1>
    </div>
	},

	componentWillMount: function () {
		modelActionCreators.fetchModels()
	},

  fetchWorkspaces: function () {

  }
})

export default WorkspaceBrowser
