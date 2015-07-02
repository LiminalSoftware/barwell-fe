import React from "react"
import $ from "jquery"
import fieldTypes from "./fields.jsx"
import FocusStore from '../../stores/FocusStore'
import modelActionCreators from "../../actions/modelActionCreators.jsx"
import constants from '../../constants/MetasheetConstants'

var TableMixin = {

	// ========================================================================
	// cell editing
	// ========================================================================

	getInitialState: function () {
		return {
			selection: {
				left: 0, 
				top: 0,
				right: 0,
				bottom: 0
			},
			pointer: {
				left: 0,
				top: 0
			},
			anchor: {
				left: 0, 
				top: 0
			},
			
			focused: false,
			editing: false
		}
	},

	componentDidMount: function () {
		$(document.body).on('keydown', this.onKey)
	},

	componentWillUnmount: function () {
		$(document.body).off('keydown', this.onKey)
	},

	// ========================================================================
	// selection control
	// ========================================================================

	onKey: function (e) {
		var sel = this.state.selection
		var view = this.props.view
		var model = this.props.model
		var keycodes = constants.keycodes
		
		var ptr = this.state.pointer
		var numCols = this.props.columns.length - 1
		var numRows = 10000 //TODO ... 
		var left = ptr.left
		var top = ptr.top
		var outline

		if (!this.props.focused || (
			this.state.editing &&
			e.keyCode !== keycodes.ENTER &&
			e.keyCode !== keycodes.TAB
		)) return;

		if (sel.left == sel.right && sel.top == sel.bottom) {
			outline = {left: 0, right: numCols, top: 0, bottom: numRows}
		} else {
			outline = sel
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

	// preventTextSelection: function (e) {
	// 	e.stopPropagation()
	// 	e.preventDefault()
	// 	return false
	// },

	onClick: function (e) {
		modelActionCreators.setFocus('view')
		
		var tableBody = React.findDOMNode(this.refs.tbody)
		var geometry = this.state.geometry
		var effHeight = geometry.rowPadding + geometry.rowHeight
		var columns = this.props.columns
		var offset = $(tableBody).offset()
		var y = event.pageY - offset.top
		var x = event.pageX - offset.left
		var r = Math.floor(y / effHeight, 1)
		var c = 0

		columns.forEach(function (col) {
			x -= (col.width + geometry.widthPadding)
			if (x > 0) c ++
		})
		this.updateSelect(r, c, event.shiftKey)
	},

	updateSelect: function (row, col, shift) {
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
			sel = {left: col, right: col, top: row, bottom: row}
		}
		this.setState({
			pointer: ptr,
			selection: sel,
			anchor: anc
		})
		// view.data.selection = sel
		// view.data.pointer = ptr
		// view.data.anchor = anchor
		// modelActionCreators.createView(view, false, false)
	},

	// ========================================================================
	// rendering
	// ========================================================================

	getSelectorStyle: function () {
		var geometry = this.state.geometry
		var effectiveHeight = geometry.rowHeight 
			+ geometry.rowPadding

		var sel = this.state.selection
		var columns = this.props.columns
		var width = 0
		var height = (sel.bottom - sel.top + 1) * effectiveHeight - geometry.rowPadding
		var left = geometry.leftOffset
		var top = geometry.headerHeight + sel.top * effectiveHeight - geometry.rowPadding
		
		columns.forEach(function (col, idx) {
			if (idx < sel.left)
				left += col.width + geometry.widthPadding
			else if (idx < sel.right + 1)
				width += col.width + geometry.widthPadding
		})
		return {
			top: top + 'px',
			left: left + 'px',
			minWidth: width + 'px',
			minHeight: height + "px"
		}
	},

	getPointerStyle: function () {
		var geometry = this.state.geometry
		var effectiveHeight = geometry.rowHeight 
			+ geometry.rowPadding
		var ptr = this.state.pointer
		var columns = this.props.columns
		var width = 0
		var height = geometry.rowHeight - 1
		var left = geometry.leftOffset
		var top = geometry.headerHeight + ptr.top * (effectiveHeight) 
			- geometry.rowPadding
		
		columns.forEach(function (col, idx) {
			if (idx < ptr.left)
				left += (col.width + geometry.widthPadding)
			else if (idx < ptr.left + 1)
				width = (col.width + geometry.widthPadding - 1)
		})
		return {
			top: top + 'px',
			left: left + 'px',
			minWidth: width + 'px',
			minHeight: height + "px"
		}
	}
}

export default TableMixin