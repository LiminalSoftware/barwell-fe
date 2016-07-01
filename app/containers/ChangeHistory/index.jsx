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

var ChangeHistory = React.createClass({

	mixins: [PureRenderMixin],

	componentWillUnmount: function () {
		TransactionStore.removeChangeListener(this._onChange)
	},

	componentWillMount: function () {
		TransactionStore.addChangeListener(this._onChange)
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
				
		</div></div>

	}
});

export default ChangeHistory;
