import React from "react"
import styles from "./contextMenuStyle.less"
import _ from "underscore"
import $ from 'jquery'

import modelActionCreators from "../../../../actions/modelActionCreators"

import ViewDataStores from "../../../../stores/ViewDataStores"
import storeFactory from 'flux-store-factory';
import dispatcher from '../../../../dispatcher/MetasheetDispatcher'


var TabularContextMenu = React.createClass ({

	getInitialState: function () {
		return {}
	},

	_onChange: function () {
		this.forceUpdate()
	},

	componentWillMount: function () {
		
	},


	clickAddNewRow: function (e) {
		
	},


	render: function () {
		return <ul className = "tabular-context-menu" style={{x: this.props.x, y: this.props.y}}>
			<li><span className="grayed icon icon-plus"></span> Add new row</li>
			<li><span className="grayed icon icon-multiple"></span> </li>
		</ul>
	}
})


export default TabularContextMenu