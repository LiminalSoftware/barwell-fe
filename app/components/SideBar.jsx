import React from "react";
import { Link } from "react-router";
import barwell from "barwell";

export default class SideBar extends React.Component {
	render() {
		var modelLinks = barwell.ModelMeta.store.getObjects().map(function (mdl) {
			return <li key={mdl.synget(101)}>
				<a href={"/models/"+mdl.synget(103)}>
					{mdl.synget(102)}
				</a></li>;
		});
		return <div className="left-side-bar">
			<h2>Models</h2>
			<ul>{modelLinks}</ul>
		</div>;
	}
}