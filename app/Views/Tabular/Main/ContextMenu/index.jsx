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
import NewAttributeContext from "./NewAttributeContext"

var TabularContextMenu = React.createClass ({

	getConfig: function () {
		const rc = this.props.rc
		const view = this.props.view
		return view.data._visibleCols[rc.left]
	},

	getFocusId: function () {
		return 'v' + this.props.view.view_id + '-context'
	},

	componentDidMount: function () {
		document.addEventListener('keydown', this.handleKeyPress)
		document.addEventListener('click', this.handleClick)
		modelActionCreators.setFocus(this.getFocusId())
	},

	componentWillUnmount: function () {
		document.removeEventListener('keydown', this.handleKeyPress)
		document.removeEventListener('click', this.handleClick)
	},

	handleKeyPress: function (e) {
		if (e.keyCode === constant.keycodes.ESC) this.props.blurContextMenu()
	},

	handleClick: function (e) {
		this.props.blurContextMenu(e, newFocus)
	},
	
	render: function () {
		const subject = this.props.subject
		if (subject === 'column') 
			return <ColumnConfigContext 
				{...this.props}
				config={this.getConfig()}/>
		else if (subject === 'body') 
			return <TableBodyContext {...this.props}/>
		else if (subject === 'newAttribute') 
			return <NewAttributeContext {...this.props}/>
			
	}
})


export default TabularContextMenu
