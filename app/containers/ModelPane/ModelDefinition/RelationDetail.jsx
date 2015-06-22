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
		var relation = modelActionCreators.genericAction(
		'relation',
		'create',
		{
			relation: 'New relation',
			model_id: model.model_id,
			type: 'Has one',
			_persist: false,
			_dirty: true
		})
	},

	render: function () {
		var model = this.props.model
		var relList = RelationStore.query({model_id: model.model_id}).map(function (relation) {
			return <RelationDetail 
				key ={relation.relation_id || relation.cid} 
				relation = {relation} />;
		});
		
		return <div className = "detail-block">
			<h3>Relations</h3>
			<table className="detail-table">
				<thead>
					<tr key="rel-header-row">
						<th>Name</th>
						<th>Related Model</th>
						<th>Type</th>
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

var RelationDetail = React.createClass({
	
	render: function () {
		var relation = this.props.relation;
		// var relatedModel = ModelStore.get(relation.related_model_id)
		var relatedModelChoices = ModelStore.query(null, 'model').map(function (model) {
			return <option value={(model.model_id || model.cid)}>
  				{model.model}
  			</option>;
		})
		relatedModelChoices.unshift(<option value="0"> ---- </option>)

		return <tr 
			key={'relation-'+(relation.relation_id || relation.cid)}
			className={relation._dirty?'unsaved':''}>
			<td>{relation.relation}</td>
			<td> <select value={0} onChange={this.selectModel}>
				{relatedModelChoices}
			</select></td>
			<td><select value="Has one" on>
				<option value="Has one">Has one</option>
				<option value="Has one">Has many</option>
				<option value="Has one">One to one</option>
			</select></td>
		</tr>;
	}
});

export default RelationDetailList