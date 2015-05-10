import React from "react";
import { RouteHandler } from "react-router";
import bw from "barwell";
import styles from "./style.less";

export default class TabularPane extends React.Component {
	componentDidMount () {
		var _this = this;
		var modelId = this.props.params.modelId;
		var model = bw.ModelMeta.store.synget(101, modelId);
		this.setState({offset: 0, records: 100});
		this.cursor = this.getCursor();
		this.cursor.on('fetch', function () {
			return _this.render();
		});
		this.cursor.fetch();
	}
	getCursor () {
		var _this = this;
		var model = bw.ModelMeta.store.synget(101, this.props.params.modelId);
		this.cursor = model.store.getCursor(this.state);
		return this.cursor;
	}
	updateCursor (state) {
		var _this = this;
		return this.cursor.fetch ();
	}
	render () {
		var _this = this;
		var modelId = this.props.params.modelId;
		var model = bw.ModelMeta.store.synget(101, modelId);
		var columns = model.synget(bw.DEF.MODEL_FIELDS);
		var header = columns.map(function (col) {
			return <th key={"header--"+col.synget(201)}>{col.synget(202)}</th>;
		});
		var rows = [];
		if (this.state) for (var i = this.state.offset; i < this.state.offset + this.state.records; i++) {
			var row = _this.cursor.at(i);
			var props = columns.map(function (col) {
				var key = col.synget(201);
				var fullKey = '' + i + '-' + key;
				if (!!row) return <td key={fullKey}>{row.attributes[key]}</td>;
				else return <td key={fullKey} className="cell-loading"></td>;
			});
			rows.push(<tr key={i}>{props}</tr>);
		}
		return <div className="model-pane">
			<table className="data-table">
				<tr key="header">{header}</tr>
				<tbody>
				{rows}
				</tbody>
			</table>
		</div>;
	}
}

