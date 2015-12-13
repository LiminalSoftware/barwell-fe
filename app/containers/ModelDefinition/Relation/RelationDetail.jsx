import React from "react"
import { Link } from "react-router"

import ModelStore from "../../../stores/ModelStore"
import AttributeStore from "../../../stores/AttributeStore"
import KeyStore from "../../../stores/KeyStore"
import RelationStore from "../../../stores/RelationStore"
import KeycompStore from "../../../stores/KeycompStore"
import modelActionCreators from '../../../actions/modelActionCreators'
import constants from '../../../constants/MetasheetConstants'
import getIconClasses from '../getIconClasses'
import _ from 'underscore'

var PureRenderMixin = require('react/addons').addons.PureRenderMixin;

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
			name: relation.relation,
			hasBeenRenamed: false
		}
	},

	cancelChanges: function () {

	},

	handleNameUpdate: function (event) {
		this.setState({name: event.target.value, hasBeenRenamed: true})
	},

	handleModelSelect: function (event) {
		var model_id = parseInt(event.target.value)
		var relation = this.props.relation
		var relatedModel = ModelStore.get(model_id)

		relation.related_model_id = model_id
		relation.relation = this.getUpdatedName(relation)
		this.commit(relation)
	},

	handleTypeSelect: function (event) {
		var relation = this.props.relation
		var relatedModel = ModelStore.get(relation.related_model_id) || {}
		relation.type = event.target.value
		relation.relation = this.getUpdatedName(relation)
		this.commit(relation)
	},

	getUpdatedName: function (relation) {
		var relatedModel = ModelStore.get(relation.related_model_id) || {}
		return (relation.type === 'Has one' ? relatedModel.model : relatedModel.plural)
	},

	commit: function (relation) {
		this.setState({name: relation.relation})
		modelActionCreators.create('relation', false, relation)
	},

	handleDelete: function (event) {
		var relation = this.props.relation
		modelActionCreators.destroy('relation', false, relation)
	},

	render: function () {
		var relation = this.props.relation;
		var relatedModel
		var relatedModelField
		var nameField
		var typeField

		var relatedModelChoices = ModelStore.query(null, 'model').map(function (model) {
			var model_id = (model.model_id || model.cid)
			return <option value={model_id} key={model_id}>
  				{model.model}
  			</option>;
		})
		relatedModelChoices.unshift(<option value="0"> - Select - </option>)

		if(!relation.relation_id){
			relatedModelField = <select value={relation.related_model_id || 0} onChange={this.handleModelSelect}>
				{relatedModelChoices}
			</select>
			typeField = <select value={relation.type} onChange={this.handleTypeSelect}>
				{ (relation.related_model_id === relation.model_id) ? <option value="HIERARCHY">Hierarchy</option> : null}
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

		return <div
				key={'relation-'+(relation.relation_id || relation.cid)}
				className={"detail-row " + (relation._dirty?'unsaved':'') + (relation._destroy?'destroyed':'') + (this.props.editing ? ' editing ' : null)}>
			{this.props.editing ?
				<span className="draggable" key="drag-cell">
					<span className="tighter icon icon-Layer_2 model-reorder"></span>
				</span>
				: null
			}
			<span className="width-30">
				{this.props.editing ?
					<input ref="renamer"
					value={this.state.name}
					onChange={this.handleNameUpdate}
					onBlur={this.commitChanges}/>
					:
					relation.relation
				}
			</span>
			<span className="width-30">
				{relatedModelField}
			</span>
			<span className="width-25">
				{typeField}
			</span>
			{this.props.editing ?
			<span className="centered width-15 tight grayed">
				<span className="clickable  icon icon-cog-thick"
				title="Advanced options" onClick={this.handleNaturalKey}></span>
				<span className="clickable icon icon-kub-trash"
				title="Delete attribute" onClick={this.handleDelete}></span>
			</span>
			:
			<span className="width-15 tight"></span>
			}
		</div>;
	}
});

export default RelationDetail
