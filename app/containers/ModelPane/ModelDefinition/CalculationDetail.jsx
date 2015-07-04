import React from "react"
import { Link } from "react-router"
import styles from "./style.less"
import ModelStore from "../../../stores/ModelStore"
import AttributeStore from "../../../stores/AttributeStore"
import CalcStore from "../../../stores/CalcStore"

import modelActionCreators from '../../../actions/modelActionCreators'
import constants from '../../../constants/MetasheetConstants'
import getIconClasses from './getIconClasses'
import _ from 'underscore'

var CalculationDetailList = React.createClass({

	handleAddNewCalc: function (event) {
		var model = this.props.model;
		var calc = {model_id: model.model_id, calc: 'New calculation'};
		modelActionCreators.create('calc', false, calc)
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
		var calcList = CalcStore.query({model_id: (model.model_id || model.cid)}).map(function (calc) {
			return <CalcDetail key={(calc.calc_id || calc.cid)} calc={calc} />;
		})

		return <div className = "detail-block">
			<h3 key="calcs-header">Calculations</h3>
			<table key="keys-table" className="detail-table">
			{calcList}
			</table>
			<div><a className="new-adder new-key" onClick={this.handleAddNewCalc}>
				<span className="small addNew icon icon-plus"></span>New calculation
			</a></div>
		</div>
	}

})

var CalcDetail = React.createClass({
	getInitialState: function () {
		return {
			focusElement: null,
		}
	},

	render: function () {
		var calc = this.props.calc
		var nodes = CalcnodeStore.query({calc_id: calc.calc_id})

		return <tbody>
		<tr><td>
			{calc.calc}
		</td></tr><tr><td>
			<input ref="calc-in" value=""/>
		</td></tr>
		</tbody>
	}

})

export default CalculationDetailList