import React from "react";
import { Link } from "react-router";
import styles from "./style.less";
import modelActionCreators from "../../actions/modelActionCreators"
import WorkspaceStore from '../../stores/WorkspaceStore'

var WorkspaceBrowser = React.createClass({
	getInitialState: function () {
		return {}
	},

	render: function() {
    return <div className="workspace-browser-container">
      <h1>Workspace Browser</h1>
			<ul className = "workspaces-list">
			{WorkspaceStore.query(null).map(function (ws) {
					return <li key={'ws-link-' + ws.workspace_id}>
						<Link to="workspace" params={{workspaceId: ws.workspace_id}} key={'ws-link-' + ws.workspace_id + '-link'}>
							<div className="workspace-box icon icon-db-datasheets"></div>
							{ws.workspace}
						</Link></li>;
			})}
			</ul>
    </div>
	},

	componentWillMount: function () {
		WorkspaceStore.addChangeListener(this._onChange)
		modelActionCreators.fetchWorkspaces()
	},

	componentWillUnmount: function () {
		WorkspaceStore.removeChangeListener(this._onChange)
	},

	_onChange: function () {
		this.forceUpdate()
	}

})

export default WorkspaceBrowser
