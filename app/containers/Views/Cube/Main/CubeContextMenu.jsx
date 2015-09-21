import React from "react"
import _ from "underscore"
import $ from 'jquery'

import modelActionCreators from "../../../../actions/modelActionCreators"
import ViewDataStores from "../../../../stores/ViewDataStores"
import storeFactory from 'flux-store-factory';
import dispatcher from '../../../../dispatcher/MetasheetDispatcher'
import constant from "../../../../constants/MetasheetConstants"

var CubeContextMenu = React.createClass ({

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

	clickCopySelection: function (e) {
		this.props.copySelection()
	},

	render: function () {
		return <ul className = "tabular-context-menu" style={{left: this.props.x, top: this.props.y}}>
			<li onClick={this.clickAddNewRecord}><span className="white icon icon-sign-in"></span> Create new record [CTL-SHIFT-PLUS]</li>
			<li onClick={this.clickCopySelection}><span className="white icon icon-bolt"></span> Copy selection  [CTL-C]</li>
			<li onClick={this.clickDeleteRow}><span className="white icon icon-kub-trash"></span> Delete record(s) [CTL-SHIFT-MINUS]</li>
		</ul>
	}
})


export default CubeContextMenu
