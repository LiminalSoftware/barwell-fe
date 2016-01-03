import React from "react"
import ReactDOM from "react-dom"
import { RouteHandler } from "react-router"
import styles from "./style.less"

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
import Overlay from './Overlay'
import ContextMenu from './ContextMenu'
import DetailBar from '../../../DetailBar'
import ScrollOverlay from "./ScrollOverlay"

import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import PureRenderMixin from 'react-addons-pure-render-mixin';

var THROTTLE_DELAY = 30

var debouncedCreateView = _.debounce(function (view) {
	modelActionCreators.createView(view, false, false, true)
}, 500)

var TabularPane = React.createClass ({

	mixins: [TableMixin],

	getInitialState: function () {
		return {
      hiddenCols: 0,
      hiddenColWidth: 0,
			sorting: null,
			contextOpen: false,
			detailOpen: false,
			contextX: null,
			contextY: null,
			rowOffset: 0,
			colOffset: 0
		}
	},

	componentWillMount: function () {
		document.body.addEventListener('keydown', this.onKey)
		FocusStore.addChangeListener(this._onChange)
		this.store = createTabularStore(this.props.view)
	},

	componentWillUnmount: function () {
		document.body.removeEventListener('keydown', this.onKey)
		FocusStore.removeChangeListener(this._onChange)
		this.store.unregister()
	},

	componentDidMount: function () {
		var now = new Date().getTime()
		this._lastUpdate = now
	},

	shouldComponentUpdate: function (nextProps, nextState) {
		var props = this.props
		var state = this.state
		var now = new Date().getTime()
		var timeSinceUpdt = (now - this._lastUpdate)

		if (timeSinceUpdt >= THROTTLE_DELAY || !_.isEqual(props, nextProps)) {
			if (this._updtTimer) window.clearTimeout(this._updtTimer)
			return true
		} else this._updtTimer = window.setTimeout(
			this.forceUpdate,
			THROTTLE_DELAY - timeSinceUpdt,
			{}
		)
		return false
	},

	_onChange: function () {
		console.log('main index onChange')
		var focused = (FocusStore.getFocus() == 'view')
		if (!focused) this.blurPointer()
		this.forceUpdate()
	},

	getVisibleColumns: function () {
		var view = this.props.view
		return view.data.visibleCols
	},

	getTotalWidth: function () {
    var view = this.props.view
		return util.sum(view.data.visibleCols, 'width')
	},

	getColumns: function () {
    var view = this.props.view
		return view.data.visibleCols
	},

	getNumberCols: function () {
		return this.getColumns().length - 1
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

	getRCCoords: function (event) {
		var lhs = ReactDOM.findDOMNode(this.refs.tableWrapper.refs.lhs)
		var view = this.props.view
		var geo = view.data.geometry
		var visibleCols = view.data.visibleCols
		var scrolledCols = this.state.hiddenCols
		var numFixed = view.data.fixedCols.length
		var offset = $(lhs).offset()
		var y = event.pageY - offset.top
		var x = event.pageX - offset.left
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
		r = Math.min(r, this.store.getRecordCount())

		return {top: r, left: c}
	},

	getFieldAt: function (pos) {
		var view = this.props.view
		var fixedCols = view.data.fixedCols
		var side = (pos.left >= fixedCols.length) ? 'rhs' : 'lhs'
		var tbody = this.refs.tableWrapper.refs[side]
		var colId = view.data.visibleCols[pos.left].column_id
		var obj = this.getValueAt(pos.top)
		var model = this.props.model
		var objId = (obj.cid || obj[model._pk]);
		var rowKey = side + '-tr-' + objId
		var cellKey = rowKey + '-' + colId
		return tbody.refs[rowKey].refs[cellKey]
	},

	editCell: function (e) {
		var pos = this.state.pointer
		var fixedCols = this.props.view.data.fixedCols
		var side = (pos.left >= fixedCols.length) ? 'rhs' : 'lhs'
		this.setState({
			editing: true,
			copyarea: null
		})
		// this.nextState.selected.handleEdit(e);
		this.getFieldAt(pos).handleEdit(e);
	},

	addRecord: function () {
		var cid = this.store.getClientId()
		var obj = {cid: cid}
		console.log('obj: ' + JSON.stringify(obj))
		this.blurPointer()
		modelActionCreators.insertRecord(this.props.model, obj, this.store.getRecordCount())
		this.setState({copyarea: null})
		this.forceUpdate()
	},

	insertRecord: function (pos) {
		var cid = this.store.getClientId()
		var obj = {cid: cid}
		var position = pos || this.state.selection.top;
		var model = this.props.model

		this.blurPointer()
		modelActionCreators.insertRecord(this.props.model, obj, position)
		this.setState({copyarea: null})
		this.forceUpdate()
	},

	clearSelection: function () {
		var sel = this.state.selection
		for (var r = sel.top; r <= sel.bottom; r++) {
			for (var c = sel.left; c <= sel.right; c++) {
				this.getFieldAt({top: r, left: c}).commitValue(null);
			}
		}
	},

	deleteRecords: function () {
		var model = this.props.model
		var sel = this.state.selection
		var pk = model._pk
		var selectors = []

		this.blurPointer()

		for (var row = sel.top; row <= sel.bottom; row++) {
			var obj = this.getValueAt(row)
			var selector = {}
			if (!(pk in obj)) return
			else selector[pk] = obj[pk]
			selectors.push(selector)
		}
		selectors.forEach(function (selector) {
				modelActionCreators.deleteRecord(model, selector)
		})
		this.setState({copyarea: null})
	},

	copySelection: function () {
		var clipboard = ""
		var sel = this.state.selection
		for (var r = sel.top; r <= sel.bottom; r++) {
			for (var c = sel.left; c <= sel.right; c++) {
				var value = this.getFieldAt({top: r, left: c}).props.value
				clipboard += (value === null ? "" : value) + (c == sel.right ? "" : "\t")
			}
			clipboard += (r == sel.bottom ? "" : "\n")
		}
		copyTextToClipboard(clipboard)
		this.setState({copyarea: sel})
	},

	pasteSelection: function (e) {
		var text = e.clipboardData.getData('text')
		var data = text.split('\n').map(r => r.split('\t'))
		var cbr = 0
		var cbc = 0
		var sel = this.state.selection
		for (var r = sel.top; r <= sel.bottom; r++) {
			cbr = (r - sel.top) % data.length
			for (var c = sel.left; c <= sel.right; c++) {
				cbc = (c - sel.left) % data[cbr].length
				var value = data[cbr][cbc]
				this.getFieldAt({top: r, left: c}).commitValue(value);
			}
		}
		e.preventDefault();
		e.stopPropagation();
	},

	showDetailBar: function () {
		this.setState({detailOpen: true})
	},

	handleDetail: function () {
		this.showDetailBar()
	},

	hideDetailBar: function () {
		this.setState({detailOpen: false})
	},

	openContextMenu: function (e) {
		e.preventDefault();
		var rc = this.getRCCoords(e)
		var sel = this.state.selection

		modelActionCreators.setFocus('view')
		if (rc.row > sel.bottom || rc.row < sel.top ||
			rc.col > sel.right || rc.col < sel.left)
			this.updateSelect(rc.row, rc.col, false, false)

		this.setState({
			contextOpen: true,
			contextX: rc.x,
			contextY: rc.y + 20
		})
	},

	move: function (direction, shift) {
		var sel = _.clone(this.state.selection)
		var ptr = _.clone(this.state.pointer)
		var numCols = this.props.view.data.visibleCols.length - 1
		var numRows = this.getNumberRows()
		var singleCell = (sel.left === sel.right && sel.top === sel.bottom)
		var outline = singleCell ? {left: 0, right: numCols, top: 0, bottom: numRows - 1} : sel ;

		if (direction === 'TAB') {
			var mod = (outline.right - outline.left + 1)
			var bigMod = mod * (outline.bottom - outline.top + 1)
			var index = (ptr.top - outline.top) * mod + ptr.left - outline.left
			index += (shift ? -1 : 1)
			if (index < 0) index += bigMod
			index = index % bigMod
			ptr.left = (index % mod) + outline.left
			ptr.top = Math.floor(index / mod) + outline.top
			if (singleCell) this.setState({selection: {left: ptr.left, right: ptr.left,
				top: ptr.top, bottom: ptr.top}})
			this.updatePointer(ptr)
		}

		else if (direction === 'ENTER') {
			var mod = (outline.bottom - outline.top + 1)
			var bigMod = mod * (outline.right - outline.left + 1)
			var index = (ptr.left - outline.left) * mod + ptr.top - outline.top
			index += (shift ? -1 : 1)
			if (index < 0) index += bigMod
			index = index % bigMod
			ptr.left = Math.floor(index / mod) + outline.left
			ptr.top = (index % mod) + outline.top
			if (singleCell) this.setState({selection: {left: ptr.left, right: ptr.left,
				top: ptr.top, bottom: ptr.top}})
			this.updatePointer(ptr)
		}
		// Right
		else if (direction === 'RIGHT' && shift) {
			if (sel.left === ptr.left && sel.right < numCols) sel.right += 1
			else if (sel.left < ptr.left) sel.left += 1
			this.setState({selection: sel})
		} else if (direction === 'RIGHT') {
			if (ptr.left < numCols) ptr.left = (ptr.left + 1)
			this.updateSelect(ptr, shift)
		}
		// Left
		else if (direction === 'LEFT' && shift) {
			if (sel.right > ptr.left) sel.right -= 1
			else if (sel.left > 0) sel.left -= 1
			this.setState({selection: sel})
		} else if (direction === 'LEFT') {
			ptr.left -= 1
			this.updateSelect(ptr, false)
		}

		// down
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
		console.log('updatePointer: ' + JSON.stringify(pos))
		var oldPos = this.state.pointer
		var view = this.props.view
		var current = this.state.selected
		var cell
		var numCols = this.getNumberCols()
		var numRows = this.getNumberRows()

		pos.left = Math.max(Math.min(pos.left, numCols), 0)
		pos.top = Math.max(Math.min(pos.top, numRows), 0)
		// if pointer has moved, then unselect the old position and select the new
		if (pos.left !== oldPos.left || pos.top !== oldPos.top) {
			if (current && current.isMounted()) this.blurPointer()

			cell = this.getFieldAt(pos)
			cell.toggleSelect(true)
		}
		// save the new values to state
		this.setState({
			pointer: pos,
			detailOpen: false,
			contextOpen: false,
			selected: (cell || this.state.selected)
		})

		// commit the pointer position to the view object, but not immediately
		view.data.pointer = pos
		debouncedCreateView(view, false, false, true)
	},

	blurPointer: function () {
		var current = this.state.selected
		if (current) {
			if (current.commitChanges) current.commitChanges()
			current.toggleSelect(false)
		}
		// this.setState({copyarea: null})
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
		if (FocusStore.getFocus() !== 'view')
			modelActionCreators.setFocus('view')

		this.updateSelect(this.getRCCoords(e), e.shiftKey)
		document.addEventListener('selectstart', util.returnFalse)
		document.addEventListener('mousemove', this.onSelectMouseMove)
		document.addEventListener('mouseup', this.onMouseUp)
		e.preventDefault()
		e.stopPropagation()
		e.nativeEvent.stopPropagation()
	},

	setScrollOffset: function (vOffset, hOffset) {
		var view = this.props.view
		var geo = this.props.view.data.geometry
		var rows = Math.floor(vOffset / geo.rowHeight)
		var columns = view.data.columnList
		var floatCols = view.data.floatCols
		var hiddenColWidth = 0
		var hiddenCols = 0

		floatCols.some(function (col) {
			if (col.width + hiddenColWidth <= hOffset){
				hiddenColWidth += col.width
				hiddenCols ++
			} else return true
		})

		this.setState({
			rowOffset: rows,
			hiddenCols: hiddenCols,
			hiddenColWidth: hiddenColWidth
		})
	},

	render: function () {
		var _this = this
		var model = this.props.model
		var view = this.props.view
		var geo = this.props.view.data.geometry
		var columns = view.data.visibleCols

		var focused = (FocusStore.getFocus() == 'view')
		var totalWidth = this.getTotalWidth()
		var ptr = this.state.pointer
		var sel = this.state.selection
		var cpy = this.state.copyarea
		var object = this.store.getObject(ptr.top)
		var detailColumn = columns[ptr.left]
		var showJaggedEdge = (sel.right >= view.data.fixedCols.length
			&& sel.left <= view.data.fixedCols.length && this.state.hiddenCols > 0)

		// <div className = "loader-box">
		// 	<span className = "three-quarters-loader"></span>
		// 	Loading data from server...
		// </div>

		return <div className = "model-panes">
			<div ref="wrapper"
				className = "view-body-wrapper"
				onPaste = {this.pasteSelection}
				beforePaste = {this.beforePaste}>

			<ScrollOverlay
				store = {_this.store}
				_handleClick = {_this.onMouseDown}
				_handleDoubleClick = {this.editCell}
				_editCell = {_this.editCell}
				_setScrollOffset = {_this.setScrollOffset}
				onScroll = {this.onScroll}
				view = {view}/>

			<TabularBodyWrapper
				ref = "tableWrapper"
				_handleBlur = {_this.handleBlur}
				_handleDetail = {_this.handleDetail}
				_handlePaste = {_this.pasteSelection}
				_addRecord = {_this.addRecord}
				_handleContextMenu = {_this.openContextMenu}
				_editCell = {_this.editCell}

				totalWidth = {totalWidth}
				rowOffset = {this.state.rowOffset}
				hiddenColWidth = {this.state.hiddenColWidth}
				hiddenCols = {this.state.hiddenCols}

				model = {model}
				view = {view}
				pointer = {ptr}
				store = {_this.store}
				fixedColumns = {view.data.fixedCols}
				visibleColumns = {view.data.floatCols}
				sorting = {view.data.sorting}
				focused = {focused}>

			<Overlay
				columns = {columns}
        numHiddenCols = {_this.state.hiddenCols}
				className = {" pointer" + (focused ? " focused" : "")}
				rowOffset = {this.state.rowOffset}
				ref = "pointer"
				{...this.props}
				position = {sel}
				fudge = {{left: -5.25 + geo.leftOffset, top: -0.25, height: -1.5, width: -0.5}} />

			<Overlay
				columns = {columns}
        numHiddenCols = {_this.state.hiddenCols}
				className = {" selection " + (_this.isFocused() ? " focused" : "")}
				rowOffset = {this.state.rowOffset}
				ref = "selection"
				{...this.props}
				position = {sel}
				fudge = {{left: -6.25  + geo.leftOffset, top: -2.25, width: -4.25, height: -4.25}} />

			<Overlay
				columns = {columns}
        numHiddenCols = {_this.state.hiddenCols}
				className = {showJaggedEdge ? " jagged-edge " : ""}
				rowOffset = {this.state.rowOffset}
				ref = "jaggedEdge"
				{...this.props}
				position = {{
					left: view.data.fixedCols.length,
					top: sel.top,
					bottom: sel.bottom
				}}
				fudge = {{left: -7  + geo.leftOffset, top: 0, width: -4.25, height: 0}} />

			<Overlay
				columns = {columns}
        numHiddenCols = {_this.state.hiddenCols}
				rowOffset = {this.state.rowOffset}
				className = {" copyarea running marching-ants " + (_this.isFocused() ? " focused" : "")}
				ref="copyarea"
				{...this.props}
				position = {cpy}
				fudge = {{left: -4  + geo.leftOffset, top: 0.25, height: 0.75, width: 1.25}}/>

		</TabularBodyWrapper>



		{_this.state.contextOpen ?
			<ContextMenu
				x = {this.state.contextX} y = {this.state.contextY}
				handleContextBlur = {this.handleContextBlur}
				insertRecord = {this.insertRecord}
				deleteRecords = {this.deleteRecords}
				copySelection = {this.copySelection} />
			: null}

		</div>

		{_this.state.detailOpen ?
			<DetailBar
				model = {model}
				view = {view}
				config = {detailColumn}
				object = {object}/>
			: null}
		</div>
	}
})

export default TabularPane
