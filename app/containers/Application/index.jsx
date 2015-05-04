import React from "react";
import { RouteHandler } from "react-router";
import SideBar from "components/SideBar";
import barwell from "barwell";
import styles from "./style.less";

export default class Application extends React.Component {
	static getProps(stores, params) {
		var transition = stores.Router.getItem("transition");
		return {
			loading: !!transition
		};
	}
	render() {
		var { loading } = this.props;
		return <div className={styles.this + (loading ? " " + styles.loading : "")}>
			<div className={styles.loadingElement}>loading...</div>
			<h1>barwell front-end</h1>
			<SideBar />
			<RouteHandler />
		</div>;
	}
	update() {
		TodoActions.update();
	}
}

Application.contextTypes = {
	stores: React.PropTypes.object
};
