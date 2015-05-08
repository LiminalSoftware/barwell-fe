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
			return <li key={"mdl-li-" + mdl.synget(101)}>
				<Link key={"mdl-link-" + mdl.synget(101)} to={"/app/model/"+mdl.synget(101)}>
					<span key={"mdl-icon-" + mdl.synget(101)} className="icon icon-db-datasheet"></span>
					{mdl.synget(102)}
				</Link></li>;
		});
		return <div className="left-side-bar">
			<ul>{modelLinks}</ul>
		</div>;
	}
}