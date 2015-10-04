import React from "react"
import { Link } from "react-router"
import styles from "./style.less"
import ModelStore from "../../../stores/ModelStore"
import AttributeStore from "../../../stores/AttributeStore"
import KeyStore from "../../../stores/KeyStore"
import KeycompStore from "../../../stores/KeycompStore"
import RelationStore from "../../../stores/RelationStore"
import CalcStore from "../../../stores/CalcStore"
import modelActionCreators from '../../../actions/modelActionCreators'
import constants from '../../../constants/MetasheetConstants'
import AttributeDetailList from './AttributeDetail'
import CalculationDetailList from './CalculationDetail'
import RelationDetailList from './RelationDetail'
import KeyDetailList from './KeyDetail'
import ModelDetails from './ModelDetails'
import getIconClasses from './getIconClasses'
import _ from 'underscore'


var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

var PureRenderMixin = require('react/addons').addons.PureRenderMixin;

var ModelDefinition = React.createClass({

	mixins: [PureRenderMixin],

	componentWillUnmount: function () {
		ModelStore.removeChangeListener(this._onChange)
		AttributeStore.removeChangeListener(this._onChange)
		KeyStore.removeChangeListener(this._onChange)
		KeycompStore.removeChangeListener(this._onChange)
		RelationStore.removeChangeListener(this._onChange)
		CalcStore.removeChangeListener(this._onChange)
	},

	componentWillMount: function () {
		ModelStore.addChangeListener(this._onChange)
		AttributeStore.addChangeListener(this._onChange)
		KeyStore.addChangeListener(this._onChange)
		KeycompStore.addChangeListener(this._onChange)
		RelationStore.addChangeListener(this._onChange)
		CalcStore.addChangeListener(this._onChange)
	},

	_onChange: function () {
		this.forceUpdate()
	},

	getInitialState: function () {
		return {
			committing: false
		}
	},

	fetchModel: function () {
		var model = this.props.model
		var _this = this;
		_this.setState({committing: true})
		modelActionCreators.fetch('model', {model_id: model.model_id}).then(function () {
			_this.setState({committing: false})
		})
	},

	commitModel: function () {
		var _this = this;
		var model = this.props.model
		model.lock_user = 'me'

		this.setState({committing: true})

		modelActionCreators.create('model', true, model, false)
		.then(function () {

			return Promise.all(
				AttributeStore.query({model_id: (model.model_id || model.cid)}).map(function (attr) {
					if (attr._dirty) return modelActionCreators.create('attribute', true, attr)
					if (attr._destroy) return modelActionCreators.destroy('attribute', true, attr)
				}))
		}).then(function () {
			return Promise.all(
				KeyStore.query({model_id: model.model_id}).map(function (key) {
					if (key._dirty) {
						var key_plus = _.clone(key)
						key_plus.keycomps = KeycompStore.query({key_id: (key.key_id || key.cid)})
							.map(function(kc) {return _.pick(kc, 'attribute_id', 'ord')})
						return modelActionCreators.create('key', true, key_plus)
					}
					if (key._destroy)
						return modelActionCreators.destroy('key', true, key)
				}))
		}).then(function () {
			_this.setState({committing: false})
			model.lock_user = null
			return modelActionCreators.create('model', true, model, true)
		}).catch(function () {
			_this.setState({committing: false})
			model.lock_user = null
			return modelActionCreators.create('model', true, model, true)
		})

	},

	isDirty: function () {
		var model = this.props.model;
		var dirty = false;
		if (!model) return false

		dirty = dirty || model._dirty

		dirty = dirty || _.any(AttributeStore.query({model_id: model.model_id}).map(function (attr) {
			return attr._dirty || attr._destroy
		}))

		dirty = dirty || _.any(KeyStore.query({model_id: model.model_id}).map(function (key) {
			return key._dirty || key._destroy
		}))

		dirty = dirty || _.any(RelationStore.query({model_id: model.model_id}).map(function (rel) {
			return rel._dirty || rel._destroy
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

		return <ReactCSSTransitionGroup transitionName="detail-bar">
		<div key="model-detail-bar" className={"model-details " + (dirty ? 'dirty' : '')}>

			<ModelDetails model={model} key={'details-'+model.model_id} />
			<AttributeDetailList model={model} />
			<RelationDetailList model={model} />
			<KeyDetailList model={model} />
			<CalculationDetailList model={model} />

			<div className = {(dirty || this.state.committing ? 'active' : 'inactive') + ' decision-row'}>
				{(this.state.committing) ? <Spinner/> : null}
				{(this.state.committing) ? null : <div className="cancel-button" onClick={this.fetchModel}>
					<span className="gray large icon icon-cld-delete"></span>
					Cancel changes
				</div>}
				{(this.state.committing) ? null : <div className="save-button" onClick={this.commitModel}>
					<span className="gray large icon icon-cld-upload"></span>
					Commit changes
				</div>}
			</div>
		</div></ReactCSSTransitionGroup>;
	}
});

export default ModelDefinition;

var Spinner = React.createClass({
	componentDidMount: function () {
		setTimeout(this.increment, 100);
	},

	increment: function () {
		var spin = ((this.state.spin + 1) % 9);
		if(!this.isMounted()) return;
		this.setState({spin: spin})
		setTimeout(this.increment, 100);
	},

	getInitialState: function () {
		return {
			spin: 0
		}
	},

	render: function () {
		return <span className="cancel-button">
				<span className={"gray large icon icon-loadingcr-" + (this.state.spin + 1)}></span>
				Committing changes...
			</span>
	}
});
