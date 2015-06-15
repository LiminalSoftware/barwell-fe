import React from "react"
import { Link } from "react-router"
import styles from "./style.less"
import ModelStore from "../../../stores/ModelStore"
import AttributeStore from "../../../stores/AttributeStore"
import KeyStore from "../../../stores/KeyStore"

var KEY_ICONS = ["icon-geo-str-square", "icon-geo-str-circle", "icon-geo-str-triangle", "icon-geo-str-trifold", "icon-geo-str-diamond"];
var KEY_COLORS = ["green", "blue", "red"];

var getIconClasses = function (ordinal) {
	return [
		"small", 
		"icon",
		"addNew",
		KEY_ICONS[ordinal % KEY_ICONS.length], 
		KEY_COLORS[ordinal % KEY_COLORS.length]
	].join(" ");
}

var ModelDefinition = React.createClass({
	
	handleAddNewAttr: function (event) {
		
		MetasheetDispatcher.handleViewAction({
	      actionType: MetasheetConst.ATTRIBUTE_CREATE,
	    	attribute: 'New Attribute',
	    	model_pk: this.props.params.modelId
	    });
		event.preventDefault();
	},

	render: function () {
		var _this = this;
		var model = this.props.model;
		// var relations = model.synget('Relations');
		var iter = 0;
		var keyOrd = {};

		if(!model) return <div key="model-detail-bar" className="model-details">
			<h3 key="attr-header">No Model Selected</h3>
		</div>

		if(model.keys) model.keys.forEach(function (key) {
			return keyOrd[key.key_id] = iter++;
		})

		var colList = AttributeStore.getModelAttributes(model.model_id).map(function (col) {
			var colId = col.attribute_id;
			return <ColumnDetail key={"mdldef-col-"+colId} column = {col} keyOrd = {keyOrd} />;
		});

		var keyList = KeyStore.getModelKeys(model.model_id).map(function (key) {
			var keyId = key.key_id
			return <KeyDetail key={"mdldef-key-"+keyId} mdlKey = {key} keyOrd = {keyOrd} />;
		});

		// var relList = relations.map(function (rel) {
		// 	var relId = rel.synget('id')
		// 	return <RelationDetail key ={'mdldef-rel-' + relId} relation = {rel} />;
		// });
		
		return <div key="model-detail-bar" className="model-details">
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
			<div><a className="new-attr" onClick={this.handleAddNewAttr}><span className="small addNew icon icon-plus"></span>New attribute</a></div>
			
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
		var reactKey = 'key-' + key.key_id;
		var wedgeClasses = "small grayed icon wedge icon-geo-triangle " +
			(this.state.open ? "open" : "closed");
		var ord = keyOrd[key.key_id];
		var keyIcon = <span className={getIconClasses(ord)}></span>;

		var components = key.components;

		return <tr key={reactKey}>
			<td onClick={this.toggleDetails} key={key + '-expand'}><span className={wedgeClasses}></span></td>
			<td key={reactKey+'-name'}>{key.name}</td>
			<td key={reactKey+'-icon'}>{keyIcon}</td>
			<td key={reactKey+'-uniq'}><input type="checkbox" checked={key.uniq}></input></td>
		</tr>;
	}
});

// var RelationDetail = React.createClass({
// 	render: function () {
// 		var relation = this.props.relation;
// 		var name = relation.synget(bw.DEF.REL_NAME);
// 		var fromKey = relation.synget(bw.DEF.REL_KEY);
// 		var fromKeyName = fromKey.synget(bw.DEF.KEY_NAME);
// 		var opposite = relation.synget(bw.DEF.REL_OPPOSITE);
// 		var toKey = opposite.synget(bw.DEF.REL_KEY);
// 		var toKeyName = toKey.synget(bw.DEF.KEY_NAME);
// 		var reactKey = 'relation-' + relation.synget(bw.DEF.REL_ID);
// 		return <tr key={reactKey}>
// 			<td key={reactKey+'-name'}>{name}</td>
// 			<td key={reactKey+'-from-key'}>{fromKeyName}</td>
// 			<td key={reactKey+'-arrow'}><span className="icon greened icon-shuffle"></span></td>
// 			<td key={reactKey+'-to'}>{toKeyName}</td>
// 		</tr>;
// 	}
// });

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
		col.attribute = attribute;

		return name;
	},
	render: function () {
		var col = this.props.column;
		var keyOrd = this.props.keyOrd;
		var colId = col.attribute_id;
		var name = col.attribute;

		var wedgeClasses = "small grayed icon icon-geo-triangle wedge" +
			(this.state.open ? " open" : "closed");

		var nameField = (this.state.editing ? <input value={name} onChange={this.updateName}/> : {name} );
		var keyIcons = [];
		var components = KeycompStore.getAttrComps(col.attribute_id);
		
		if (!!components) {
			components.forEach(function (comp, idx) {
				var key = KeyStore.get(key.key_id)
				var ord = keyOrd[key.key_id]
				keyIcons.push(	<span key = {key + '-key-' + idx} className={getIconClasses(ord)}></span>);
			});
		}

		var key = "attr-" + colId;
		return <tr key={key}>
			<td key={key + '-actions'}>

			</td>
			<td onDoubleClick={this.handleDblClick} key={key + '-name'}>
				{nameField}
			</td>
			<td key={key + '-type'}>{col.type}</td>
			<td key={key + '-keys'}>
				{keyIcons}
			</td>
		</tr>
	}
});