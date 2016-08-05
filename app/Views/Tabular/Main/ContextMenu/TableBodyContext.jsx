import React from "react"
import update from 'react/lib/update';
import _ from "underscore"
import $ from 'jquery'


import modelActionCreators from "../../../../actions/modelActionCreators"
import constant from "../../../../constants/MetasheetConstants"
import fieldTypes from "../../../fields"

import util from "../../../../util/util"

var TableBodyContext = React.createClass ({

	clickSelectRecords: function (e) {
		this.props._selectRow()
	},

	clickAddNewRow: function (e) {
		this.props._insertRecord()
	},

	clickDeleteRow: function (e) {
		this.props._deleteRecords()
	},

	clickCopySelection: function (e) {
		this.props._copySelection()
	},

	clickJSONCopySelection: function (e) {
		this.props._copySelectionAsJSON()
	},

	render: function () {
		const style = {
			position: "absolute",
			left: this.props.position.x,
			top: this.props.position.y,
		}

		return <div className="context-menu" style={style}>
			<div onClick={this.clickSelectRecords} className = "popdown-item selectable bottom-divider">
				<span className="icon icon-focus"/>
				Select records
				<span className="key-shortcut">Ctrl+Shift+C</span>
			</div>
			<div onClick={this.clickCopySelection} className = "popdown-item selectable">
				<span className="icon icon-clipboard-empty"/>
				Copy selection  
				<span className="key-shortcut">Ctrl+C</span>
			</div>
			<div onClick={this.clickJSONCopySelection} className = "popdown-item selectable bottom-divider">
				<span className="icon icon-code"/>
				Copy as JSON  
				<span className="key-shortcut">Ctrl+Shift+C</span>
			</div>
			<div onClick={this.clickAddNewRow} className = "popdown-item selectable">
				<span className="icon icon-flare"/>
				Insert new record
				<span className="key-shortcut">Ctrl+Shift+Plus</span>
			</div>
			<div onClick={this.clickDeleteRow} className = "popdown-item selectable">
				<span className="icon icon-trash2"/>
				Delete record
				<span className="key-shortcut">Ctrl+Shift+Minus</span>
			</div>
			
		</div>
	}

})




export default TableBodyContext
