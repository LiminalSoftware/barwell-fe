import React from "react";
import { Link } from "react-router";
import bw from "barwell";
import styles from "./style.less";

var ModelDefinition = React.createClass({
	handleAddNewAttr: function (event) {
		event.preventDefault();
		var attrProps = {};
		attrProps[bw.DEF.ATTR_NAME] = 'New Attribute';
		attrProps[bw.DEF.ATTR_MODEL] = this.props.params.modelId;
		bw.MetaAttribute.instantiate(attrProps);
		this.render();
	},
	render: function () {
		var _this = this;
		var view = this.props.view;
		var model = this.props.model;
		var columns = model.synget('Fields');
		var keys = model.synget('Keys');
		var relations = model.synget('Relations');
		
		var colList = columns.map(function (col) {
			return <ColumnDetail column = {col} view = {view} />;
		});

		var keyList = keys.map(function (bwKey) {
			return <KeyDetail view = {view} bwKey = {bwKey} />;
		});

		var relList = relations.map(function (rel) {
			return <RelationDetail view = {view} relation = {rel} />;
		});

		return <div key="model-detail-bar" className={"model-details " + (this.props.visible ? "" : "hidden")}>
			<h3 key="attr-header">Attributes <span className="info-box"></span> </h3>
			<table key="attr-table" className="detail-table">
				<tr key="attr-header-row">
					<th key="attr-header-name">Name</th>
					<th key="attr-header-type">Type</th>
					<th key="attr-header-key">Keys</th>
					<th key="attr-header-actions">Actions</th>
				</tr>
				<tbody>{colList}</tbody>
			</table>
			<div><a className="new-attr" onClick={this.handleAddNewAttr}><span className="small grayed icon icon-plus"></span>New attribute</a></div>

			<h3 key="keys-header">Keys <span className="info-box"></span></h3>
			<table key="keys-table" className="detail-table">
				<tr key="key-header-row">
					<th key="key-header-expand"></th>
					<th key="key-header-name">Name</th>
					<th key="key-header-uniq">Unique?</th>
				</tr>
				<tbody>
				{keyList}
				</tbody>
			</table>

			<h3 key="relations-header">Relations <span className="info-box"></span></h3>
			<table key="rels-table" className="detail-table">
				<tr key="rel-header-row">
					<th key="rel-header-name">Name</th>
					<th key="rel-header-from">From</th>
					<th key="rel-header-arrow"></th>
					<th key="rel-header-to">To</th>
				</tr>
				<tbody>
				{relList}
				</tbody>
			</table>
		</div>;
	}
});

export default ModelDefinition;

var KeyDetail = React.createClass({
	getInitialState: function () {
		return {open: false};
	},
	toggleDetails: function (event) {
		this.setState({open: !this.state.open});
	},
	render: function () {
		var key = this.props.bwKey;
		var view = this.props.view;
		var name = key.synget(bw.DEF.KEY_NAME);
		var uniq = key.synget(bw.DEF.KEY_UNIQ);
		var reactKey = 'key-' + key.synget(bw.DEF.KEY_ID);
		var wedgeClasses = "small grayed icon icon-geo-triangle " +
			(this.state.open ? " wedge open" : "wedge closed");
		return <tr key={reactKey}>
			<td onClick={this.toggleDetails} key={key + '-expand'}><span className={wedgeClasses}></span></td>
			<td key={reactKey+'-name'}>{name}</td>
			<td key={reactKey+'-uniq'}><input type="checkbox" value={uniq}></input></td>
		</tr>;
	}
});

var RelationDetail = React.createClass({
	render: function () {
		var relation = this.props.relation;
		var view = this.props.view;
		var name = relation.synget(bw.DEF.REL_NAME);
		var fromKey = relation.synget(bw.DEF.REL_KEY);
		var fromKeyName = fromKey.synget(bw.DEF.KEY_NAME);
		var opposite = relation.synget(bw.DEF.REL_OPPOSITE);
		var toKey = opposite.synget(bw.DEF.REL_KEY);
		var toKeyName = toKey.synget(bw.DEF.KEY_NAME);
		var reactKey = 'relation-' + relation.synget(bw.DEF.REL_ID);
		return <tr key={reactKey}>
			<td key={reactKey+'-name'}>{name}</td>
			<td key={reactKey+'-from-key'}>{fromKeyName}</td>
			<td key={reactKey+'-arrow'}><span className="icon greened icon-shuffle"></span></td>
			<td key={reactKey+'-to'}>{toKeyName}</td>
		</tr>;
	}
});

var ColumnDetail = React.createClass({
	getInitialState: function () {
		return {open: false, editing: false, visible: true};
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
		this.forceUpdate();
	},
	render: function () {
		var col = this.props.column;
		var view = this.props.view;
		var colId = col.synget(bw.DEF.ATTR_ID);
		var name = col.synget(bw.DEF.ATTR_NAME);
		var wedgeClasses = "small grayed icon icon-geo-triangle " +
			(this.state.open ? " wedge open" : "wedge closed");
		var nameField = (this.state.editing ? <input type="text" value={name}/> : {name} );
		var key = "attr-" + colId;
		
		return <tr key={key}>
			<td onDoubleClick={this.handleClick} key={key + '-name'}>
				{nameField}
			</td>
			<td key={key + '-type'}>{col.synget(203)}</td>
			<td key={key + '-keys'}></td>
			<td key={key + '-actions'}><span className={"clickable grayed icon icon-trash"}></span></td>
		</tr>	
	}
});