import React from "react";
import { Route, DefaultRoute, NotFoundRoute } from "react-router";

import Application  from "./routeHandlers/Application";


// polyfill
if(!Object.assign)
	Object.assign = React.__spread;

// export routes
module.exports = (
	<Route name="app" handler={Application}></Route>
);
