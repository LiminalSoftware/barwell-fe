import React from "react";
import { Router, Route, IndexRoute, hashHistory, browserHistory } from "react-router";
import { Provider } from 'react-redux'

// STORE
import store from "./stores/reduxStore"

import Application from "./containers/Application";
import ViewPane from "./containers/ViewPane";
import WorkspaceBrowser from "./containers/WorkspaceBrowser";

// polyfill
if(!Object.assign)
	Object.assign = React.__spread;

// export routes
export default (<Provider store={store}><Router history={browserHistory}>
	<Route path="/">
			<Route path="workspace/:workspaceId" component = {Application}>

				<Route path="view/:viewId" component = {Application}></Route>

				<Route path="model/:modelId" component = {Application}>
					<Route path="view/:viewId" component = {Application}></Route>
					<IndexRoute component = {ViewPane}></IndexRoute>
				</Route>

				<IndexRoute component = {ViewPane}></IndexRoute>
			</Route>
			<IndexRoute name="workspaceBrowser" component = {WorkspaceBrowser}></IndexRoute>
	</Route>
</Router></Provider>)
