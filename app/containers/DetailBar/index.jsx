import React from "react";
import { Link } from "react-router";
import bw from "barwell";
import styles from "./style.less";

export default class DetailBar extends React.Component {
	render() {
		var _this = this;
		var view = bw.MetaView.store.synget(901, this.props.params.viewId);
		var model = bw.ModelMeta.store.synget(101, this.props.params.modelId);
		var columns = model.synget('Fields');

		prepView(view);

		var colList = columns.map(function (col) {
			return <ColumnDetail column = {col} view = {view} />
		});

		var keyList = columns.map(function (col) {
			var keyId = col.synget(301);
			return <tr key={"attr-" + keyId}>
				<td key={"key-"+keyId+'-name'}>{col.synget(303)}</td>
			</tr>
		});

		return <div key="detail-bar" className="detail-bar">
			
			<h3>Attributes</h3>
			<table className="detail-table">
				<tr key="attr-header-row">
					<th key="attr-header-expand"></th>
					<th key="attr-header-name">Name</th>
					<th key="attr-header-visibility">Viz</th>
					<th key="attr-header-type">Type</th>
					<th key="attr-header-key">Keys</th>
				</tr>
				<tbody>{colList}</tbody>
			</table>
			<h3>Sorting</h3>
			<h3>Keys</h3>
			<table className="detail-table">
				<tr key="key-header-row">
					<th key="key-header-name">Name</th>
				</tr>
				<tbody>
				
				</tbody>
			</table>

			<h3>Relations</h3>
		</div>;
	}
}

var prepView = function (view) {
	var data = view.synget(bw.DEF.VIEW_DATA) || {};
	var model = view.synget(bw.DEF.VIEW_MODEL);
	data.columns = data.columns || {};
	model.synget(bw.DEF.MODEL_FIELDS).forEach(function (attr) {
		var colId = attr.synget(bw.DEF.ATTR_ID);
		data.columns[colId] = data.columns[colId] || {};
	});
	view.set(bw.DEF.VIEW_DATA, data);
}

var ColumnDetail = React.createClass({
	getInitialState: function () {
		return {editing: false, visible: true};
	},
	handleClick: function (event) {
		this.setState({editing: !this.state.editing});
	},
	toggleDetails: function (event) {
		this.setState({open: !this.state.open});
	},
	toggleVisibility: function (event) {
		var data = this.props.view.synget(bw.DEF.VIEW_DATA);
		var colId = this.props.column.synget(bw.DEF.ATTR_ID);
		data.columns[colId].visible = !data.columns[colId].visible;
		this.props.view.set(bw.DEF.VIEW_DATA, data);
		// TODO: render should automatically trigger when the listener works
		this.render();
	},
	render: function () {
		var col = this.props.column;
		var view = this.props.view;
		var colId = col.synget(bw.DEF.ATTR_ID);
		var name = col.synget(bw.DEF.ATTR_NAME);
		var wedgeClasses = "wedge-icon icon-geo-triangle " +
			(this.state.open ? " wedge-open" : "");
		var nameField = (this.state.editing ? <input value={name}/> : {name} );
		var key = "attr-" + colId;
		var visible = !!(this.props.view.synget(bw.DEF.VIEW_DATA).columns[colId].visible);
		return <tr key={key}>
			<td onClick={this.toggleDetails} key={key + '-expand'}><span className={wedgeClasses}></span></td>
			<td onDoubleClick={this.handleClick} key={key + '-name'}>
				{nameField}
			</td>
			<td onClick={this.toggleVisibility} key={key + '-visibility'}>
				<span className={"clickable icon icon-eye-" + (visible ? "3 icon-greened":"4 icon-grayed")}></span>
			</td>
			<td key={key + '-type'}>{col.synget(203)}</td>
			<td key={key + '-keys'}></td>
		</tr>	
	}
});