import React from "react"
import { Link } from "react-router"

import styles from "./style.less"

import ModelStore from "../../stores/ModelStore"
import TransactionStore from "../../stores/TransactionStore"
import modelActionCreators from "../../actions/modelActionCreators"
import constants from "../../constants/MetasheetConstants"

import _ from 'underscore'
import moment from "moment"

import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import PureRenderMixin from 'react-addons-pure-render-mixin';

var ChangeHistory = React.createClass({

	mixins: [PureRenderMixin],

	componentWillUnmount: function () {
		TransactionStore.removeChangeListener(this._onChange)
	},

	componentWillMount: function () {
		TransactionStore.addChangeListener(this._onChange)
		this.store = TransactionStore
		modelActionCreators.fetchModelActions(this.props.model)
	},
	
	_onChange: function () {
		this.forceUpdate()
	},

	render: function () {
		var _this = this;
		var model = this.props.model;
		var actions

		if (!model) return <div className = "model-panes"></div>

		actions = TransactionStore.query({model_id: model.model_id})
			.sort( (a,b) => parseInt(b.action_id, 10) - parseInt(a.action_id, 10) )

		return	<div className = "model-panes"><table className = "">
			<tbody>
			{actions.map(a => <tr className = {"action-row-" + (a.operation === 'U' ? 'update' : a.operation === 'D' ? 'delete' : 'create')}>
				<td><span className = {"icon icon-small icon-chevron-right"}/></td>
				<td>{a.narrative}</td>
				<td>[{moment(a.timestamp).fromNow()}, {a.username}]</td>
			</tr>)}
			</tbody>
		</table></div>

		// return <div className = "model-panes">
			
		// </div>

	}
});

export default ChangeHistory;
