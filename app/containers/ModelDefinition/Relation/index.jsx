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

import ConfirmationMixin from '../ConfirmationMixin'
import RelationDetail from './RelationDetail'

var sortable = require('react-sortable-mixin');
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;

var RelationDetailList = React.createClass({

	mixins: [sortable.ListMixin, ConfirmationMixin],

	handleAddNewRelation: function () {
		var model = this.props.model;
		var relation = {
			relation: 'New relation',
			model_id: model.model_id,
			type: 'Has one'
		}
		modelActionCreators.create('relation', false, relation);
		this.setState({editing: true})
	},

	render: function () {
		var model = this.props.model
		var _this = this

		var relList = RelationStore.query({model_id: model.model_id}).map(function (relation) {
			return <RelationDetail
				editing = {_this.state.editing}
				key = {relation.relation_id || relation.cid}
				relation = {relation} />;
		})
		if (relList.length === 0) {
			relList = <tr><td className="grayed centered" colSpan="4">No relations defined</td></tr>;
		}

		return <div className = "detail-block">
			<div className="detail-section-header">
				<h3>Relations</h3>
				<ul className="light mb-buttons">
					<li onClick={this.handleEdit}>Edit</li>
					<li onClick={this.handleAddNewRelation} className="plus">+</li>
				</ul>
			</div>
			<p className="explainer">
				Relations describe relationships between your databases.
				The relationship type describes the number of related
				objects you could expect to have for each object in this database.
			</p>
			<div className={"detail-table " + (this.state.editing ? "editing" : "")}>
				<div className="detail-header">
					<span className="width-30">Name</span>
					<span className="width-40">Related Model</span>
					<span className="width-20">Type</span>
					<span className="width-10"></span>
				</div>
				{relList}
			</div>
			<div className="confirm-div">
				{this.getConfirmationButtons()}
			</div>
		</div>
	}
})

export default RelationDetailList
