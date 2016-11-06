import React from "react"
import update from 'react/lib/update'
import _ from "underscore"

import modelActionCreators from "../../../../actions/modelActionCreators"
import constants from "../../../../constants/MetasheetConstants"
import fieldTypes from "../../../fields"

import util from "../../../../util/util"

import TableBodyContext from "./TableBodyContext"
import NewAttributeContext from "./NewAttributeContext"
import ColumnContext from "./ColumnContext"

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
		const {ESC, ENTER} = constants.keycodes
		const refs = this.refs
		if (e.keyCode === ESC || e.keyCode === ENTER) {
			Object.keys(refs).map(key => refs[key])
				.filter(ref => !!ref.teardown)
				.forEach(ref => ref.teardown(e.keyCode === ENTER))
			this.props.blurContextMenu()
		}
	},

	handleClick: function (e) {
		this.props.blurContextMenu(e, 'v' + this.props.view.view_id)
	},
	
	render: function () {
		const {view, column, element} = this.props
		if (this.props.element) {
			return <ColumnContext {...this.props} 
			key={column.column_id}
			config={column} 
			colHeader={element} 
			ref="ColumnContext"/>
		} else {
			return <TableBodyContext {...this.props} ref = 'bodyContext'/>	
		}
		
	}
})


export default TabularContextMenu
