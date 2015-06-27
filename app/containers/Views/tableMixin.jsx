import React from "react"
import $ from "jquery"
import fieldTypes from "./fields.jsx"

var TableMixin = {

	// ========================================================================
	// cell editing
	// ========================================================================

	startEdit: function (e) {
		var columns = this.getVisibleColumns()
		var col = columns[this.state.pointer.left]
		var field = fieldTypes[col.type]
		var obj = this.refs.tabularbody.getValueAt(this.state.pointer.top);
		var value = obj['a' + col.attribute_id]
		var parser = field.parser
		var validator = field.validator

		if (field.uneditable) return

		this.setState({
			editing: true, 
			editorObj: obj,
			editorCol: col,
			editorVal: value,
			editParser: parser,
			editValidator: validator
		}, function () {
			React.findDOMNode(this.refs.inputter).focus();
		})
		document.addEventListener('keyup', this.handleEditKeyPress)
	},

	handleEditUpdate: function (e) {
		var val = this.state.editParser(e.target.value)
		this.setState({editorVal: val})
	},
	
	handleEditKeyPress: function (event) {
		if (event.keyCode === 27) this.cancelChanges()
		if (event.keyCode === 13) this.commitChanges()
	},
	
	cancelChanges: function () {
		// TODO
		this.revert()
	},
	
	revert: function () {
		document.removeEventListener('keyup', this.handleEditKeyPress)
		this.setState({editing: false})
	},

	// ========================================================================
	// selection control
	// ========================================================================

	onKey: function (e) {
		if ((!this.state.focused) || this.state.editing) return;
		var ptr = this.state.pointer
		var numCols = this.getVisibleColumns().length - 1
		var numRows = 10000 //TODO ... 
		var left = ptr.left
		var top = ptr.top

		if (e.keyCode == 37 && left > 0) left --
		else if (e.keyCode == 38 && top > 0) top --
		else if (e.keyCode == 39 && left < numCols) left ++
		else if (e.keyCode == 40 && top < numRows) top ++
		else if (e.keyCode == 113) return this.startEdit(e)
		// else if (e.keyCode == 16) return (document.onselectstart = this.preventTextSelection)
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
		var wrapper = React.findDOMNode(this.refs.wrapper)
		var tableBody = React.findDOMNode(this.refs.tbody)
		var geometry = this.state.geometry
		var columns = this.getVisibleColumns()
		var y = event.pageY - wrapper.offsetTop + wrapper.scrollTop - geometry.headerHeight
		var x = event.pageX - wrapper.offsetLeft + wrapper.scrollLeft - 3
		var r = Math.floor(y/geometry.rowHeight,1)
		var c = 0
		
		this.setState({focused: true})

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
	},

	// ========================================================================
	// rendering
	// ========================================================================

	getSelectorStyle: function () {
		var geometry = this.state.geometry
		var sel = this.state.selection
		var columns = this.getVisibleColumns()
		var width = -1
		var height = (sel.bottom - sel.top + 1) * geometry.rowHeight - 2
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