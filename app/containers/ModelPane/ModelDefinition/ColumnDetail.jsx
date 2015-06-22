import React from "react"
import { Link } from "react-router"
import styles from "./style.less"
import ModelStore from "../../../stores/ModelStore"
import AttributeStore from "../../../stores/AttributeStore"
import KeyStore from "../../../stores/KeyStore"
import KeycompStore from "../../../stores/KeycompStore"
import modelActionCreators from '../../../actions/modelActionCreators'
import constants from '../../../constants/MetasheetConstants'
import getIconClasses from './getIconClasses'
import _ from 'underscore'


var ColumnDetailList = React.createClass({

	handleAddNewAttr: function (event) {
		var model = this.props.model;
		var obj = {
			attribute: 'New attribute',
			type: 'INTEGER',
			model_id: model.model_id
		}
		modelActionCreators.create('attribute', false, obj)
		event.preventDefault()
	},

	render: function () {
		var keyOrd = {}
		var model = this.props.model
		var iter = 0

		KeyStore.query({model_id: model.model_id}, 'key_id').forEach(function (key) {
			return keyOrd[key.key_id] = iter++;
		})

		var colList = AttributeStore.query({model_id: (model.model_id || model.cid)}).map(function (col) {
			var colId = (col.attribute_id || col.cid);
			return <ColumnDetail key={"model-definition-col-" + colId} model={model} column = {col} keyOrd = {keyOrd} />;
		});

		return <div className = "detail-block">
			<h3 key="attr-header">Attribute</h3>
			<table key="attr-table" className="detail-table">
				<thead>
					<tr>
						<th className="width-40" key="attr-header-name">Name</th>
						<th className="width-30" key="attr-header-type">Type</th>
						<th className="width-10" key="attr-header-key">Keys</th>
						<th className="width-20" key="attr-header-actions"></th>
					</tr>
				</thead>
				<tbody>
					{colList}
				</tbody>
			</table>
			<div><a 
				className="clickable new-adder new-attr" 
				onClick={this.handleAddNewAttr}>
				<span className="small addNew icon icon-plus"></span>
				New attribute
			</a></div>
		</div>
	}
})

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
		attribute._dirty = true

		modelActionCreators.create('attribute', false, attribute)
		this.revert()
	},
	
	cancelChanges: function () {
		this.revert()
	},
	
	handleEdit: function () {
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
		var attribute = this.props.column
		attribute.type = event.target.value
		modelActionCreators.createAttribute(attribute)
		this.revert()
	},

	handleDelete: function (event) {
		var attribute = this.props.column
		console.log('handleDelete attribute: '+ JSON.stringify(attribute, null, 2));
		modelActionCreators.destroy('attribute', false, attribute)
		event.preventDefault()
	},

	handleUndelete: function (event) {
		var attribute = this.props.column
		modelActionCreators.undestroy('attribute', attribute)
		event.preventDefault()
	},
	
	render: function () {
		var _this = this;
		var col = this.props.column;
		var model = this.props.model;
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

		var typeSelector = (!col.attribute_id) ?
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
				className={getIconClasses(ord, key)}
				title={key.key}>
				</span>
			);
		});
		
		var key = "attribute-" + (col.attribute_id || col.cid);

		var actions = [];

		if (col._destroy) {
			actions.push(<span className="showonhover clickable grayed icon icon-tl-undo" 
				title="Restore" 
				onClick={this.handleUndelete}>
				</span> )
		} else if (col.attribute_id) {
			actions.push(<span className="showonhover clickable grayed icon icon-kub-trash" 
				title="Delete attribute" 
				onClick={this.handleDelete}>
				</span>)
			actions.push(<span className="showonhover clickable grayed icon icon-tl-pencil" 
				title="Edit attribute" 
				onClick={this.handleEdit}>
				</span>)
			
		} else {
			actions.push(<span className="showonhover small clickable grayed icon icon-kub-remove" 
				title="Cancel" 
				onClick={this.handleDelete}>
				</span>)
			actions.push(<span className="showonhover clickable grayed icon icon-tl-pencil" 
				title="Edit attribute" 
				onClick={this.handleEdit}>
				</span>)
		}

		return <tr 
			key={key} 
			className={(col._dirty?'unsaved':'') + (col._destroy?'destroyed':'')}>
			
			<td onDoubleClick={this.handleEdit} key={key + '-name'}>
				{nameField}
			</td>
			<td key={key + '-type'}>
				{typeSelector}
			</td>
			<td key={key + '-keys'} className="centered">
				{keyIcons}
			</td>
			<td key={key + '-actions'} className="centered">
				{actions}
			</td>
		</tr>
	}
});

export default ColumnDetailList