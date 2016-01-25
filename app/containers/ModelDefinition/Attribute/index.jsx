import React from "react"
import { Link } from "react-router"

import ModelStore from "../../../stores/ModelStore"
import AttributeStore from "../../../stores/AttributeStore"
import KeyStore from "../../../stores/KeyStore"
import KeycompStore from "../../../stores/KeycompStore"
import modelActionCreators from '../../../actions/modelActionCreators'
import constants from '../../../constants/MetasheetConstants'
import getIconClasses from '../getIconClasses'
import _ from 'underscore'
import util from '../../../util/util'

import AttributeDetail from './AttributeDetail'
import ConfirmationMixin from '../ConfirmationMixin'
import PureRenderMixin from 'react-addons-pure-render-mixin';

import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

var AttributeDetailList = React.createClass({

	mixins: [ConfirmationMixin],

	handleAddNewAttr: function (event) {
		var model = this.props.model;
		var obj = {
			attribute: 'New attribute',
			type: 'INTEGER',
			model_id: (model.model_id || model.cid)
		}
		modelActionCreators.create('attribute', false, obj)
		this.setState({editing: true})
		event.preventDefault()
	},

	commitChanges: function () {
		var _this = this
		var model = this.props.model;
		this.setState({committing: true})

		return Promise.all(
			AttributeStore.query({model_id: (model.model_id || model.cid)}).map(function (attr) {
				if (attr._dirty) return modelActionCreators.create('attribute', true, attr)
				if (attr._destroy) return modelActionCreators.destroy('attribute', true, attr)
			})
		).then(function () {
			_this.setState({editing: false, committing: false})
			_this.cancelChanges()
			// modelActionCreators.createNotification('Attribute udpate complete!', 'Your changes have been committed to the server', 'info')
		})
	},

	cancelChanges: function () {
		var model = this.props.model;
		AttributeStore.query({model_id: (model.model_id || model.cid)}).map(function (attr) {
			if (!attr.attribute_id) return modelActionCreators.destroy('attribute', false, attr)
			else {
				_.extend(attr, attr._server, {_destroy: false, _clean: true})
				modelActionCreators.create('attribute', false, attr)
			}
		})
		this.setState({editing: false})
	},

	isDirty: function () {
		var model = this.props.model;
		return !_.all(AttributeStore.query({model_id: model.model_id}).map(util.isClean))
	},

	render: function () {
		var _this = this
		var keyOrd = {}
		var model = this.props.model
		var iter = 0

		KeyStore.query({model_id: model.model_id}, 'key_id').forEach(function (key) {
			return keyOrd[key.key_id] = iter++;
		})

		return <div className = "detail-block">
			<div className = "detail-section-header">
				<h3>Attributes</h3>
				<ul className="light mb-buttons">
					<li onClick={this.handleEdit}>Edit</li>
					<li onClick={this.handleAddNewAttr} className="plus">+</li>
				</ul>
			</div>

			<p className="explainer">
				Attributes are properties that you might use to describe items in this database.
			</p>
			<div key="attr-table" className={"detail-table " + (this.state.editing ? " editing" : "")}>
					<div className="detail-header">
						<span style={{width: '40%'}} key="name-cell">Name</span>
						<span style={{width: "30%"}} key="type-cell">Type</span>
						<span style={{width: "10%"}} key="keys-cell">Keys</span>
						<span style={{width: "10%"}} key="action-cell"></span>
					</div>
					{
						AttributeStore.query({model_id: (model.model_id || model.cid)}, ['ordering']).map(function (col) {
							var colId = (col.attribute_id || col.cid);
							if (col._destroy) return null
							return <AttributeDetail
								key = {colId}
								editing = {_this.state.editing}
								model = {model}
								attribute = {col}
								keyOrd = {keyOrd} />;
						})
					}
			</div>
			<div className="confirm-div">
				{this.getConfirmationButtons()}
			</div>
		</div>
	}
})
export default AttributeDetailList
