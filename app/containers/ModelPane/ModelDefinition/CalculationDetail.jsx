import React from "react"
import { Link } from "react-router"
import styles from "./style.less"
import ModelStore from "../../../stores/ModelStore"
import AttributeStore from "../../../stores/AttributeStore"
import KeyStore from "../../../stores/KeyStore"
import KeycompStore from "../../../stores/KeycompStore"
import modelActionCreators from '../../../actions/modelActionCreators'
import constants from '../../../constants/MetasheetConstants'
import getIconClasses from './getIconClasses'
import _ from 'underscore'

var CalculationDetailList = React.createClass({

	handleAddNewCalc: function (event) {
		var model = this.props.model;
		// var key = modelActionCreators.genericAction(
		// 'key',
		// 'create',
		// {
		// 	key: 'New key',
		// 	model_id: model.model_id,
		// 	indexed: false,
		// 	uniq: false,
		// 	_persist: false
		// })
	},

	render: function () {
		var model = this.props.model
		var calcList

		// calcList = CalcStore.query({model_id: (model.model_id || model.cid)}).map(function (key) {
		// 	var keyId = (key.key_id || key.cid)
		// 	return <CalcDetail key={"model-definition-key-" + keyId} mdlKey = {key} keyOrd = {keyOrd} />;
		// })

		return <div className = "detail-block">
			<h3 key="calcs-header">Calculations</h3>
			<table key="keys-table" className="detail-table">
			</table>
			<div><a className="new-adder new-key" onClick={this.handleAddNewCalc}>
				<span className="small addNew icon icon-plus"></span>New calculation
			</a></div>
		</div>
	}

})

export default CalculationDetailList