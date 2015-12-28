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
			<Route name="workspace" path="workspace/:workspaceId" handler={Application}>
				<Route name="model" path="model/:modelId" handler={ModelPane}>
					<Route name="view" path="view/:viewId" handler={ModelPane}></Route>
					<DefaultRoute name="modelOnly" handler={ModelPane}></DefaultRoute>
				</Route>
				<DefaultRoute name="noSelection" handler={ModelPane}></DefaultRoute>
			</Route>
			<DefaultRoute name="workspaceBrowser" handler={WorkspaceBrowser}></DefaultRoute>
	</Route>
);
