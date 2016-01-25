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

import KeyDetail from './KeyDetail'

import ConfirmationMixin from '../ConfirmationMixin'

import PureRenderMixin from 'react-addons-pure-render-mixin';

var KeyDetailList = React.createClass({

	mixins: [ConfirmationMixin],

	handleAddNewKey: function (event) {
		var model = this.props.model;
		var obj = {
			key: 'New key',
			model_id: model.model_id,
			indexed: false,
			uniq: false,
			_named: false
		}
		modelActionCreators.create('key', false, obj)
	},

	render: function () {
		var _this = this
		var model = this.props.model
		var iter = 0
		var keyOrd = {}
		var keyList

		KeyStore.query({model_id: model.model_id}, 'key_id').forEach(function (key) {
			return keyOrd[key.key_id] = iter ++ ;
		})

		return <div className = "detail-block">
			<div className="detail-section-header">
				<h3>Keys</h3>
				<ul className="light mb-buttons">
					<li onClick={this.handleEdit}>Edit</li>
					<li onClick={this.handleAddNewRelation} className="plus">+</li>
				</ul>
			</div>

			<p className="explainer">
			Keys are groupings of attributes.  They can be used to enforce uniqueness or to define more complex relations between databases.
			</p>
			<div className="detail-table">
				<div key="detail-header" className="detail-header">
					<span style={{width: "70%"}}>Name / Component</span>
					<span style={{width: "10%"}}></span>
					<span style={{width: "15%"}}>Unique?</span>
					<span style={{width: "10%"}}></span>
				</div>
				{
					KeyStore.query({model_id: model.model_id}).map(function (key) {
						return <KeyDetail
							_key = {key}
							keyOrd = {keyOrd}
							editing = {_this.state.editing}
							key = {'key-detail-' + key.key_id}/>
					})
				}
			</div>
			<div className="confirm-div">
				{this.getConfirmationButtons()}
			</div>
		</div>
	}

})

export default KeyDetailList;
