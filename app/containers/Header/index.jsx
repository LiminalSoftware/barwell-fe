import React from "react";
import { RouteHandler } from "react-router";
import SideBar from "containers/SideBar";
import styles from "./style.less";
import modelActionCreators from "../../actions/modelActionCreators"

var Header = React.createClass({

	render: function() {
		return <div className="header-container">
      <div className="app-header-bar">
        <h1>metasheet.io</h1>
      </div>
		</div>;
	}
})

export default Header
