import React from "react";
import { RouteHandler } from "react-router";
import SideBar from "containers/SideBar";
import DetailBar from "containers/DetailBar";
import barwell from "barwell";
import styles from "./style.less";

export default class Application extends React.Component {
	render() {
		var { loading } = this.props;
		return <div className="application">
			<SideBar {...this.props} />
			<RouteHandler {...this.props} />
		</div>;
	}
}