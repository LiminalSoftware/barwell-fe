import React from "react"
import { Link } from "react-router"
import styles from "./style.less"
import ModelStore from "../../../stores/ModelStore"
import AttributeStore from "../../../stores/AttributeStore"
import KeyStore from "../../../stores/KeyStore"
import KeycompStore from "../../../stores/KeycompStore"
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
	},

	componentWillMount: function () {
		ModelStore.addChangeListener(this._onChange)
		AttributeStore.addChangeListener(this._onChange)
		KeyStore.addChangeListener(this._onChange)
		KeycompStore.addChangeListener(this._onChange)
	},

	_onChange: function () {
		this.forceUpdate()
	},

	render: function () {
		var _this = this;
		var model = this.props.model;
		
		if(!model) return <div key="model-detail-bar" className="model-details">
			<h3 key="attr-header">No Model Selected</h3>
		</div>

		return <div key="model-detail-bar" className="model-details">
			
			<ColumnDetailList model={model} />
			<RelationDetailList model={model} />
			<KeyDetailList model={model} />

			<div className="decision-row">
				<div className="cancel-button">
					<span className="gray large icon icon-cld-delete"></span>
					Cancel changes
				</div>	
				<div className="save-button">
					<span className="gray large icon icon-cld-add"></span>
					Commit changes
				</div>
			</div>

		</div>;
	}
});

export default ModelDefinition;


// var RelationDetail = React.createClass({
// 	render: function () {
// 		var relation = this.props.relation;
// 		var name = relation.synget(bw.DEF.REL_NAME);
// 		var fromKey = relation.synget(bw.DEF.REL_KEY);
// 		var fromKeyName = fromKey.synget(bw.DEF.KEY_NAME);
// 		var opposite = relation.synget(bw.DEF.REL_OPPOSITE);
// 		var toKey = opposite.synget(bw.DEF.REL_KEY);
// 		var toKeyName = toKey.synget(bw.DEF.KEY_NAME);
// 		var reactKey = 'relation-' + relation.synget(bw.DEF.REL_ID);
// 		return <tr key={reactKey}>
// 			<td key={reactKey+'-name'}>{name}</td>
// 			<td key={reactKey+'-from-key'}>{fromKeyName}</td>
// 			<td key={reactKey+'-arrow'}><span className="icon greened icon-shuffle"></span></td>
// 			<td key={reactKey+'-to'}>{toKeyName}</td>
// 		</tr>;
// 	}
// });

