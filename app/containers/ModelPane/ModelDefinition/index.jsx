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
import ColumnDetailList from './ColumnDetail'
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

	isDirty: function () {
		var model = this.props.model;
		var dirty = false;
		if (!model) return false
		dirty = dirty || _.any(AttributeStore.query({model_id: model.model_id}).map(function (attr) {
			return attr._dirty
		}))

		dirty = dirty || _.any(KeyStore.query({model_id: model.model_id}).map(function (key) {
			return key._dirty
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
			
			<ColumnDetailList model={model} />
			<RelationDetailList model={model} />
			<KeyDetailList model={model} />

			{(dirty) ? <div className="decision-row">
				<div className="cancel-button" onClick={this.fetchModel}>
					<span className="gray large icon icon-cld-delete"></span>
					Cancel changes
				</div>	
				<div className="save-button">
					<span className="gray large icon icon-cld-upload"></span>
					Commit changes
				</div>
			</div> : null}

		</div>;
	}
});

export default ModelDefinition;