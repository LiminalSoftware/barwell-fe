import React from "react"
import { Link } from "react-router"
import styles from "./style.less"
import ModelStore from "../../../stores/ModelStore"
import AttributeStore from "../../../stores/AttributeStore"
import KeyStore from "../../../stores/KeyStore"
import KeycompStore from "../../../stores/KeycompStore"
import modelActionCreators from '../../../actions/modelActionCreators'
import constants from '../../../constants/MetasheetConstants'
import _ from 'underscore'

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
	
	componentWillUnmount: function () {
		ModelStore.removeChangeListener(this._onChange)
		AttributeStore.removeChangeListener(this._onChange)
		KeyStore.removeChangeListener(this._onChange)
	},

	componentWillMount: function () {
		ModelStore.addChangeListener(this._onChange)
		AttributeStore.addChangeListener(this._onChange)
		KeyStore.addChangeListener(this._onChange)
	},

	_onChange: function () {
		this.forceUpdate()
	},

	handleAddNewAttr: function (event) {
		var model = this.props.model;
		modelActionCreators.createAttribute({
			attribute: 'New attribute',
			type: 'INTEGER',
			model_id: model.model_id,
			persist: false
		})
		
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

		var colList = AttributeStore.query({model_id: model.model_id}).map(function (col) {
			var colId = (col.attribute_id || col.cid);
			return <ColumnDetail key={"model-definition-col-"+colId} column = {col} keyOrd = {keyOrd} />;
		});

		var keyList = KeyStore.query({model_id: model.model_id}).map(function (key) {
			var keyId = (key.key_id || key.cid)
			return <KeyDetail key={"model-definition-key-"+keyId} mdlKey = {key} keyOrd = {keyOrd} />;
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
						<th style={{width: "10%"}} key="attr-header-actions"></th>
						<th style={{width: "35%"}} key="attr-header-name">Name</th>
						<th style={{width: "35%"}} key="attr-header-type">Type</th>
						<th style={{width: "20%"}} key="attr-header-key">Keys</th>
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
		var reactKey = 'key-' + (key.key_id || key.cid);
		var wedgeClasses = "small grayed icon wedge icon-geo-triangle " +
			(this.state.open ? "open" : "closed");
		var ord = keyOrd[key.key_id];
		var keyIcon = <span className={getIconClasses(ord)}></span>;

		var components = key.components;

		return <tr key={reactKey}>
			<td onClick={this.toggleDetails} key={key + '-expand'}><span className={wedgeClasses}></span></td>
			<td key={reactKey+'-name'}>{key.key}</td>
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

	getInitialState: function () {
		var attribute = this.props.column;
		return {
			renaming: false,
			attribute: attribute.attribute,
			type: attribute.type
		};
	},
	
	commitChanges: function () {
		var attribute = _.clone(this.props.column);

		attribute.attribute = this.state.attribute
		attribute.type = this.state.type

		console.log('attribute: '+ JSON.stringify(attribute, null, 2));

		modelActionCreators.createAttribute(attribute)
		this.revert()
	},
	
	cancelChanges: function () {
		this.revert()
	},
	
	edit: function () {
		var attribute = this.props.column;
		if (this.state.renaming) return
		this.setState({
			renaming: true,
			attribute: attribute.attribute
		}, function () {
			React.findDOMNode(this.refs.renamer).focus();
		})
		document.addEventListener('keyup', this.handleKeyPress)
	},
	
	revert: function () {
		var attribute = this.props.column;
		document.removeEventListener('keyup', this.handleKeyPress)
		this.setState({
			renaming: false,
			attribute: attribute.attribute,
			type: attribute.type
		})
	},

	handleKeyPress: function (event) {
		if (event.keyCode === 27) this.cancelChanges()
		if (event.keyCode === 13) this.commitChanges()
	},

	handleNameUpdate: function (event) {
		this.setState({attribute: event.target.value})
	},

	handleTypeChange: function (event) {
		var attribute = this.props.column;
		attribute.type = event.target.value;
		modelActionCreators.createAttribute(attribute)
		this.revert()
	},
	
	render: function () {
		var _this = this;
		var col = this.props.column;
		var keyOrd = this.props.keyOrd;
		var name = col.attribute;

		var wedgeClasses = "small grayed icon icon-geo-triangle wedge" +
			(this.state.open ? " open" : "closed");

		var nameField = (this.state.renaming) ? 
			<input ref="renamer" value={this.state.attribute} onChange={this.handleNameUpdate} onBlur={this.commitChanges}/> 
			: {name};
		var keyIcons = [];
		var components = KeycompStore.query({attribute_id: col.attribute_id});

		var typeFieldChoices = Object.keys(constants.fieldTypes).filter(function (type) {
			return type !== 'PRIMARY_KEY'
		}).map(function (type) {
  			return <option value={type}>
  				{constants.fieldTypes[type]}
  			</option>;
		});

		var typeSelector = (col.persist == false) ?
			<select name="type" value={col.type} onChange={this.handleTypeChange}>
				{typeFieldChoices}
			</select>
			:
			<span>{constants.fieldTypes[col.type]}</span>
			;
		
		components.forEach(function (comp, idx) {
			var key = KeyStore.get(comp.key_id)
			var ord = keyOrd[key.key_id]
			keyIcons.push(<span 
				key = {'keycomp-' + comp.keycomp_id} 
				className={getIconClasses(ord)}></span>
			);
		});
		
		var key = "attribute-" + (col.attribute_id || col.cid);
		return <tr key={key}>
			<td key={key + '-actions'}>
				{(col.persist === false) ? <span className="clickable grayed icon icon-check" alt="Save column" title="Save column"></span> : ''}
			</td>
			<td onDoubleClick={this.edit} key={key + '-name'}>
				{nameField}
			</td>
			<td key={key + '-type'}>
				{typeSelector}
			</td>
			<td key={key + '-keys'}>
				{keyIcons}
			</td>
		</tr>
	}
});