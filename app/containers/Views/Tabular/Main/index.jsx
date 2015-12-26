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

var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;


var debouncedCreateView = _.debounce(function (view) {
	modelActionCreators.createView(view, false, false, true)
}, 500)

var TabularPane = React.createClass ({

	mixins: [TableMixin],

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
		FocusStore.addChangeListener(this._onChange)
		this.store = createTabularStore(this.props.view)
		this.store.addChangeListener(this._onChange)
	},

	componentWillUnmount: function () {
		FocusStore.removeChangeListener(this._onChange)
		this.store.removeChangeListener(this._onChange)
		this.store.unregister()
	},

	componentWillReceiveProps: function (newProps) {
		var oldProps = this.props;
		var oldState = this.state;
		if (!_.isEqual(oldProps.sorting, newProps.sorting)) {
			this.fetch(true)
		}
	},

	_onChange: function () {
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

	onScroll: function (event) {
		var wrapper = React.findDOMNode(this.refs.wrapper)
		this.setState({scrollTop: wrapper.scrollTop})
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
		var sel = this.state.selection
		sel.left = 0;
		sel.right = numCols;
		this.setState({selection: sel})
	},

	getRCCoords: function (event) {
		var tbody = React.findDOMNode(this.refs.tbodyWrapper.refs.tbody)
		var view = this.props.view
		var geo = view.data.geometry
		var actHeight = this.state.actRowHt
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
		var tbody = this.refs.tbodyWrapper.refs.tbody
		var colId = this.getVisibleColumns()[pos.left].column_id
		var obj = this.getValueAt(pos.top)
		var model = this.props.model
		var objId = (obj.cid || obj[model._pk]);
		var rowKey = 'tr-' + objId
		var cellKey = rowKey + '-' + colId
		return tbody.refs[rowKey].refs[cellKey]
	},

	editCell: function (event) {
		var tbody = this.refs.tbodyWrapper.refs.tbody
		this.setState({
			editing: true,
			copyarea: null
		})
		tbody.setState({
			editing: true
		})
		this.getFieldAt(this.state.pointer).handleEdit(event);
	},

	toggleCell: function (pos, toggle) {
		var cell = this.getFieldAt(pos);
		cell.toggleSelect(toggle)
		return cell
	},

	addRecord: function () {
		var cid = this.store.getClientId()
		console.log('cid: '  + cid)
		var obj = {cid: cid}
		this.blurPointer()
		modelActionCreators.insertRecord(this.props.model, obj, this.store.getRecordCount())
		this.setState({copyarea: null})
		this.forceUpdate()
	},

	insertRecord: function (pos) {
		var cid = this.store.getClientId()
		console.log('cid: '  + cid)
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
		var sel = this.state.selection
		var numCols = this.getNumberCols()
		var numRows = this.getNumberRows()
		var singleCell = (sel.left === sel.right && sel.top === sel.bottom)
		var outline = singleCell ? {left: 0, right: numCols, top: 0, bottom: numRows} : sel ;
		var ptr = _.clone(this.state.pointer)

		if (direction === 'TAB') {
			var mod = (outline.right - outline.left + 1)
			var bigMod = mod * (outline.bottom - outline.top + 1)
			var index = (ptr.top - outline.top) * mod + ptr.left - outline.left
			index += (shift ? -1 : 1)
			if (index < 0) index += bigMod
			index = index % bigMod
			ptr.left = (index % mod) + outline.left
			ptr.top = Math.floor(index / mod) + outline.top
			if (singleCell) this.updateSelect(ptr)
			else this.updatePointer(ptr)
		} else if (direction === 'ENTER') {
			var mod = (outline.bottom - outline.top + 1)
			var bigMod = mod * (outline.right - outline.left + 1)
			var index = (ptr.left - outline.left) * mod + ptr.top - outline.top
			index += (shift ? -1 : 1)
			if (index < 0) index += bigMod
			index = index % bigMod
			ptr.left = Math.floor(index / mod) + outline.left
			ptr.top = (index % mod) + outline.top
			if (singleCell) this.updateSelect(ptr)
			else this.updatePointer(ptr)
		} else if (direction === 'RIGHT') {
			ptr.left = Math.min(ptr.left + 1, numCols)
			this.updateSelect(ptr, shift)
		} else if (direction === 'LEFT') {
			ptr.left = Math.max(ptr.left - 1, 0)
			this.updateSelect(ptr, shift)
		} else if (direction === 'DOWN') {
			ptr.top = Math.min(ptr.top + 1, numRows - 1)
			this.updateSelect(ptr, shift)
		} else if (direction === 'UP') {
			ptr.top = Math.max(ptr.top - 1, 0)
			this.updateSelect(ptr, shift)
		}
	},

	updatePointer: function (pos) {
		var view = this.props.view
		var current = this.state.selected
		var cell
		// if pointer has moved, then unselect the old position and select the new
		if (!_.isEqual(pos, this.state.pointer)) {
			if(current) current.toggleSelect(false)
			cell = this.getFieldAt(pos)
			cell.toggleSelect(true)
		}
		// save the new values to state
		this.setState({
			pointer: pos,
			detailOpen: false,
			selected: (cell || this.state.selected)
		})
		// commit the pointer position to the view object, but not immediately
		view.data.pointer = pos
		debouncedCreateView(view, false, false, true)
	},

	blurPointer: function () {
		var current = this.state.selected
		if (current) current.toggleSelect(false)
		this.setState({copyarea: null})
	},

	updateSelect: function (pos, shift) {
		var sel = this.state.selection
		var anc = this.state.anchor
		var ptr = this.state.pointer
		var view = this.props.view

		if (shift) {
			if (!anc) anc = pos
			ptr = pos
			sel = {
				left: Math.min(anc.left, pos.left),
				right: Math.max(anc.left, pos.left),
				top: Math.min(anc.top, pos.top),
				bottom: Math.max(anc.top, pos.top)
			}
		} else {
			ptr = anc = pos
			sel = {
				left: pos.left,
				right: pos.left,
				top: pos.top,
				bottom: pos.top
			}
		}
		this.updatePointer(ptr)
		this.setState({
			selection: sel,
			anchor: anc
		})
	},

	onMouseDown: function (e) {
		modelActionCreators.setFocus('view')
		this.setState({mousedown: true})
		this.updateSelect(this.getRCCoords(e), e.shiftKey)
		document.addEventListener('selectstart', util.returnFalse)
		document.addEventListener('mousemove', this.onSelectMouseMove)
		document.addEventListener('mouseup', this.onMouseUp)
		e.preventDefault()
	},

	setScrollOffset: function (vOffset, hOffset) {
		var view = this.props.view
		var geo = this.props.view.data.geometry
		var rows = Math.floor(vOffset / geo.rowHeight)
		this.setState({rowOffset: rows, hiddenCols: 0})
	},

	render: function () {
		var _this = this
		var model = this.props.model
		var view = this.props.view
		var geo = this.props.view.data.geometry
		var columns = this.getVisibleColumns()
		
		var fixedColumns = columns.filter(c => c.fixed && c.visible)
		var visibleColumns = columns.filter(c => !c.fixed && c.visible )

		var focused = (FocusStore.getFocus() == 'view')
		var totalWidth = this.getTotalWidth()
		var ptr = this.state.pointer
		var sel = this.state.selection
		var cpy = this.state.copyarea
		var object = this.store.getObject(ptr.top)
		var detailColumn = columns[ptr.left]

		// <div className = "loader-box">
		// 	<span className = "three-quarters-loader"></span>
		// 	Loading data from server...
		// </div>



		return <div className = "model-panes">
		<div
			
			ref="wrapper"
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
						key = {"tabular-thead-" + view.view_id}
						scrollTop = {this.state.scrollTop}
						totalWidth = {totalWidth}
						columns = {columns}
						focused = {focused}
						view = {view} />

					// fixed columns
					<TabularBodyWrapper
						ref = "tbodyWrapper"
						_handleBlur = {_this.handleBlur}
						_handleDetail = {_this.handleDetail}
						_handlePaste = {_this.pasteSelection}
						_addRecord = {_this.addRecord}
						editCell = {_this.editCell}
						openContextMenu = {_this.openContextMenu}

						totalWidth = {totalWidth}
						rowOffset = {this.state.rowOffset}
						
						model = {model}
						view = {view}
						pointer = {ptr}
						store = {_this.store}
						columns = {columns}
						sorting = {view.data.sorting}
						focused = {focused}>

						<Overlay
							columns = {columns}
							className = {"pointer" + (focused ? " focused" : "")}
							ref = "pointer"
							{...this.props}
							onDoubleClick={this.startEdit}
							position = {sel}
							fudge = {{left: -5.25 + geo.leftOffset, top: -0.25, height: -0.5, width: -0.5}} />

						<Overlay
							columns = {columns}
							className = {"selection " + (_this.isFocused() ? " focused" : "")}
							ref = "selection"
							{...this.props}
							onDoubleClick = {this.startEdit}
							position = {sel}
							fudge = {{left: -6.25  + geo.leftOffset, top: -1.25, width: -4.25, height: -4.25}} />

						<Overlay
							columns = {columns}
							className = {"copyarea marching-ants " + (_this.isFocused() ? " focused" : "") + (_this.state.mousedown ? "" : " running")}
							ref="copyarea"
							{...this.props}
							{...this.props}
							position = {cpy}
							fudge = {{left: -4  + geo.leftOffset, top: 0.75, height: 1.25, width: 1.25}}/>

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
			: null
		}
		</div>
	}
})

export default TabularPane
