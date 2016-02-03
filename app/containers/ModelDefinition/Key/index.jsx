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

	handleAddNew: function (event) {
		var model = this.props.model;
		var obj = {
			key: 'New key',
			model_id: model.model_id,
			uniq: false,
			_named: false
		}
		this.setState({editing: true})
		modelActionCreators.create('key', false, obj)
	},

	commitChanges: function () {
		var _this = this
		var model = this.props.model;
		this.setState({committing: true})

		return Promise.all(
			KeyStore.query({model_id: (model.model_id || model.cid)}).map(function (key) {
				var comps = KeycompStore.query({key_id: key.cid || key.key_id}, 'order')
				key = _.clone(key)
				
				if (key._destroy) return modelActionCreators.destroy('key', true, key)
				else if (key._dirty || _.any(_.pluck(comps, '_dirty')) ) {
					key.keycomps = comps.map(kc => _.pick(kc, 'attribute_id', 'ord'))
					return modelActionCreators.create('key', true, key)
				}
			})
		).then(function () {
			return _this.clearEditMode(true)
			// modelActionCreators.createNotification('Attribute udpate complete!', 'Your changes have been committed to the server', 'info')
		})
	},

	cancelChanges: function () {
		return this.clearEditMode(false)
	},

	clearEditMode: function (save) {
		var _this = this;
		var model = this.props.model;
		return Promise.all(KeyStore.query({model_id: (model.model_id || model.cid)}).map(function (key) {
			if (!key.key_id || (save && key._destroy)) {
				return modelActionCreators.destroy('key', false, key)
			} else {
				return modelActionCreators.restore('key', key)
			}
		})).then(function () {
			_this.setState({editing: false, committing: false})
		})
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
				{this.getEditButtons(true)}
				{this.getConfirmationButtons()}


			</div>
			<div className="detail-table">
				<div key="detail-header" className="detail-header">
					<span style={{width: "70%"}}>Name / Component</span>
					<span style={{width: "10%"}}></span>
					<span style={{width: "10%"}}>Unique?</span>
					<span style={{width: "10%"}}></span>
				</div>
				{
					KeyStore.query({model_id: model.model_id}).map(function (key) {
						if (key._destroy) return null
						else return <KeyDetail
							_key = {key}
							keyOrd = {keyOrd}
							editing = {_this.state.editing}
							key = {key.cid || key.key_id}/>
					})
				}
			</div>
		</div>
	}

})

export default KeyDetailList;
