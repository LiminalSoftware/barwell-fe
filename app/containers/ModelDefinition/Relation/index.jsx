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

	cancelChanges: function () {
		var model = this.props.model;
		RelationStore.query({model_id: (model.model_id || model.cid)}).map(function (rel) {
			if (!rel.relation_id)
				modelActionCreators.destroy('relation', false, rel);
			else {
				_.extend(rel, rel._server, {_destroy: false, _clean: true});
				modelActionCreators.create('rel', false, rel);
			}
		})
		this.setState({editing: false});
	},

	commitChanges: function () {
		var _this = this
		var model = this.props.model;
		model.lock_user = 'me'
		this.setState({committing: true})

		modelActionCreators.create('model', true, model, false).then(function () {
			return Promise.all(
			RelationStore.query({model_id: (model.model_id || model.cid)}).map(function (rel) {
				if (rel._dirty) return modelActionCreators.create('relation', true, rel)
				if (rel._destroy) return modelActionCreators.destroy('relation', true, rel)
			}))
		}).then(function () {
				model.lock_user = null
				modelActionCreators.create('model', true, model, false)
		}).then(function () {
			_this.setState({editing: false, committing: false})
			_this.cancelChanges()
			modelActionCreators.createNotification('Relation udpate complete!', 'Your changes have been committed to the server', 'info')
		})
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
					<span className="width-30">Related Model</span>
					<span className="width-20">Type</span>
					<span className="width-20"></span>
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
