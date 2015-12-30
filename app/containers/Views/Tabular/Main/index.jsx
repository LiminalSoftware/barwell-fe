import React from "react"
import { RouteHandler } from "react-router"
import styles from "./style.less"
import EventListener from 'react/lib/EventListener'
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
import TabularTBody from "./TabularTBody"
import TabularBodyWrapper from "./TabularBodyWrapper"
import TabularTHead from "./TabularTHead"
import TableMixin from '../../TableMixin'
import Overlay from './Overlay'
import ContextMenu from './ContextMenu'
import DetailBar from '../../../DetailBar'
import ScrollOverlay from "./ScrollOverlay"
import FakeLines from './FakeLines'

var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;


var _lastCall = 0

var THROTTLE_DELAY = 40

var debouncedCreateView = _.debounce(function (view) {
	modelActionCreators.createView(view, false, false, true)
}, 500)

var TabularPane = React.createClass ({

	mixins: [TableMixin],

	nextState: {},

	getInitialState: function () {
		return {
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

	componentWillUpdate: function (newProps, newState) {
		Object.assign(this.nextState, newState)
	},

	componentDidMount: function () {
		this.nextState = _.clone(this.state)
	},

	_onChange: function () {
		console.log('main index onChange')
		var focused = (FocusStore.getFocus() == 'view')
		if (!focused) this.blurPointer()
		this.forceUpdate()
	},

	getVisibleColumns: function () {
		var view = this.props.view
		return _.filter(view.data.columnList, 'visible');
	},

	getTotalWidth: function () {
		return _.pluck(this.getVisibleColumns(), 'width').reduce((a,b) => a + b, 0)
	},

	getColumns: function () {
		return this.getVisibleColumns()
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
		var sel = this.nextState.selection
		sel.left = 0;
		sel.right = numCols;
		this.throttleSetState({selection: sel})
	},

	getRCCoords: function (event) {
		var tbody = React.findDOMNode(this.refs.tableWrapper.refs.tbody)
		var view = this.props.view
		var geo = view.data.geometry
		var columns = this.getColumns()
		var offset = $(tbody).offset()
		var y = event.pageY - offset.top
		var x = event.pageX - offset.left
		var xx = x
		var r = Math.floor((y) / geo.rowHeight, 1)
		var c = 0

		columns.forEach(function (col) {
			xx -= (col.width)
			if (xx > 0) c ++
		})
		c = Math.min(columns.length - 1, c)
		c = Math.max(0, c)
		r = Math.max(0, r)
		r = Math.min(r, this.store.getRecordCount())

		return {top: r, left: c}
	},

	getFieldAt: function (pos) {
		var tbody = this.refs.tableWrapper.refs.tbody
		var colId = this.getVisibleColumns()[pos.left].column_id
		var obj = this.getValueAt(pos.top)
		var model = this.props.model
		var objId = (obj.cid || obj[model._pk]);
		var rowKey = 'tr-' + objId
		var cellKey = rowKey + '-' + colId
		return tbody.refs[rowKey].refs[cellKey]
	},

	editCell: function (event) {
		var tbody = this.refs.tableWrapper.refs.tbody
		this.throttleSetState({
			editing: true,
			copyarea: null
		})
		tbody.setState({
			editing: true
		})
		this.getFieldAt(this.nextState.pointer).handleEdit(event);
	},

	addRecord: function () {
		var cid = this.store.getClientId()
		var obj = {cid: cid}
		console.log('obj: ' + JSON.stringify(obj))
		this.blurPointer()
		modelActionCreators.insertRecord(this.props.model, obj, this.store.getRecordCount())
		this.throttleSetState({copyarea: null})
		this.forceUpdate()
	},

	insertRecord: function (pos) {
		var cid = this.store.getClientId()
		var obj = {cid: cid}
		var position = pos || this.nextState.selection.top;
		var model = this.props.model

		this.blurPointer()
		modelActionCreators.insertRecord(this.props.model, obj, position)
		this.throttleSetState({copyarea: null})
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
		this.throttleSetState({copyarea: null})
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
		this.throttleSetState({copyarea: sel})
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
		this.throttleSetState({detailOpen: true})
	},

	handleDetail: function () {
		this.showDetailBar()
	},

	hideDetailBar: function () {
		this.throttleSetState({detailOpen: false})
	},

	openContextMenu: function (e) {
		e.preventDefault();
		var rc = this.getRCCoords(e)
		var sel = this.state.selection

		modelActionCreators.setFocus('view')
		if (rc.row > sel.bottom || rc.row < sel.top ||
			rc.col > sel.right || rc.col < sel.left)
			this.updateSelect(rc.row, rc.col, false, false)

		this.throttleSetState({
			contextOpen: true,
			contextX: rc.x,
			contextY: rc.y + 20
		})
	},

	move: function (direction, shift) {
		var sel = _.clone(this.nextState.selection)
		var ptr = _.clone(this.nextState.pointer)
		var numCols = this.getNumberCols()
		var numRows = this.getNumberRows()
		var singleCell = (sel.left === sel.right && sel.top === sel.bottom)
		var outline = singleCell ? {left: 0, right: numCols, top: 0, bottom: numRows} : sel ;

		if (direction === 'TAB') {
			var mod = (outline.right - outline.left + 1)
			var bigMod = mod * (outline.bottom - outline.top + 1)
			var index = (ptr.top - outline.top) * mod + ptr.left - outline.left
			index += (shift ? -1 : 1)
			if (index < 0) index += bigMod
			index = index % bigMod
			ptr.left = (index % mod) + outline.left
			ptr.top = Math.floor(index / mod) + outline.top
			if (singleCell) this.throttleSetState({selection: _.clone(ptr)})
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
			if (singleCell) this.throttleSetState({selection: _.clone(ptr)})
			this.updatePointer(ptr)
		}
		// Right
		else if (direction === 'RIGHT' && shift) {
			if (sel.left >= ptr.left) sel.right += 1
			else sel.left += 1
			this.throttleSetState({selection: sel})
		} else if (direction === 'RIGHT') {
			ptr.left = ptr.right = (ptr.left + 1)
			this.updateSelect(ptr, shift)
		}
		// Left
		else if (direction === 'LEFT' && shift) {
			if (sel.right > ptr.left) sel.right -= 1
			else sel.left -= 1
			this.throttleSetState({selection: sel})
		} else if (direction === 'LEFT') {
			ptr.left -= 1
			this.updateSelect(ptr, false)
		}

		// down
		else if (direction === 'DOWN' && shift) {
			if (sel.top < ptr.top) sel.top += 1
			else sel.bottom += 1
			this.throttleSetState({selection: sel})
		} else if (direction === 'DOWN') {
			ptr.top = ptr.bottom = (ptr.top + 1)
			this.updateSelect(ptr, shift)
		}
		// up
		else if (direction === 'UP' && shift) {
			if (sel.bottom > ptr.top) sel. bottom -= 1
			else sel.top -= 1
			this.throttleSetState({selection: sel})
		} else if (direction === 'UP') {
			ptr.top -= 1
			this.updateSelect(ptr, false)
		}
	},

	updatePointer: function (pos) {
		var oldPos = this.nextState.pointer
		var view = this.props.view
		var current = this.nextState.selected
		var cell
		var numCols = this.getNumberCols()
		var numRows = this.getNumberRows()

		pos.left = Math.max(Math.min(pos.left, numCols), 0)
		pos.top = Math.max(Math.min(pos.top, numRows), 0)
		// if pointer has moved, then unselect the old position and select the new
		if (pos.left !== oldPos.left || pos.top !== oldPos.top) {
			if (current && current.isMounted()) current.toggleSelect(false)
			cell = this.getFieldAt(pos)
			cell.toggleSelect(true)
		}
		// save the new values to state
		this.throttleSetState({
			pointer: pos,
			detailOpen: false,
			contextOpen: false,
			selected: (cell || this.nextState.selected)
		})

		// commit the pointer position to the view object, but not immediately
		// view.data.pointer = pos
		// debouncedCreateView(view, false, false, true)
	},

	blurPointer: function () {
		var current = this.nextState.selected
		if (current) current.toggleSelect(false)
		this.throttleSetState({copyarea: null})
	},

	updateSelect: function (pos, shift) {
		var sel = this.nextState.selection
		var ptr = this.nextState.pointer
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
		this.throttleSetState({
			selection: sel
		})
	},

	onMouseDown: function (e) {
		console.log('mouseDown')
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
		var visibleColumns = columns.filter(c => !c.fixed && c.visible )
		var hiddenColWidth = 0
		var hiddenCols = 0

		visibleColumns.forEach(function (col) {
			if (col.width + hiddenColWidth < hOffset){
				hiddenColWidth += col.width
				hiddenCols + 1
			}
		})

		this.throttleSetState({
			rowOffset: rows,
			hiddenCols: hiddenCols,
			hiddenColWidth: hiddenColWidth
		})
	},

	throttleSetState: function (state) {
		var now = new Date().getTime()
		var timeSinceUpdt = (now - _lastCall)
		if (state) Object.assign(this.nextState, state)
		if (timeSinceUpdt >= THROTTLE_DELAY) {
			// if enough time has passed, set the state
			this.setState(this.nextState)
			_lastCall = now
		} else {
			// otherwise come back when time's up
			window.setTimeout(
				this.throttleSetState,
				THROTTLE_DELAY - timeSinceUpdt,
				{}
			)
		}
	},

	render: function () {
		// console.log('tabular main index')
		var _this = this
		var model = this.props.model
		var view = this.props.view
		var geo = this.props.view.data.geometry
		var columns = this.getVisibleColumns()

		var focused = (FocusStore.getFocus() == 'view')
		var totalWidth = this.getTotalWidth()
		var ptr = this.state.pointer
		var sel = this.state.selection
		var cpy = this.state.copyarea
		var object = this.store.getObject(ptr.top)
		var detailColumn = columns[ptr.left]

		var fixedColumns = columns.filter(c => c.fixed && c.visible)
		var visibleColumns = columns.filter(c => !c.fixed && c.visible )
		var floatOffset = fixedColumns.map(c => c.width).reduce( (a,b) => (a + b), 0);

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
				totalWidth = {totalWidth}
				_handleClick = {_this.onMouseDown}
				_setScrollOffset = {_this.setScrollOffset}
				onScroll = {this.onScroll}
				view = {view}/>

			<TabularTHead
				key = {"lhsThead-" + view.view_id}
				scrollTop = {this.state.scrollTop}
				totalWidth = {totalWidth}
				columns = {columns}
				focused = {focused}
				view = {view} />

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
				fixedColumns = {fixedColumns}
				visibleColumns = {visibleColumns}
				floatOffset = {floatOffset}
				sorting = {view.data.sorting}
				focused = {focused}>

			<Overlay
				columns = {columns}
				className = {" pointer" + (focused ? " focused" : "")}
				ref = "pointer"
				{...this.props}
				onDoubleClick={this.startEdit}
				position = {sel}
				fudge = {{left: -5.25 + geo.leftOffset, top: -1.25, height: -0.5, width: -0.5}} />

			<Overlay
				columns = {columns}
				className = {" selection " + (_this.isFocused() ? " focused" : "")}
				ref = "selection"
				{...this.props}
				onDoubleClick = {this.startEdit}
				position = {sel}
				fudge = {{left: -6.25  + geo.leftOffset, top: -2.25, width: -4.25, height: -4.25}} />

			<Overlay
				columns = {columns}
				className = {" copyarea running marching-ants " + (_this.isFocused() ? " focused" : "")}
				ref="copyarea"
				{...this.props}
				position = {cpy}
				fudge = {{left: -4  + geo.leftOffset, top: 0.25, height: 0.75, width: 1.25}}/>

		</TabularBodyWrapper>

		<FakeLines
			totalWidth = {totalWidth}
			rowCount = {this.getNumberRows()}
			{...this.props}/>

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
