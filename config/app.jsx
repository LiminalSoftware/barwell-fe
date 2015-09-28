import async from "async";
import React from "react";
import Router from "react-router";
var routes = require("../app/" + __resourceQuery.substr(1) + "Routes");

Router.run(routes, function(Handler, state) {
	var params = state.params;
	React.render(<Handler params={params}/>, document.getElementById("content"));
});
