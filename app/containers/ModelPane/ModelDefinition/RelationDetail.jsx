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

var RelationDetailList = React.createClass({
	handleNewRelation: function () {

	},
	render: function () {
		// var relList = relations.map(function (rel) {
		// 	var relId = rel.synget('id')
		// 	return <RelationDetail key ={'mdldef-rel-' + relId} relation = {rel} />;
		// });

		return <div className = "detail-block">
			<h3>Relations</h3>
			<table className="detail-table">
				<thead>
					<tr key="rel-header-row">
						<th>Name</th>
						<th>From</th>
						<th></th>
						<th>To</th>
					</tr>
				</thead>
				<tbody>
				</tbody>
			</table>
			<div><a 
				className="new-adder new-attr" 
				onClick={this.handleNewRelation}>
				<span className="small addNew icon icon-plus"></span>
				New relation
			</a></div>
		</div>
	}
})

export default RelationDetailList