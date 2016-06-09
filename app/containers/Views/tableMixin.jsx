import React from "react"
import ReactDOM from "react-dom"

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
		var viewconfig = this.props.viewconfig;

		return {
			selection: _.extend({
				left: 0,
				top: 0,
				right: 0,
				bottom: 0
			}, viewconfig.selection),
			pointer: _.extend({
				left: 0,
				top: 0
			}, viewconfig.pointer),
			editing: false
		}
	},
	
	isFocused: function () {
		return (FocusStore.getFocus(0) === 'view')
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

	toggleExpand: function () {
		// this.setState({expanded: !this.state.expanded})
	},

	showContext: function (e) {
		var pos = this.getRCCoords(e)
		var sel = this.state.selection
		if (pos.left >= sel.left && pos.left <= sel.right &&
			pos.top >= sel.top && pos.top <= sel.bottom) this.updatePointer(pos)
		else this.updateSelect(pos, false)
		this.setState({
			contextOpen: true
		})
		e.preventDefault();
	},

	hideContext: function (e) {
		this.setState({
			contextOpen: false
		})
	},

	handleMouseWheel: function (e) {
		this.refs.verticalScrollBar.handleMouseWheel(e)
		this.refs.horizontalScrollBar.handleMouseWheel(e)
	},

	blurPointer: function (e) {
		var current = this.refs.cursors.refs.pointerCell
		if (current) {
			if (current.commitChanges) current.commitChanges(e)
		}
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
			this.clearCopy()
			// this.setState({copyarea: null, expanded: false})
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
			this.insertRecord();
			e.preventDefault();
			return;
		}
		else if (e.keyCode == keycodes.MINUS && ctrlKey && e.shiftKey) {
			this.deleteRecords()
			e.preventDefault()
			return;
		}
		else if (e.keyCode == keycodes.TAB) {
			this.move('TAB', e.shiftKey)
			e.preventDefault();
			return;
		} else if (e.keyCode == keycodes.ENTER) {
			this.move('ENTER', e.shiftKey)
			e.preventDefault();
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
	},

	handleDragOver: function (e) {
		var model = this.props.model
		var pos = this.getRCCoords(e);
		var config = this.getColumnAt(pos);
		var relationId = config.relation_id;
		var relatedModelId = config.related_model_id
		
		if (e.dataTransfer.types.includes('m' + relatedModelId)) {
			e.preventDefault();
		}		
	},

	handleDrop: function (e)  {
		var model = this.props.model
		var pos = this.getRCCoords(e);
		var config = this.getColumnAt(pos);
		var relatedModelId = config.related_model_id
		var relationId = config.relation_id
		var thisObj = this.getValueAt(pos.top)
		var relObj = JSON.parse(
			e.dataTransfer.getData('m' + relatedModelId)
		)
		modelActionCreators.moveHasMany(relationId, thisObj, relObj);
		
		util.clickTrap(e);
		// e.dataTransfer.dropEffect = 'move'
	},

	onMouseDown: function (e) {
		// if right click then do not bother
		if (("which" in e && e.which === 3) || 
    		("button" in e && e.button === 2)) {
        	e.preventDefault()
        	return;
        }

		if (FocusStore.getFocus(0) !== 'view')
			modelActionCreators.setFocus('view')
		this.updateSelect(this.getRCCoords(e), e.shiftKey)
		
		addEventListener('selectstart', util.returnFalse)
		addEventListener('mousemove', this.onSelectMouseMove)
		addEventListener('mouseup', this.onMouseUp)
	},

	onSelectMouseMove: function (e) {;
		this.updateSelect(this.getRCCoords(e), true);
	},

	onMouseUp: function (e) {
		removeEventListener('selectstart', util.returnFalse);
		removeEventListener('mousemove', this.onSelectMouseMove);
		removeEventListener('mouseup', this.onMouseUp);
		document.getElementById("copy-paste-dummy").focus();
	},


	move: function (direction, shift) {
		var sel = _.clone(this.state.selection);
		var ptr = _.clone(this.state.pointer);
		var numCols = this.getNumberCols();
		var numRows = this.getNumberRows();
		var singleCell = (sel.left === sel.right && sel.top === sel.bottom)
		var outline = singleCell ? {left: 0, right: numCols, top: 0, bottom: numRows} : sel ;

		// Tab ----------------------
		if (direction === 'TAB') {
			var lilMod = (outline.right - outline.left + 1)
			var bigMod = lilMod * (outline.bottom - outline.top + 1)
			var index = (ptr.top - outline.top) * lilMod + ptr.left - outline.left
			index += (shift ? -1 : 1)
			if (index < 0) index += bigMod
			index = index % bigMod
			ptr.left = (index % lilMod) + outline.left
			ptr.top = Math.floor(index / lilMod) + outline.top
			// if (singleCell) this.setState({selection: {left: ptr.left, right: ptr.left,
			// 	top: ptr.top, bottom: ptr.top}})
			if (singleCell) this.updateSelect({left: ptr.left, right: ptr.left,
				top: ptr.top, bottom: ptr.top})
			this.updatePointer(ptr)
		}
		// Enter ---------------------
		else if (direction === 'ENTER') {
			var lilMod = (outline.bottom - outline.top + 1)
			var bigMod = lilMod * (outline.right - outline.left + 1)
			var index = (ptr.left - outline.left) * lilMod + ptr.top - outline.top
			index += (shift ? -1 : 1)
			if (index < 0) index += bigMod
			index = index % bigMod
			ptr.left = Math.floor(index / lilMod) + outline.left
			ptr.top = (index % lilMod) + outline.top
			// if (singleCell) this.setState({selection: {left: ptr.left, right: ptr.left,
			// 	top: ptr.top, bottom: ptr.top}})
			if (singleCell) this.updateSelect({left: ptr.left, right: ptr.left,
				top: ptr.top, bottom: ptr.top})
			this.updatePointer(ptr)
		}
		// Right ------------------------
		else if (direction === 'RIGHT' && shift) {
			if (sel.left === ptr.left && sel.right < numCols) sel.right += 1
			else if (sel.left < ptr.left) sel.left += 1
			this.setState({selection: sel})
		} else if (direction === 'RIGHT') {
			if (ptr.left < numCols) ptr.left = (ptr.left + 1)
			this.updateSelect(ptr, shift)
		}
		// Left --------------------------
		else if (direction === 'LEFT' && shift) {
			if (sel.right > ptr.left) sel.right -= 1
			else if (sel.left > 0) sel.left -= 1
			this.setState({selection: sel})
		} else if (direction === 'LEFT') {
			if (ptr.left > 0) ptr.left -= 1
			this.updateSelect(ptr, false)
		}

		// Down ---------------------------
		else if (direction === 'DOWN' && shift) {
			if (sel.top < ptr.top) sel.top += 1
			else if (sel.bottom < numRows) sel.bottom += 1
			this.setState({selection: sel})
		} else if (direction === 'DOWN') {
			if (ptr.top < numRows) ptr.top = (ptr.top + 1)
			this.updateSelect(ptr, shift)
		}
		// Up
		else if (direction === 'UP' && shift) {
			if (sel.bottom > ptr.top) sel.bottom -= 1
			else if (sel.top > 0) sel.top -= 1
			this.setState({selection: sel})
		} else if (direction === 'UP') {
			if (ptr.top > 0) ptr.top -= 1
			this.updateSelect(ptr, false)
		}
	},

	componentWillMount: function () {
		this._debounceCreateView = _.debounce(this.createView, 500);
		this._debounceCreateViewconfig = _.debounce(this.createViewconfig, 500);
		this._debounceCalibrateHeight = _.debounce(this.calibrateHeight, 500);
	},

	createViewconfig: function (viewconfig) {
		modelActionCreators.create('viewconfig', false, viewconfig);
	},
	
	createView: function (view) {
		modelActionCreators.createView(view, false, false, true)
	},

	calibrateHeight: function () {
		var wrapper = ReactDOM.findDOMNode(this.refs.tableWrapper)
		var view = this.props.view
		var geo = view.data.geometry
		this.setState({
			visibleHeight: wrapper.offsetHeight,
			visibleRows: Math.floor((wrapper.offsetHeight - geo.headerHeight) / geo.rowHeight)
		})
	}

}

export default TableMixin
