import React from "react";
import { Route, DefaultRoute, NotFoundRoute } from "react-router";
import Application from "./containers/Application";
import ModelPane from "./containers/ModelPane";
import WorkspaceBrowser from "./containers/WorkspaceBrowser";
import Header from "./containers/Header";

// polyfill
if(!Object.assign)
	Object.assign = React.__spread;

// export routes
module.exports = (
	<Route path="/">

			<Route name="default" path="/" handler={WorkspaceBrowser}></Route>
			<Route name="workspaceBrowser" path="/workspaces?" handler={WorkspaceBrowser}></Route>
			<Route handler={Application}>
				<Route name="workspace" path="/workspace/:workspaceId" handler={ModelPane}></Route>
				<Route name="model" path="/workspace/:workspaceId/model/:modelId" handler={ModelPane}></Route>
				<Route name="view" path="/workspace/:workspaceId/model/:modelId/view/:viewId" handler={ModelPane}></Route>
			</Route>
		
	</Route>
);
