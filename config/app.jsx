import async from "async";
import React from "react";
import ReactDOM from "react-dom";
import Router from "react-router";
var routes = require("../app/" + __resourceQuery.substr(1) + "Routes");


ReactDOM.render(routes, document.getElementById("content"));
