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

	

	// ========================================================================
	// selection control
	// ========================================================================

	onKey: function (e) {
		var sel = this.state.selection
		var view = this.props.view
		var keycodes = constants.keycodes
		if (FocusStore.getFocus() !== 'view' || (this.state.editing && 
			e.keyCode != keycodes.ENTER && e.keyCode != keycodes.TAB)) return;
		var ptr = this.state.pointer
		var numCols = this.getVisibleColumns().length - 1
		var numRows = 10000 //TODO ... 
		var left = ptr.left
		var top = ptr.top


		if (e.keyCode == keycodes.ARROW_LEFT && left > 0) left --
		else if (e.keyCode == keycodes.ARROW_UP && top > 0) top --
		else if (e.keyCode == keycodes.ARROW_RIGHT && left < numCols) left ++
		else if (e.keyCode == keycodes.ARROW_DOWN && top < numRows) top ++
		else if (e.keyCode == keycodes.F2) return this.startEdit(e);
		// else if (e.keyCode == 16) return (document.onselectstart = this.preventTextSelection)
		else if (e.keyCode == keycodes.ENTER && top < numRows) top ++;
		else if (e.keyCode == keycodes.TAB) { 
			if (left < numCols) left++;
		} else if (e.keyCode == keycodes.SPACE && e.shiftKey) { 
			sel.left = 0; 
			sel.right = numCols;
			this.setState({selection: sel})
			return;
		} else if (e.keyCode == keycodes.PLUS && e.shiftKey) {
			modelActionCreators.createRecord(view, top)
		}
		else return

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
		var wrapper = React.findDOMNode(this.refs.wrapper)
		var tableBody = React.findDOMNode(this.refs.tbody)
		var geometry = this.state.geometry
		var columns = this.getVisibleColumns()
		var y = event.pageY - wrapper.offsetTop + wrapper.scrollTop - geometry.headerHeight
		var x = event.pageX - wrapper.offsetLeft + wrapper.scrollLeft - 3
		var r = Math.floor(y/geometry.rowHeight,1)
		var c = 0

		e.stopPropagation()
  		e.preventDefault()

		columns.forEach(function (col) {
			x -= col.width + geometry.widthPadding
			if (x > 0) c ++
		})
		this.updateSelect(r, c, event.shiftKey)
	},

	onScroll: function (event) {
		var wrapper = React.findDOMNode(this.refs.wrapper)
		this.setState({scrollTop: wrapper.scrollTop})
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
		var sel = this.state.selection
		var columns = this.getVisibleColumns()
		var width = -1
		var height = (sel.bottom - sel.top + 1) * geometry.rowHeight - 1
		var left = 3
		var top = geometry.headerHeight + this.state.selection.top * geometry.rowHeight
		
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
		var ptr = this.state.pointer
		var columns = this.getVisibleColumns()
		var width
		var height = geometry.rowHeight - 2
		var left = 2
		var top = geometry.headerHeight + ptr.top * geometry.rowHeight - 1
		
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