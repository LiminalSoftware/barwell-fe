import React from "react"
import _ from "underscore"
import $ from 'jquery'

import modelActionCreators from "../../../../actions/modelActionCreators"

import PopDownMenu from "../../../../components/PopDownMenu"

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
		var pointer = this.props.pointer
		var store = this.props.store
		var showDeleteOption = (pointer.top > 0 && pointer.left > 0) ? !!store.getValue(pointer.top, pointer.left) : false;
		var dimensions = (pointer.top < 0) ? store.getDimensions('column') : (pointer.left < 0) ? store.getDimensions('row') : null;


		return <PopDownMenu {...this.props} isgreen = {true}>
			{pointer.top < 0 || pointer.left < 0 ?
			<li onClick = {this.clickAddNewRow} className = "selectable">
				Add new record
				<span className="key-shortcut">ctrl+shift+plus</span>
			</li> : null}
			{pointer.top < 0 || pointer.left < 0 ?
			<li onClick = {this.clickAddNewRow} className = "selectable">
				Add new value of ...
				<span className="key-shortcut">ctrl+shift+plus</span>
			</li>
			:
			<li onClick = {this.clickCopySelection} className = "selectable">
				Copy selection 
				<span className="key-shortcut">ctrl+c</span>
			</li>
			}
			{(pointer.top > 0 && pointer.left > 0) ? showDeleteOption ?
			<li onClick = {this.clickDeleteRow} className = "selectable">
				Delete record(s)
				<span className="key-shortcut">ctrl+shift+minus</span>
			</li>
			:
			<li onClick = {this.clickDeleteRow} className = "selectable">
				Insert new record
				<span className="key-shortcut">ctrl+shift+plus</span>
			</li>
			: 
			null
			}
		</PopDownMenu>
	}
})

// <li onClick={this.clickCopySelection} className = "selectable">
// 	Copy selection as JSON  
// 	<span className="key-shortcut">ctrl+shift+c</span>
// </li>


export default CubeContextMenu
