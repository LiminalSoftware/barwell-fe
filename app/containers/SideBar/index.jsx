import React from "react";
import { Link } from "react-router";
import barwell from "barwell";
import styles from "./style.less";

export default class SideBar extends React.Component {
	static getProps(stores, params) {
		return params;
	}
	render() {
		var modelLinks = barwell.ModelMeta.store.getObjects().map(function (mdl) {
			var _this = this;
			return <li key={mdl.synget(101)}>
				<a href={"/app/model/"+mdl.synget(101)}>
					<span className="icon icon-db-datasheet"></span>
					{mdl.synget(102)}
				</a></li>;
		});
		return <div className="left-side-bar">
			<h2>Models</h2>
			<ul>{modelLinks}</ul>
		</div>;
	}
}