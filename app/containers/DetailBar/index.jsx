import React from "react";
import { Link } from "react-router";
import barwell from "barwell";
import styles from "./style.less";

export default class DetailBar extends React.Component {
	static getProps(stores, params) {
		return params;
	}
	render() {
		var _this = this;
		var model = barwell.ModelMeta.store.synget(101, this.props.modelId);
		var columns = model.synget('Fields');

		var colList = columns.map(function (col) {
			var colId = col.synget(201);
			return <tr key={"attr-" + colId}>
				<td key={"attr-"+colId+'-expand'}><span className="wedge-icon icon-geo-triangle"></span></td>
				<td key={"attr-"+colId+'-name'}>{col.synget(202)}</td>
				<td key={"attr-"+colId+'-visibility'}><span className="icon icon-eye-3"></span></td>
				<td key={"attr-"+colId+'-type'}>{col.synget(203)}</td>
				<td key={"attr-"+colId+'-keys'}></td>
			</tr>
		});

		var keyList = columns.map(function (col) {
			var keyId = col.synget(301);
			return <tr key={"attr-" + keyId}>
				<td key={"key-"+keyId+'-name'}>{col.synget(303)}</td>
			</tr>
		});

		return <div className="detail-bar">
			
			<h3>Attributes</h3>
			<table className="detail-table">
				<tr>
					<th key="header-expand"></th>
					<th key="header-name">Name</th>
					<th key="header-visibility">Viz</th>
					<th key="header-type">Type</th>
					<th key="header-key">Keys</th>
				</tr>
				<tbody>
				{colList}
				</tbody>
			</table>
			<h3>Sorting</h3>
			<h3>Keys</h3>
			<table className="detail-table">
				<tr>
					<th key="key-header-name">Name</th>
				</tr>
				<tbody>
				{keyList}
				</tbody>
			</table>

			<h3>Relations</h3>
		</div>;
	}
}