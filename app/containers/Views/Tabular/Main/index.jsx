import React from "react"
import ReactDOM from "react-dom"
import { RouteHandler } from "react-router"
import cursorStyles from "./styles/cursors.less"

import _ from 'underscore'
import $ from 'jquery'

import modelActionCreators from "../../../../actions/modelActionCreators.jsx"

import ModelStore from "../../../../stores/ModelStore"
import KeyStore from "../../../../stores/KeyStore"
import ViewStore from "../../../../stores/ViewStore"
import KeycompStore from "../../../../stores/KeycompStore"
import AttributeStore from "../../../../stores/AttributeStore"
import FocusStore from "../../../../stores/FocusStore"

import util from "../../../../util/util"
import copyTextToClipboard from "../../../../util/copyTextToClipboard"

import ViewDataStores from "../../../../stores/ViewDataStores"
import storeFactory from 'flux-store-factory';
import dispatcher from '../../../../dispatcher/MetasheetDispatcher'
import createTabularStore from './TabularStore.jsx'

import fieldTypes from "../../fields"
import TabularBodyWrapper from "./TabularBodyWrapper"
import TableMixin from '../../TableMixin'
import ContextMenu from './ContextMenu'
import ScrollBar from "./ScrollBar"
import Cursors from "./Cursors"

import constant from "../../../../constants/MetasheetConstants"

import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import PureRenderMixin from 'react-addons-pure-render-mixin';

var THROTTLE_DELAY = 14
var MIN_CYCLE = 10
var CYCLE = 50

var getFrame = function (f, cycle) {
	if (window.requestAnimationFrame) return window.requestAnimationFrame(f)
	else return window.setTimeout(f, cycle)
}

var cancelFrame = function (id) {
	if (window.cancelAnimationFrame) return window.cancelAnimationFrame(id)
	else return window.clearTimeout(id)
}

var TabularPane = React.createClass ({

	mixins: [TableMixin],

	getInitialState: function () {
		return {
			sorting: null,
			contextOpen: false,
			detailOpen: false,
			detailWidth: 300,
			contextX: null,
			contextY: null,
			hiddenCols: 0,
			hiddenColWidth: 0,
			rowOffset: 0,
			expanded: false,
			context: false,
			renderSide: 'lhs'
		}
	},


	componentWillMount: function () {
		var copyPasteDummy = document.getElementById('copy-paste-dummy')

		document.body.addEventListener('keydown', this.onKey)
		copyPasteDummy.addEventListener('paste', this.pasteSelection)
		FocusStore.addChangeListener(this._onChange)
		ViewStore.addChangeListener(this._onChange)
		this.store = createTabularStore(this.props.view)
		this.store.addChangeListener(this._onChange)
		this._debounceCalibrateHeight = _.debounce(this.calibrateHeight, 500)
		this._debounceCreateView = _.debounce(this.createView, 500)

	},

	componentWillUnmount: function () {
		var copyPasteDummy = document.getElementById('copy-paste-dummy')
		document.body.removeEventListener('keydown', this.onKey)
		FocusStore.removeChangeListener(this._onChange)
		ViewStore.removeChangeListener(this._onChange)
		copyPasteDummy.removeEventListener('paste', this.pasteSelection)
		removeEventListener('resize', this._debounceCalibrateHeight)
		this.store.removeChangeListener(this._onChange)
		this.store.unregister()
	},

	componentDidMount: function () {
		var copyPasteDummy = document.getElementById('copy-paste-dummy')
		copyPasteDummy.addEventListener('paste', this.pasteSelection)
		addEventListener('resize', this._debounceCalibrateHeight)
		copyPasteDummy.focus()
		this.calibrateHeight()
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
	},

	shouldComponentUpdate: function (nextProps, nextState) {
		var _this = this
		var props = this.props
		var state = this.state
		return props.view !== nextProps.view ||
			state.selection !== nextState.selection ||
			state.pointer !== nextState.pointer ||
			state.copyarea !== nextState.copyarea ||
			// state.rowOffset !== nextState.rowOffset ||
			state.expanded !== nextState.expanded ||
			state.hiddenColWidth !== nextState.hiddenColWidth;
	},

	_onChange: function () {
		var focused = (FocusStore.getFocus() == 'view')
		if (!focused) this.blurPointer()
		this.forceUpdate()
		this.refs.tableWrapper.forceUpdate()
		this.refs.cursors.forceUpdate()
	},

	getTotalWidth: function () {
    var view = this.props.view
		return util.sum(view.data.visibleCols, 'width')
	},

	getNumberCols: function () {
		return this.props.view.data.visibleCols.length - 1
	},

	getNumberRows: function () {
		return this.store.getRecordCount() - 1
	},

	getValueAt: function (idx) {
		return this.store.getObjects()[idx]
	},

	selectRow: function () {
		var numCols = this.getNumberCols()
		var sel = this.state.selection
		sel.left = 0;
		sel.right = numCols;
		this.setState({selection: sel})
	},

	getRCCoords: function (e) {
		var lhs = ReactDOM.findDOMNode(this.refs.tableWrapper.refs.lhs)
		var view = this.props.view
		var geo = view.data.geometry
		var visibleCols = view.data.visibleCols
		var scrolledCols = this.state.hiddenCols
		var numFixed = view.data.fixedCols.length
		var offset = $(lhs).offset()
		var y = e.pageY - offset.top
		var x = e.pageX - offset.left - geo.labelWidth
		var xx = x
		var r = Math.floor((y) / geo.rowHeight, 1)
		var c = 0

		visibleCols.some(function (col, idx) {
			if (idx < numFixed || idx - numFixed >= scrolledCols) xx -= col.width
			if (xx > 0) c++
			else return true
		})
		c = Math.min(visibleCols.length - 1, c)
		c = Math.max(0, c)
		r = Math.max(0, r)
		r = Math.min(r, this.store.getRecordCount() - 1)

		return {top: r, left: c}
	},

	editCell: function (e) {
		var pos = this.state.pointer
		var field = this.refs.cursors.refs.pointerCell
		if (!field.handleEdit) return
		
		this.setState({
			editing: true,
			copyarea: null
		})
		field.handleEdit(e);
	},

	addRecord: function () {
		var cid = this.store.getClientId()
		var obj = {cid: cid}
		this.blurPointer()
		modelActionCreators.insertRecord(this.props.model, obj, this.store.getRecordCount())
		this.setState({copyarea: null})
	},

	insertRecord: function (pos) {
		var cid = this.store.getClientId()
		var obj = {cid: cid}
		var position = pos || this.state.selection.top;
		this.blurPointer()
		modelActionCreators.insertRecord(this.props.model, obj, position)
		this.setState({copyarea: null})
	},

	clearSelection: function () {
		var model = this.props.model
		var view = this.props.view
		var sel = this.state.selection

		for (var r = sel.top; r <= sel.bottom; r++) {
			var obj = this.store.getObject(r)
			var selector = {[model._pk]: obj[model._pk]}
			var patch = {}

			for (var c = sel.left; c <= sel.right; c++) {
				var column = view.data.visibleCols[c]
				var type = fieldTypes[column.type]
				if (!type.uneditable) {
					var validator = type.element.validator || _.identity
					var value = validator(null)
					patch[column.column_id] = value
				}
			}
			if (_.keys(patch).length > 0) modelActionCreators.patchRecords(model, patch, selector)
		}
	},

	deleteRecords: function () {
		var model = this.props.model
		var sel = _.clone(this.state.selection)
		var ptr = _.clone(this.state.pointer)
		var pk = model._pk
		var selectors = []
		var numRows = this.getNumberRows()

		this.blurPointer()

		for (var row = sel.top; row <= sel.bottom; row++) {
			var obj = this.getValueAt(row)
			var selector = {}
			if (!(pk in obj)) return // what about cid?
			else selector[pk] = obj[pk]
			selectors.push(selector)
		}
		selectors.forEach(function (selector) {
			modelActionCreators.deleteRecord(model, selector)
		})
		ptr.top = Math.min(ptr.top, numRows - 1)
		ptr.bottom = Math.min(ptr.bottom, numRows - 1)
		sel.top = Math.min(sel.top, numRows - 1)
		sel.bottom = Math.min(sel.bottom, numRows - 1)
		this.setState({copyarea: null, selection: sel, pointer: ptr})
	},

	copySelection: function () {
		var clipboard = ""
		var view = this.props.view
		var sel = this.state.selection
		for (var r = sel.top; r <= sel.bottom; r++) {
			var obj = this.store.getObject(r)
			for (var c = sel.left; c <= sel.right; c++) {
				var column = view.data.visibleCols[c]
				var type = fieldTypes[column.type]
				var value = obj[column.column_id]

				if (type.stringify) value = type.stringify(value)
				clipboard += (value === null ? "" : value) + (c == sel.right ? "" : "\t")
			}
			clipboard += (r == sel.bottom ? "" : "\n")
		}
		copyTextToClipboard(clipboard)
		this.setState({copyarea: sel})
	},

	pasteSelection: function (e) {
		var text = e.clipboardData.getData('text')
		var model = this.props.model
		var view = this.props.view

		var rows = text.split('\n')
		var data = rows.map(r => r.split('\t'))
		var sel = this.state.selection

		for (var r = sel.top; r <= sel.bottom; r++) {
			var cbr = (r - sel.top) % data.length
			var obj = this.store.getObject(r)
			var selector = {[model._pk]: obj[model._pk]}
			var patch = {}

			for (var c = sel.left; c <= sel.right; c++) {
				var cbc = (c - sel.left) % data[cbr].length
				var column = view.data.visibleCols[c]
				var type = fieldTypes[column.type]
				var validator = type.element.validator || _.identity
				var value = validator(data[cbr][cbc])
				if (!type.uneditable) {
					patch[column.column_id] = value
				}
			}
			if (_.keys(patch).length > 0) modelActionCreators.patchRecords(model, patch, selector)
		}
	},

	toggleExpand: function () {
		this.setState({expanded: !this.state.expanded})
	},

	showContext: function (e) {
		// console.log('context!')
		var position = this.getRCCoords(e)
		this.setState({
			context: true, 
			contextPosition: position
		})
	},

	handleMouseWheel: function (e) {
		this.refs.verticalScrollBar.handleMouseWheel(e)
		this.refs.horizontalScrollBar.handleMouseWheel(e)
	},

	move: function (direction, shift) {
		var sel = _.clone(this.state.selection)
		var ptr = _.clone(this.state.pointer)
		var numCols = this.props.view.data.visibleCols.length - 1
		var numRows = this.getNumberRows()
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
			if (singleCell) this.setState({selection: {left: ptr.left, right: ptr.left,
				top: ptr.top, bottom: ptr.top}})
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
			if (singleCell) this.setState({selection: {left: ptr.left, right: ptr.left,
				top: ptr.top, bottom: ptr.top}})
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

		// down ---------------------------
		else if (direction === 'DOWN' && shift) {
			if (sel.top < ptr.top) sel.top += 1
			else if (sel.bottom < numRows) sel.bottom += 1
			this.setState({selection: sel})
		} else if (direction === 'DOWN') {
			if (ptr.top < numRows) ptr.top = (ptr.top + 1)
			this.updateSelect(ptr, shift)
		}
		// up
		else if (direction === 'UP' && shift) {
			if (sel.bottom > ptr.top) sel.bottom -= 1
			else if (sel.top > 0) sel.top -= 1
			this.setState({selection: sel})
		} else if (direction === 'UP') {
			if (ptr.top > 0) ptr.top -= 1
			this.updateSelect(ptr, false)
		}
	},

	updatePointer: function (pos) {
		var oldPos = this.state.pointer
		var view = this.props.view
		var geo = view.data.geometry
		var numCols = this.getNumberCols()
		var numRows = this.getNumberRows()
		var rowOffset = this.state.rowOffset
		var visibleRows = this.state.visibleRows

		pos.left = Math.max(Math.min(pos.left, numCols), 0)
		pos.top = Math.max(Math.min(pos.top, numRows), 0)
		
		if (pos.left !== oldPos.left ||pos.top !== oldPos.top)
			this.blurPointer()
		// save the new values to state
		this.setState({
			pointer: pos,
			expanded: false
		})


		if (pos.top < rowOffset) 
			this.refs.verticalScrollBar.scroll(pos.top * geo.rowHeight)
		if (pos.top > (rowOffset + visibleRows - 1)) 
			this.refs.verticalScrollBar.scroll((pos.top - visibleRows) * geo.rowHeight)

		// focus the paste area just in case
		document.getElementById("copy-paste-dummy").focus()

		// commit the pointer position to the view object, but debounce
		view.data.pointer = pos
		this._debounceCreateView(view, false, false, true)
	},

	blurPointer: function () {
		var current = this.refs.cursors.refs.pointerCell
		if (current) {
			if (current.commitChanges) current.commitChanges()
		}
	},

	updateSelect: function (pos, shift) {
		var sel = this.state.selection
		var ptr = this.state.pointer
		var view = this.props.view
		var numCols = this.getNumberCols()
		var numRows = this.getNumberRows()

		if (shift) {
			sel = {
				left: Math.min(ptr.left, pos.left, numCols),
				right: Math.max(ptr.left, pos.left, pos.right || 0, 0),
				top: Math.min(ptr.top, pos.top, pos.bottom || numRows, numRows),
				bottom: Math.max(ptr.top, pos.top, 0)
			}
		} else {
			ptr = pos
			sel = {
				left: pos.left,
				right: pos.left,
				top: pos.top,
				bottom: pos.top
			}
		}
		this.updatePointer(ptr)
		this.setState({
			selection: sel
		})
	},

	onMouseDown: function (e) {
		var _this = this
		if (FocusStore.getFocus() !== 'view')
			modelActionCreators.setFocus('view')
		this.updateSelect(this.getRCCoords(e), e.shiftKey)
		addEventListener('selectstart', util.returnFalse)
		addEventListener('mousemove', this.onSelectMouseMove)
		addEventListener('mouseup', this.onMouseUp)
	},

	onSelectMouseMove: function (e) {
		this.updateSelect(this.getRCCoords(e), true)
	},

	onMouseUp: function (e) {
		removeEventListener('selectstart', util.returnFalse);
		removeEventListener('mousemove', this.onSelectMouseMove);
		removeEventListener('mouseup', this.onMouseUp);
		document.getElementById("copy-paste-dummy").focus();
	},

	setHorizontalScrollOffset: function (hOffset) {
		var view = this.props.view;
		var columns = view.data.columnList;
		var floatCols = view.data.floatCols;
		var hiddenColWidth = 0;
		var hiddenCols = 0;
		var rhsHorizontalOffsetter = this.refs.tableWrapper.refs.rhsHorizontalOffsetter;

		
		floatCols.some(function (col) {
			if (hOffset > col.width + hiddenColWidth) {
				hiddenColWidth += col.width
				hiddenCols ++
			}
			// break when we exceed hOffset
			return (col.width + hiddenColWidth > hOffset)
		});

		this.setState({
			hiddenCols: hiddenCols,
			hiddenColWidth: hiddenColWidth
		});
		
		// console.log('hOffset: ' + hOffset)
		// if (hiddenColWidth !== this.state.hiddenColWidth) 
		// 	ReactDOM.findDOMNode(rhsHorizontalOffsetter).style.marginLeft = 
		// 		(-1 * hiddenColWidth - 1) + 'px';
	},

	_lastUpdate: 0,

	setVerticalScrollOffset: function (vOffset) {
		var view = this.props.view;
		var geo = view.data.geometry;
		var rowOffset = vOffset / geo.rowHeight;
		var previousOffset = this.state.rowOffset;
		var delta = rowOffset - previousOffset;
		var direction = delta > 0 ? 1 : delta < 0 ? -1 : 0;
		var lhsOffsetter = this.refs.tableWrapper.refs.lhsOffsetter;
		var rhsOffsetter = this.refs.tableWrapper.refs.rhsOffsetter;
		var underlay = this.refs.cursors.refs.underlayInner;
		var overlay = this.refs.cursors.refs.overlayInner;

		if (rowOffset === this.state.rowOffset) return;

		ReactDOM.findDOMNode(lhsOffsetter).style.transform = "translate3d(0, " + (-1 * rowOffset * geo.rowHeight ) + "px, 0)"
		ReactDOM.findDOMNode(rhsOffsetter).style.transform = "translate3d(0, " + (-1 * rowOffset * geo.rowHeight ) + "px, 0)"
		ReactDOM.findDOMNode(underlay).style.transform = "translate3d(0, " + (-1 * rowOffset * geo.rowHeight ) + "px, 0)"
		ReactDOM.findDOMNode(overlay).style.transform = "translate3d(0, " + (-1 * rowOffset * geo.rowHeight ) + "px, 0)"
		this.setState({rowOffset: rowOffset, direction: direction})
		
		if (!this._timer) this._timer = getFrame(this.refreshTable, CYCLE)
	},

	refreshTable: function () {
		var now = Date.now()
		if (now - this._lastUpdate < MIN_CYCLE && this._timer) return;

		var side = this.state.renderSide
		var body = this.refs.tableWrapper.refs[side]
		var alt = this.refs.tableWrapper.refs[side === 'lhs' ? 'rhs' : 'lhs']
		var isUnpainted = body.isUnpainted()

		// console.log('refresh: ' + side)

		body.updateOffset(this.state.rowOffset, this.state.direction)
		this._lastUpdate = now

		
		if (isUnpainted) this._timer = getFrame(this.refreshTable, CYCLE)
		else this._timer = null

		this.setState({
			renderSide: (side === 'lhs' ? 'rhs' : 'lhs'),
			frame: (this.state.frame || 0) + 1,	
		})
	},

	render: function () {
		var _this = this
		var model = this.props.model
		var view = this.props.view

		var focused = (FocusStore.getFocus() == 'view')
		var totalWidth = this.getTotalWidth()

		// console.log('update index')

		var childProps = {
			_handleBlur: _this.handleBlur,
			_handleClick: _this.onMouseDown,
			_handlePaste: _this.pasteSelection,
			_addRecord: _this.addRecord,
			_handleContextMenu: _this.showContext,
			_handleWheel: this.handleMouseWheel,
			_handleEdit: _this.editCell,
			_updatePointer: this.updatePointer,
			_getRCCoords: this.getRCCoords,

			hiddenColWidth: this.state.hiddenColWidth,
			hiddenCols: this.state.hiddenCols,
			rowOffset: this.state.rowOffset,
			visibleRows: this.state.visibleRows,
			visibleHeight: this.state.visibleHeight,

			model: model,
			view: view,
			pointer: this.state.pointer,
			selection: this.state.selection,
			copyarea: this.state.copyarea,
			store: this.store,
			sorting: view.data.sorting,
			focused: focused,
			expanded: this.state.expanded,
			context: this.state.context,
			contextPosition: this.state.contextPosition
		}

		return <div className = "model-panes">
			<div ref="wrapper"
				className = "view-body-wrapper"
				
				beforePaste = {this.beforePaste}>

				<TabularBodyWrapper {...childProps}
					ref = "tableWrapper"/>
				
				<Cursors {...childProps}
					ref = "cursors"/>

				<ScrollBar
					store = {_this.store}
					ref = "verticalScrollBar"
					axis = "vertical"
					_setScrollOffset = {_this.setVerticalScrollOffset}
					view = {view}/>
				
				<ScrollBar
					store = {_this.store}
					ref = "horizontalScrollBar"
					axis = "horizontal"
					_setScrollOffset = {_this.setHorizontalScrollOffset}
					view = {view}/>
			</div>
		</div>
			
	}
})

export default TabularPane
