import React from "react"
import $ from "jquery"
import fieldTypes from "./fields.jsx"
import FocusStore from '../../stores/FocusStore'
import modelActionCreators from "../../actions/modelActionCreators.jsx"
import constants from '../../constants/MetasheetConstants'
import _ from 'underscore'
import util from "../../util/util"

var TableMixin = {

	// ========================================================================
	// cell editing
	// ========================================================================

	getInitialState: function () {
		var view = this.props.view
		return {
			selection: _.extend({
				left: 0,
				top: 0,
				right: 0,
				bottom: 0
			}, view.data.selection),
			pointer: _.extend({
				left: 0,
				top: 0
			}, view.data.pointer),
			anchor: {
				left: 0,
				top: 0
			},
			editing: false
		}
	},

	componentDidMount: function () {
		$(document.body).on('keydown', this.onKey)
	},

	componentWillUnmount: function () {
		$(document.body).off('keydown', this.onKey)
	},


	isFocused: function () {
		return (FocusStore.getFocus() === 'view')
	},

	isCopied: function () {
		return !!(this.state.copyarea)
	},

	handleBlur: function () {
		this.setState({editing: false})
	},

	handleContextBlur: function () {
		this.setState({contextOpen: false})
	},

	// ========================================================================
	// selection control
	// ========================================================================


	onMouseDown: function (event) {
		modelActionCreators.setFocus('view')
		this.setState({mousedown: true})
		var rc = this.getRCCoords(event)
		this.updateSelect(rc.row, rc.col, event.shiftKey)
		document.addEventListener('selectstart', util.returnFalse)
		document.addEventListener('mousemove', this.onSelectMouseMove)
		document.addEventListener('mouseup', this.onMouseUp)
	},

	onSelectMouseMove: function (event) {
		var rc = this.getRCCoords(event, true)
		this.updateSelect(rc.row, rc.col, true)
	},

	onMouseUp: function (event) {
		this.setState({mousedown: false})
		document.removeEventListener('selectstart', util.returnFalse)
		document.removeEventListener('mousemove', this.onSelectMouseMove)
		document.removeEventListener('mouseup', this.onMouseUp)
	},

	onKey: function (e) {
		var sel = this.state.selection
		var view = this.props.view
		var model = this.props.model
		var keycodes = constants.keycodes
		var direction
		var ptr = this.state.pointer
		var numCols = this.getNumberCols()
		var numRows = this.getNumberRows()
		var left = ptr.left
		var top = ptr.top
		var outline

		if (!this.isFocused() || (
			this.state.editing &&
			e.keyCode !== keycodes.ENTER &&
			e.keyCode !== keycodes.TAB
		)) return;

		if (sel.left == sel.right && sel.top == sel.bottom) {
			outline = {left: 0, right: numCols, top: 0, bottom: numRows}
		} else {
			outline = sel
		}
		if (e.keyCode == keycodes.ESC) {
			this.setState({copyarea: null})
		}
		if (e.keyCode == keycodes.C && e.ctrlKey) {
			this.copySelection()
			e.preventDefault()
			return;
		}
		if (e.keyCode == keycodes.PLUS && e.ctrlKey && e.shiftKey) {
			this.insertRecord()
			e.preventDefault()
			return;
		}
		if (e.keyCode == keycodes.MINUS && e.ctrlKey && e.shiftKey) {
			this.deleteRecords()
			e.preventDefault()
			return;
		}
		if (e.keyCode == keycodes.TAB) {
			if (left < outline.right) left++;
			else {
				left = outline.left;
				top++;
				if (top > outline.bottom)
					top = outline.top
			}
			this.setState({
				pointer: {left: left, top: top},
			})
			if (sel.left == sel.right && sel.top == sel.bottom) this.setState({
				selection: {left: left, right: left, top: top, bottom: top}
			})
			e.preventDefault()
			return;
		} else if (e.keyCode == keycodes.ENTER) {
			if (top < outline.bottom) top++;
			else {
				top = outline.top;
				left++;
				if (left > outline.right)
					left = outline.left
			}
			this.setState({
				pointer: {left: left, top: top},
			})
			if (sel.left == sel.right && sel.top == sel.bottom) this.setState({
				selection: {left: left, right: left, top: top, bottom: top}
			})
			e.preventDefault()
			return;
		}
		else if (e.keyCode == keycodes.F2) return this.editCell(e);
		else if (e.keyCode == keycodes.SPACE && e.shiftKey) {
			this.selectRow()
			return
		} else if (e.keyCode == keycodes.PLUS && e.shiftKey) {
			modelActionCreators.createRecord(model, top)
		}
		else if (e.keyCode >= 37 && e.keyCode <= 40) {
			if (e.keyCode == keycodes.ARROW_LEFT) {
				direction = 'left'
				left --
			} else if (e.keyCode == keycodes.ARROW_UP) {
				direction ='up'
				top --
			} else if (e.keyCode == keycodes.ARROW_RIGHT) {
				direction = 'right'
				left ++
			} else if (e.keyCode == keycodes.ARROW_DOWN) {
				direction = 'down'
				top ++
			}
		}
		else if (e.keyCode >= 48 && e.keyCode <= 90) {
			return this.editCell(e);
		} else return;

		e.stopPropagation()
  		e.preventDefault()
		if (e.keyCode >= 37 && e.keyCode <= 40) this.updateSelect(top, left, e.shiftKey, direction)
	},

	selectColumn: function () {

	},

	commitSelection: function () {
		view.data.selection = this.state.selection
		view.data.pointer = this.state.pointer
		view.data.anchor = this.state.anchor
		modelActionCreators.createView(view, false, false)
	}

	// ========================================================================
	// rendering
	// ========================================================================


}

export default TableMixin
