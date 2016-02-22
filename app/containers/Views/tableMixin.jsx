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
			editing: false
		}
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

		var ctrlKey = (e.ctrlKey || e.metaKey)

		if (!this.isFocused() || (
			this.state.editing &&
			e.keyCode !== keycodes.ENTER &&
			e.keyCode !== keycodes.TAB
		)) return;

		else if (e.keyCode == keycodes.DELETE) {
			this.clearSelection();
			return;
		}
		else if (e.keyCode == keycodes.SPACE) {
			this.toggleExpand();
			return;
		}
		else if (e.keyCode == keycodes.ESC) {
			this.setState({copyarea: null, expanded: false})
			return;
		}
		else if (e.keyCode == keycodes.C && ctrlKey) {
			this.copySelection()
			e.preventDefault()
			return;
		}
		// if (e.keyCode == keycodes.V && e.ctrlKey) {
		// 	this.pasteSelection(e)
		// 	e.preventDefault()
		// 	return;
		// }
		else if (e.keyCode == keycodes.PLUS && ctrlKey && e.shiftKey) {
			this.insertRecord()
			e.preventDefault()
			return;
		}
		else if (e.keyCode == keycodes.MINUS && ctrlKey && e.shiftKey) {
			this.deleteRecords()
			e.preventDefault()
			return;
		}
		else if (e.keyCode == keycodes.TAB) {
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
		else if ((
				(e.keyCode >= 48 && e.keyCode <= 90) || 
				(e.keyCode >= 96 && e.keyCode <= 111) ||
				(e.keyCode >= 186 && e.keyCode <= 222)
			) && !ctrlKey) {
			return this.editCell(e);
		}
	}

}

export default TableMixin
