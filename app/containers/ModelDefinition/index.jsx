import React from "react"
import { Link } from "react-router"
import styles from "./style.less"
import ModelStore from "../../stores/ModelStore"
import AttributeStore from "../../stores/AttributeStore"
import KeyStore from "../../stores/KeyStore"
import KeycompStore from "../../stores/KeycompStore"
import RelationStore from "../../stores/RelationStore"
import CalcStore from "../../stores/CalcStore"
import modelActionCreators from '../../actions/modelActionCreators'
import constants from '../../constants/MetasheetConstants'

import AttributeDetailList from './Attribute'
import CalculationDetailList from './Calculation'
import RelationDetailList from './Relation'
import KeyDetailList from './Key'
import ModelDetails from './Model'

import getIconClasses from './getIconClasses'

import _ from 'underscore'

import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import PureRenderMixin from 'react-addons-pure-render-mixin';

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

	render: function () {
		var _this = this;
		var model = this.props.model;

		if(!model) return <div className = "model-panes">
			<div className = "model-details"></div>
		</div>
		
		else return	<div className = "model-panes"><div className = "model-details">
				<ModelDetails model = {model} key = {'model-config-'+model.model_id} />
				<AttributeDetailList model = {model} key = {'attribute-config-'+model.model_id} />
				<KeyDetailList model = {model} key = {'key-config-' + model.model_id} />
				<RelationDetailList model = {model} key = {'relation-config-' + model.model_id} />
			
		</div></div>

	}
});

export default ModelDefinition;
