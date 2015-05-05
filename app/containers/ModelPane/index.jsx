import React from "react";
import { RouteHandler } from "react-router";
import barwell from "barwell";
import styles from "./style.less";

export default class ModelPane extends React.Component {
	static getProps(stores, params) {
		return params;
	}
	render() {
		var model = barwell.ModelMeta.store.synget(101, this.props.modelId);
		var columns = model.synget('Fields');
		var header = columns.map(function (col) {
			return <th>{col.synget(202)}</th>;
		});
		

		return <div className={"model-pane"}>
			<h3>model detail:  {model.synget(102)}</h3>
			<table className="data-table">
				<tr>{header}</tr>
			</table>
		</div>;
	}
}

