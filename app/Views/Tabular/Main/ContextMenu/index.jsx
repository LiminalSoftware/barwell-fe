import React from "react"
import update from 'react/lib/update';
import _ from "underscore"
import $ from 'jquery'

import modelActionCreators from "../../../../actions/modelActionCreators"
import constant from "../../../../constants/MetasheetConstants"
import fieldTypes from "../../../fields"

import util from "../../../../util/util"

import ColumnConfigContext from "./ColumnConfigContext"
import TableBodyContext from "./TableBodyContext"

var TabularContextMenu = React.createClass ({

	getConfig: function () {
		const rc = this.props.rc
		const view = this.props.view
		return view.data._visibleCols[rc.left]
	},

	componentDidMount: function () {
		document.addEventListener('keyup', this.handleKeyPress)
		document.addEventListener('click', this.handleClick)
	},

	componentWillUnmount: function () {
		document.removeEventListener('keyup', this.handleKeyPress)
		document.removeEventListener('click', this.handleClick)
	},

	handleKeyPress: function (e) {
		if (e.keyCode === constant.keycodes.ESC) this.props._hideContextMenu()
	},

	handleClick: function (e) {
		this.props._hideContextMenu(e)
	},

	render: function () {
		const rc = this.props.rc
		if (rc.top >= 0 && rc.left >= 0) return <TableBodyContext {...this.props}/>
		else return <ColumnConfigContext {...this.props} config={this.getConfig()}/>
	}
})


export default TabularContextMenu
