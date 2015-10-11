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

var sortable = require('react-sortable-mixin');
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;

var RelationDetailList = React.createClass({

	handleNewRelation: function () {
		var model = this.props.model;
		var relation = {
			relation: 'New relation',
			model_id: model.model_id,
			type: 'Has one'
		}
		modelActionCreators.create('relation', false, relation);
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
			<div className="detail-section-header">
				<h3>Relations</h3>
				<ul className="light mb-buttons">
					<li onClick={this.handleEdit}>Edit</li>
					<li onClick={this.handleAddNewRelation}>+</li>
				</ul>
			</div>

			<p className="explainer">
			Relations describe relationships between your databases.  The relationship type describes the number of related
			objects you could expect to have for each object in this database.  For more information on relationship types, click here.
			</p>
			<div className="detail-table">
				<div className="detail-header">
					<span className="width-30">Name</span>
					<span className="width-40">Related Model</span>
					<span className="width-20">Type</span>
					<span className="width-10"></span>
				</div>
				{relList}
			</div>
		</div>
	}
})

var relationPrettyNames = {
	HAS_MANY: 'Has many',
	HAS_ONE: 'Has one',
	ONE_TO_ONE: 'One to one'
}

var RelationDetail = React.createClass({

	mixins: [PureRenderMixin],

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
		var model_id = parseInt(event.target.value)
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
				{ (relation.related_model_id === relation.model_id) ? <option value="HIERARCHY">Hierarchy</option> : null}
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

		return <div
				key={'relation-'+(relation.relation_id || relation.cid)}
				className={"detail-row " + (relation._dirty?'unsaved':'') + (relation._destroy?'destroyed':'')}>
			<span className="width-30">
				{nameField}
			</span>
			<span className="width-40">
				{relatedModelField}
			</span>
			<span className="width-20">
				{typeField}
			</span>
			<span className="centered width-10">
				{relation._dirty ? <span
					className="showonhover small clickable grayed icon icon-kub-remove"
					title="Delete component"
					onClick={this.handleRelationCancel}>
				</span> : null }
			</span>
		</div>;
	}
});

export default RelationDetailList
