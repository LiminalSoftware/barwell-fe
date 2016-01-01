import React from "react";
import { Router, Route, IndexRoute, hashHistory } from "react-router";

import Application from "./containers/Application";
import ModelPane from "./containers/ModelPane";
import WorkspaceBrowser from "./containers/WorkspaceBrowser";
import Header from "./containers/Header";

// polyfill
if(!Object.assign)
	Object.assign = React.__spread;

// export routes
module.exports = (
	<Router history={hashHistory}>
		<Route path="/">
				<Route path="workspace/:workspaceId" component = {Application}>
					<Route path="model/:modelId" component = {ModelPane}>
						<Route path="view/:viewId" component = {ModelPane}></Route>
						<IndexRoute component = {ModelPane}></IndexRoute>
					</Route>
					<IndexRoute component = {ModelPane}></IndexRoute>
				</Route>
				<IndexRoute name="workspaceBrowser" component = {WorkspaceBrowser}></IndexRoute>
		</Route>
	</Router>
);
