import React from "react";
import { RouteHandler } from "react-router";
import SideBar from "containers/SideBar";
import barwell from "barwell";
import styles from "./style.less";

export default class Application extends React.Component {
	static getProps(stores, params) {
		return {};
	}
	render() {
		var { loading } = this.props;
		return <div className="application">
			<SideBar />
			<RouteHandler />
		</div>;
	}
}

