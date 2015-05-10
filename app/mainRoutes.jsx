import React from "react";
import { Route, DefaultRoute, NotFoundRoute } from "react-router";

// import Application  from "./routeHandlers/Application";
// import ViewPane  from "./routeHandlers/ViewPane";
import Application from "./containers/Application";
import ViewPane from "./containers/ViewPane";


// polyfill
if(!Object.assign)
	Object.assign = React.__spread;

// export routes
module.exports = (
	<Route name="app/" handler={Application}>
		<Route name="model" path="model/:modelId" handler={ViewPane}></Route>
		<Route name="view" path="model/:modelId/view/:viewId" handler={ViewPane}></Route>
	</Route>
);
