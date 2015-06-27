import React from "react"
import { Link } from "react-router"
import styles from "./style.less"
import ModelStore from "../../../stores/ModelStore"
import AttributeStore from "../../../stores/AttributeStore"
import KeyStore from "../../../stores/KeyStore"
import RelationStore from "../../../stores/RelationStore"
import KeycompStore from "../../../stores/KeycompStore"
import modelActionCreators from '../../../actions/modelActionCreators'
import constants from '../../../constants/MetasheetConstants'
import getIconClasses from './getIconClasses'
import _ from 'underscore'

var RelationDetailList = React.createClass({
	
	handleNewRelation: function () {
		var model = this.props.model;
		var relation = {
			relation: 'New relation',
			model_id: model.model_id,
			type: 'Has one'
		}
		modelActionCreators.create('relation', false, relation);

		// relation = modelActionCreators.genericAction(
		// 	'relation',
		// 	'create',
		// 	{
		// 		relation: 'New relation',
		// 		model_id: model.model_id,
		// 		type: 'Has one',
		// 		_persist: false,
		// 		_dirty: true
		// 	})
	},

	render: function () {
		var model = this.props.model
		var relList = RelationStore.query({model_id: model.model_id}).map(function (relation) {
			return <RelationDetail 
				key = {relation.relation_id || relation.cid} 
				relation = {relation} />;
		});
		if (relList.length === 0) {
			relList = <tr><td className="grayed centered" colSpan="4">No relations defined</td></tr>;
		}

		return <div className = "detail-block">
			<h3>Relations</h3>
			<table className="detail-table">
				<thead>
					<tr key="rel-header-row">
						<th className="width-30">Name</th>
						<th className="width-30">Related Model</th>
						<th className="width-30">Type</th>
						<th className="width-10"></th>
					</tr>
				</thead>
				<tbody>
					{relList}
				</tbody>
			</table>
			<div><a 
				className="new-adder new-attr" 
				onClick={this.handleNewRelation}>
				<span className="small addNew icon icon-plus"></span>
				New relation
			</a></div>
		</div>
	}
})

var relationPrettyNames = {
	HAS_MANY: 'Has many',
	HAS_ONE: 'Has one',
	ONE_TO_ONE: 'One to one'
}

var RelationDetail = React.createClass({

	getInitialState: function () {
		var relation = this.props.relation;
		return {
			renaming: false,
			name: relation.relation,
			hasBeenRenamed: false
		}
	},

	componentWillUnmount: function () {
		document.removeEventListener('keyup', this.handleKeyPress)
	},

	commitChanges: function () {
		var relation = this.props.relation
		relation.relation = this.state.name
		this.setState({hasBeenRenamed: true})
		modelActionCreators.create('relation', false, relation)
		this.revert()
	},
	
	cancelChanges: function () {
		this.revert()
	},
	
	handleEdit: function () {
		var relation = this.props.relation;
		if (this.state.renaming) return
		this.setState({
			renaming: true,
			name: relation.relation
		}, function () {
			React.findDOMNode(this.refs.renamer).focus();
		})
		document.addEventListener('keyup', this.handleKeyPress)
	},
	
	revert: function () {
		var relation = this.props.relation;
		document.removeEventListener('keyup', this.handleKeyPress)
		this.setState({
			renaming: false,
			name: relation.relation
		})
	},

	handleKeyPress: function (event) {
		if (event.keyCode === 27) this.cancelChanges()
		if (event.keyCode === 13) this.commitChanges()
	},

	handleNameUpdate: function (event) {
		this.setState({name: event.target.value})
	},

	handleModelSelect: function (event) {
		var model_id = event.target.value
		var relation = this.props.relation
		var relatedModel = ModelStore.get(model_id)
		relation.related_model_id = model_id
		if(!this.state.hasBeenRenamed) 
			relation.relation = relation.type === 'Has one' ? relatedModel.model : relatedModel.plural
		modelActionCreators.create('relation', false, relation)
	},

	handleTypeSelect: function (event) {
		var relation = this.props.relation
		var relatedModel = ModelStore.get(relation.related_model_id) || {}
		relation.type = event.target.value
		if(!this.state.hasBeenRenamed) 
			relation.relation = relation.type === 'Has one' ? relatedModel.model : relatedModel.plural
		modelActionCreators.create('relation', false, relation)
	},

	handleRelationCancel: function () {
		var relation = this.props.relation;
		if (!relation) return
		modelActionCreators.destroy('relation', false, {cid: relation.cid})
	},

	render: function () {
		var relation = this.props.relation;
		var relatedModel
		var relatedModelField
		var nameField
		var typeField
		// var relatedModel = ModelStore.get(relation.related_model_id)
		var relatedModelChoices = ModelStore.query(null, 'model').map(function (model) {
			var model_id = (model.model_id || model.cid)
			return <option value={model_id} key={model_id}>
  				{model.model}
  			</option>;
		})
		relatedModelChoices.unshift(<option value="0"> ---- </option>)

		if(!relation.relation_id){
			relatedModelField = <select value={relation.related_model_id || 0} onChange={this.handleModelSelect}>
				{relatedModelChoices}
			</select>
			typeField = <select value={relation.type} onChange={this.handleTypeSelect}>
				<option value="HAS_ONE">Has one</option>
				<option value="HAS_MANY">Has many</option>
				<option value="ONE_TO_ONE">One to one</option>
			</select>
		} else {
			relatedModel = ModelStore.get(relation.related_model_id)
			relatedModelField = <span>{!!relatedModel ? relatedModel.model : ''}</span>
			typeField = <span>{relationPrettyNames[relation.type]}</span>
		}

		if (this.state.renaming) 
			nameField = <input ref="renamer" 
				value={this.state.name} 
				onChange={this.handleNameUpdate} 
				onBlur={this.commitChanges}/> 
		else nameField = relation.relation;

		return <tr 
			key={'relation-'+(relation.relation_id || relation.cid)}
				className={(relation._dirty?'unsaved':'') + (relation._destroy?'destroyed':'')}>
			<td  onDoubleClick={this.handleEdit}>
				{nameField}
			</td>
			<td>
				{relatedModelField}
			</td>
			<td>
				{typeField}
			</td>
			<td className="centered">
			{relation._dirty ? <span 
				className="showonhover small clickable grayed icon icon-kub-remove" 
				title="Delete component" 
				onClick={this.handleRelationCancel}>
			</span> : null }</td>
		</tr>;
	}
});

export default RelationDetailList