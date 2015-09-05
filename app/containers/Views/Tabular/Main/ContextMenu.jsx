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

	componentWillMount: function () {
		document.addEventListener('keyup', this.handleKeyPress)
		document.addEventListener('click', this.props.handleContextBlur)
	},

	handleKeyPress: function (event) {
		if (event.keyCode === constant.keycodes.ESC) this.props.handleContextBlur()
	},

	clickAddNewRow: function (e) {

	},

	render: function () {
		return <ul className = "tabular-context-menu" style={{left: this.props.x, top: this.props.y}}>
			<li><span className="white icon icon-sign-in"></span> Add new record (shift-plus)</li>
			<li><span className="white icon icon-kub-trash"></span> Delete record (ctl-shift-minus)</li>
		</ul>
	}
})


export default TabularContextMenu
