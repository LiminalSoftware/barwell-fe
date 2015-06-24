import React from "react"
import { Link } from "react-router"
import styles from "./style.less"
import ModelStore from "../../../stores/ModelStore"
import AttributeStore from "../../../stores/AttributeStore"
import KeyStore from "../../../stores/KeyStore"
import KeycompStore from "../../../stores/KeycompStore"
import RelationStore from "../../../stores/RelationStore"
import modelActionCreators from '../../../actions/modelActionCreators'
import constants from '../../../constants/MetasheetConstants'
import AttributeDetailList from './AttributeDetail'
import CalculationDetailList from './CalculationDetail'
import RelationDetailList from './RelationDetail'
import KeyDetailList from './KeyDetail'
import getIconClasses from './getIconClasses'
import _ from 'underscore'



var ModelDefinition = React.createClass({
	
	componentWillUnmount: function () {
		ModelStore.removeChangeListener(this._onChange)
		AttributeStore.removeChangeListener(this._onChange)
		KeyStore.removeChangeListener(this._onChange)
		KeycompStore.removeChangeListener(this._onChange)
		RelationStore.removeChangeListener(this._onChange)
	},

	componentWillMount: function () {
		ModelStore.addChangeListener(this._onChange)
		AttributeStore.addChangeListener(this._onChange)
		KeyStore.addChangeListener(this._onChange)
		KeycompStore.addChangeListener(this._onChange)
		RelationStore.addChangeListener(this._onChange)
	},

	_onChange: function () {
		this.forceUpdate()
	},

	fetchModel: function () {
		var model = this.props.model
		modelActionCreators.genericAction('model', 'fetch', {model_id: model.model_id})
	},

	commitModel: function () {
		var _this = this;
		var model = this.props.model
		model.lock_user = 'me'

		modelActionCreators.create('model', true, _.pick(model, 'model_id', 'model', 'lock_user'))
		.then(function () {
			return Promise.all(
				AttributeStore.query({model_id: model.model_id}).map(function (attr) {
					if (attr._dirty) return modelActionCreators.create('attribute', true, attr)
					if (attr._destroy) return modelActionCreators.destroy('attribute', true, attr)
				}))
		}).then(function () {
			return Promise.all(
				KeyStore.query({model_id: model.model_id}).map(function (key) {
					if (key._dirty) 
						return modelActionCreators.create('key', true, key).then(function () {
							return Promise.all(KeycompStore.query({key_id: key.cid}).map(function (keycomp) {
								keycomp.key_id = KeyStore.get(keycomp.key_id).key_id;
								keycomp.attribute_id = AttributeStore.get(keycomp.attribute_id).attribute_id;
								console.log('keycomp: '+ JSON.stringify(keycomp, null, 2));
								return modelActionCreators.create('keycomp', true, keycomp)
							}))
						});
					if (key._destroy)
						return modelActionCreators.destroy('key', true, key)
				}))
		}).then(function () {
			model.lock_user = null
			return modelActionCreators.create('model', true, _.pick(model, 'model_id', 'model', 'lock_user'))
		}).then(function () {
			_this.fetchModel()
		}).catch(function (error) {
			model.lock_user = null
			return modelActionCreators.create('model', true, _.pick(model, 'model_id', 'model', 'lock_user'))
		})

	},

	isDirty: function () {
		var model = this.props.model;
		var dirty = false;
		if (!model) return false
		dirty = dirty || _.any(AttributeStore.query({model_id: model.model_id}).map(function (attr) {
			return attr._dirty || attr._destroy
		}))

		dirty = dirty || _.any(KeyStore.query({model_id: model.model_id}).map(function (key) {
			return key._dirty || key._destroy
		}))

		return dirty;
	},

	render: function () {
		var _this = this;
		var model = this.props.model;
		var dirty = this.isDirty()
		
		if(!model) return <div key="model-detail-bar" className="model-details">
			<h3 key="attr-header">No Model Selected</h3>
		</div>

		return <div key="model-detail-bar" className="model-details">
			
			<AttributeDetailList model={model} />
			<RelationDetailList model={model} />
			<KeyDetailList model={model} />
			<CalculationDetailList model={model} />

			{(dirty) ? <div className="decision-row">
				<div className="cancel-button" onClick={this.fetchModel}>
					<span className="gray large icon icon-cld-delete"></span>
					Cancel changes
				</div>	
				<div className="save-button" onClick={this.commitModel}>
					<span className="gray large icon icon-cld-upload"></span>
					Commit changes
				</div>
			</div> : null}

		</div>;
	}
});

export default ModelDefinition;