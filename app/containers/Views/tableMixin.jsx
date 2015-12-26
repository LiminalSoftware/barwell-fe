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


	

	onSelectMouseMove: function (e) {
		this.updateSelect(this.getRCCoords(e), true)
	},

	onMouseUp: function (e) {
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
		var mode = e.shiftKey ? 'SHIFT' : 'MOVE';

		var left = ptr.left
		var top = ptr.top

		if (!this.isFocused() || (
			this.state.editing &&
			e.keyCode !== keycodes.ENTER &&
			e.keyCode !== keycodes.TAB
		)) return;

		if (e.keyCode == keycodes.DELETE) {
			this.clearSelection();
			return;
		}
		if (e.keyCode == keycodes.ESC) {
			this.setState({copyarea: null})
			return;
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
			this.move('TAB', e.shiftKey)
			e.preventDefault()
			return;
		} else if (e.keyCode == keycodes.ENTER) {
			this.move('ENTER', e.shiftKey)
			e.preventDefault()
			return;
		}
		else if (e.keyCode == keycodes.F2) return this.editCell(e);
		else if (e.keyCode == keycodes.SPACE && e.shiftKey) {
			this.selectRow()
			e.preventDefault()
			return;
		} else if (e.keyCode == keycodes.PLUS && e.shiftKey) {
			modelActionCreators.createRecord(model, top)
			e.preventDefault()
		}
		else if (e.keyCode == keycodes.ARROW_LEFT) {
			this.move('LEFT', e.shiftKey);
			e.preventDefault()
			return;
		} else if (e.keyCode == keycodes.ARROW_UP) {
			this.move('UP', e.shiftKey);
			e.preventDefault()
			return;
		} else if (e.keyCode == keycodes.ARROW_RIGHT) {
			this.move('RIGHT', e.shiftKey);
			e.preventDefault()
			return;
		} else if (e.keyCode == keycodes.ARROW_DOWN) {
			this.move('DOWN', e.shiftKey);
			e.preventDefault()
			return;
		}
		else if (e.keyCode >= 48 && e.keyCode <= 90) {
			return this.editCell(e);
		}
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
