import React from "react";
import { Link } from "react-router";
import bw from "barwell";
import styles from "./style.less";


var KEY_ICONS = ["icon-geo-curvitri", "icon-geo-circle", "icon-geo-trifoil", "icon-geo-diamond"];
var KEY_COLORS = ["green", "blue", "red"];

var getIconClasses = function (ordinal) {
	return [
		"small", 
		"icon", 
		KEY_ICONS[ordinal % KEY_ICONS.length], 
		KEY_COLORS[ordinal % KEY_COLORS.length]
	].join(" ");
}

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
		var iter = 0;
		var keyOrd = {};

		keys.forEach(function (key) {
			return keyOrd[key.synget(bw.DEF.KEY_ID)] = iter++;
		})

		var colList = columns.map(function (col) {
			return <ColumnDetail column = {col} view = {view} keyOrd = {keyOrd} />;
		});

		var keyList = keys.map(function (key) {
			return <KeyDetail view = {view} mdlKey = {key} keyOrd = {keyOrd} />;
		});

		var relList = relations.map(function (rel) {
			return <RelationDetail view = {view} relation = {rel} />;
		});

		return <div key="model-detail-bar" className={"model-details " + (this.props.visible ? "" : "hidden")}>
			<h3 key="attr-header">Attributes</h3>
			<table key="attr-table" className="detail-table">
				<thead>
					<tr>
						<th key="attr-header-actions"></th>
						<th key="attr-header-name">Name</th>
						<th key="attr-header-type">Type</th>
						<th key="attr-header-key">Keys</th>
					</tr>
				</thead>
				<tbody>
					{colList}
				</tbody>
			</table>
			<div><a className="new-attr" onClick={this.handleAddNewAttr}><span className="small grayed icon icon-plus"></span>New attribute</a></div>
			
			<h3 key="keys-header">Keys</h3>
			<table key="keys-table" className="detail-table">
				<thead>
					<tr key="key-header-row">
						<th key="key-header-expand"></th>
						<th key="key-header-name">Name</th>
						<th key="key-header-icon"></th>
						<th key="key-header-uniq">Unique?</th>
					</tr>
				</thead>
				<tbody>
				{keyList}
				</tbody>
			</table>

			<h3 key="relations-header">Relations</h3>
			<table key="rels-table" className="detail-table">
				<thead>
					<tr key="rel-header-row">
						<th key="rel-header-name">Name</th>
						<th key="rel-header-from">From</th>
						<th key="rel-header-arrow"></th>
						<th key="rel-header-to">To</th>
					</tr>
				</thead>
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
		var key = this.props.mdlKey;
		var keyOrd = this.props.keyOrd;
		var view = this.props.view;
		var name = key.synget(bw.DEF.KEY_NAME);
		var uniq = key.synget(bw.DEF.KEY_UNIQ);
		var reactKey = 'key-' + key.synget(bw.DEF.KEY_ID);
		var wedgeClasses = "small grayed icon wedge icon-geo-triangle " +
			(this.state.open ? "open" : "closed");
		var ord = keyOrd[key.synget(bw.DEF.KEY_ID)];
		var keyIcon = <span className={getIconClasses(ord)}></span>;

		var components = key.synget('Components');

		return <tr key={reactKey}>
			<td onClick={this.toggleDetails} key={key + '-expand'}><span className={wedgeClasses}></span></td>
			<td key={reactKey+'-name'}>{name}</td>
			<td key={reactKey+'-icon'}>{keyIcon}</td>
			<td key={reactKey+'-uniq'}><input type="checkbox" checked={uniq}></input></td>
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
	componentWillMount: function () {
		var col = this.props.config;
		this.setState(col);
	},
	getInitialState: function () {
		return {open: false, editing: false, visible: true};
	},
	handleDblClick: function (event) {
		this.setState({editing: !this.state.editing});
	},
	updateName: function (name) {
		var col = this.props.column;
		col.set(bw.DEF.ATTR_NAME, name);
		return name;
	},
	render: function () {
		var col = this.props.column;
		var keyOrd = this.props.keyOrd;
		var view = this.props.view;
		var colId = col.synget(bw.DEF.ATTR_ID);
		var name = col.synget(bw.DEF.ATTR_NAME);

		var wedgeClasses = "small grayed icon icon-geo-triangle wedge" +
			(this.state.open ? " open" : "closed");

		var nameField = (this.state.editing ? <input value={name} onChange={this.updateName}/> : {name} );
		var keyIcons = [];
		var components = col.synget('Key components');
		
		if (!!components) {
			components.forEach(function (comp) {
				var key = comp.synget('Key');
				var ord = keyOrd[key.synget(bw.DEF.KEY_ID)];
				keyIcons.push(	<span className={getIconClasses(ord)}></span>);
			});
		}

		var key = "attr-" + colId;
		return <tr key={key}>
			<td key={key + '-actions'}>

			</td>
			<td onDoubleClick={this.handleDblClick} key={key + '-name'}>
				{nameField}
			</td>
			<td key={key + '-type'}>{col.synget(203)}</td>
			<td key={key + '-keys'}>
				{keyIcons}
			</td>
		</tr>	
	}
});