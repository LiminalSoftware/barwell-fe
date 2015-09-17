import React from "react"
import $ from "jquery"
import fieldTypes from "./fields.jsx"
import FocusStore from '../../stores/FocusStore'
import modelActionCreators from "../../actions/modelActionCreators.jsx"
import constants from '../../constants/MetasheetConstants'
import _ from 'underscore'

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

	onClick: function (event) {
		// this.ieMozPreventSelction()
		modelActionCreators.setFocus('view')
		var rc = this.getRCCoords(event)
		this.updateSelect(rc.row, rc.col, event.shiftKey)
	},

	onMouseDown: function (event) {
		// this.ieMozPreventSelction()
		modelActionCreators.setFocus('view')
		var rc = this.getRCCoords(event)
		this.updateSelect(rc.row, rc.col, event.shiftKey)
		document.addEventListener('mousemove', this.onSelectMouseMove)
		document.addEventListener('mouseup', this.onMouseUp)
	},

	onSelectMouseMove: function (event) {
		var rc = this.getRCCoords(event)
		this.updateSelect(rc.row, rc.col, true)
	},

	onMouseUp: function (event) {
		document.removeEventListener('mousemove', this.onSelectMouseMove)
		document.removeEventListener('mouseup', this.onMouseUp)
	},

	onKey: function (e) {
		var sel = this.state.selection
		var view = this.props.view
		var model = this.props.model
		var keycodes = constants.keycodes

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
		else if (e.keyCode == keycodes.ARROW_LEFT && left > 0) left --;
		else if (e.keyCode == keycodes.ARROW_UP && top > 0) top --;
		else if (e.keyCode == keycodes.ARROW_RIGHT && left < numCols) left ++;
		else if (e.keyCode == keycodes.ARROW_DOWN && top < numRows) top ++;
		else if (e.keyCode == keycodes.F2) return this.editCell(e);
		else if (e.keyCode == keycodes.SPACE && e.shiftKey) {
			sel.left = 0;
			sel.right = numCols;
			this.setState({selection: sel})
			return;
		} else if (e.keyCode == keycodes.PLUS && e.shiftKey) {
			modelActionCreators.createRecord(model, top)
		}
		else if (e.keyCode >= 48 && e.keyCode <= 90) {
			return this.editCell(e);
		} else return;

		e.stopPropagation()
  		e.preventDefault()
		if (e.keyCode >= 37 && e.keyCode <= 40) this.updateSelect(top, left, e.shiftKey)
	},

	selectRow: function () {
		var numCols = this.getNumberCols()
		var sel = this.state.selection
		sel.left = 0;
		sel.right = numCols;
		this.setState({selection: sel})
	},

	updateSelect: function (row, col, shift, fullRow) {
		var numCols = this.getNumberCols()
		var sel = this.state.selection
		var anc = this.state.anchor
		var ptr = {left: col, top: row}
		var view = this.props.view

		if (shift) {
			if (!anc) anc = {left: col, top: row}
			sel = {
				left: Math.min(anc.left, ptr.left),
				right: Math.max(anc.left, ptr.left),
				top: Math.min(anc.top, ptr.top),
				bottom: Math.max(anc.top, ptr.top)
			}
		} else {
			ptr = anc = {left: col, top: row}
			sel = {
				left: fullRow ? 0 : col,
				right: fullRow ? numCols : col,
				top: row,
				bottom: row
			}
		}
		this.setState({
			pointer: ptr,
			selection: sel,
			anchor: anc
		})
		view.data.selection = sel
		view.data.pointer = ptr
		view.data.anchor = anc
		modelActionCreators.createView(view, false, false)
	},

	// ========================================================================
	// rendering
	// ========================================================================


}

export default TableMixin
