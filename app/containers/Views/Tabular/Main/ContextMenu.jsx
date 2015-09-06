import React from "react"
import styles from "./contextMenuStyle.less"
import _ from "underscore"
import $ from 'jquery'

import modelActionCreators from "../../../../actions/modelActionCreators"

import ViewDataStores from "../../../../stores/ViewDataStores"
import storeFactory from 'flux-store-factory';
import dispatcher from '../../../../dispatcher/MetasheetDispatcher'

import constant from "../../../../constants/MetasheetConstants"

var TabularContextMenu = React.createClass ({

	getInitialState: function () {
		return {}
	},

	_onChange: function () {
		this.forceUpdate()
	},

	componentDidMount: function () {
		document.addEventListener('keyup', this.handleKeyPress)
		document.addEventListener('click', this.handleClick)
	},

	handleKeyPress: function (event) {
		if (event.keyCode === constant.keycodes.ESC) this.props.handleContextBlur()
	},

	handleClick: function (event) {
		this.props.handleContextBlur()
	},

	clickAddNewRow: function (e) {
		this.props.insertRecord()
	},

	clickDeleteRow: function (e) {
		this.props.deleteRecords()
	},

	render: function () {
		return <ul className = "tabular-context-menu" style={{left: this.props.x, top: this.props.y}}>
			<li onClick={this.clickAddNewRow}><span className="white icon icon-sign-in"></span> Add new record [SHIFT-PLUS]</li>
			<li><span className="white icon icon-bolt"></span> Copy selection  [CTL-C]</li>
			<li onClick={this.clickDeleteRow}><span className="white icon icon-kub-trash"></span> Delete record [CTL-SHIFT-MINUS]</li>
		</ul>
	}
})


export default TabularContextMenu
