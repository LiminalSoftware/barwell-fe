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
import TabularTHead from "./TabularTHead"
import TableMixin from '../../TableMixin.jsx'

import ContextMenu from './ContextMenu'



var TabularPane = React.createClass ({

	mixins: [TableMixin],

	getInitialState: function () {
		return {
			sorting: null,
			contextOpen: false,
			contextX: null,
			contextY: null,
		}
	},

	componentWillMount: function () {
		ViewStore.addChangeListener(this._onChange)
		AttributeStore.addChangeListener(this._onChange)
		ModelStore.addChangeListener(this._onChange)
		FocusStore.addChangeListener(this._onChange)

		this.store = createTabularStore(this.props.view)
		this.store.addChangeListener(this._onChange)
	},

	componentDidMount: function () {
		this.calibrateRowHeight()
	},

	componentWillUnmount: function () {
		ViewStore.removeChangeListener(this._onChange)
		AttributeStore.removeChangeListener(this._onChange)
		ModelStore.removeChangeListener(this._onChange)
		FocusStore.removeChangeListener(this._onChange)

		if (this.store) this.store.removeChangeListener(this._onChange)
		this.store.unregister()
	},

	componentWillReceiveProps: function (newProps) {
		var oldProps = this.props;
		if (!_.isEqual(oldProps.sorting, newProps.sorting)) {
			this.fetch(true)
		}
	},

	_onChange: function () {
		this.forceUpdate()
	},

	getVisibleColumns: function () {
		var view = this.props.view
		return _.filter(view.data.columnList, 'visible');
	},

	onScroll: function (event) {
		var wrapper = React.findDOMNode(this.refs.wrapper)
		this.setState({scrollTop: wrapper.scrollTop})
	},

	getColumns: function () {
		return this.getVisibleColumns()
	},

	getNumberCols: function () {
		return this.getColumns().length
	},

	getNumberRows: function () {
		return this.store.getRecordCount()
	},

	getValueAt: function (idx) {
		return this.store.getObjects()[idx]
	},

	getSelectorStyle: function () {
		var sel = this.state.selection
		return this.getOverlayStyle({
			left: sel.left,
			right: sel.right,
			top: sel.top,
			bottom: sel.bottom
		}, {
			left: 1,
			top: -0.75,
			height: -1,
			width: -1
		})
	},

	getCopyareaStyle: function () {
		var cpy = this.state.copyarea
		var ptr = this.state.pointer
		var coincide = _.isEqual(cpy, ptr)
		return this.getOverlayStyle({
			left: cpy.left,
			right: cpy.right,
			top: cpy.top,
			bottom: cpy.bottom
		}, {
			left: 1,
			top: -0.75,
			height: 1,
			width: 1
		})
	},

	getPointerStyle: function () {
		var ptr = this.state.pointer
		return this.getOverlayStyle({
			left: ptr.left,
			right: ptr.left,
			top: ptr.top,
			bottom: ptr.top
		}, {
			top: -2,
			height: -1,
			width: -1
		})
	},

	getOverlayStyle (pos, fudge) {
		var geo = this.props.view.data.geometry
		var width = 0
		var left = geo.leftOffset
		fudge = fudge || {}

		this.getVisibleColumns().forEach(function (col, idx) {
			if (idx < pos.left)
				left += (col.width + geo.widthPadding)
			else if (idx <= pos.right)
				width += col.width + geo.widthPadding
		})
		return {
			top: (pos.top * this.state.actRowHt + this.state.offset + (fudge.top || 0)) + 'px',
			left: (left + (fudge.left || 0)) + 'px',
			minHeight: ((pos.bottom - pos.top + 1) * this.state.actRowHt + (fudge.height || 0)) + 'px',
			minWidth: (width + (fudge.width || 0)) + 'px'
		}
	},

	ieMozPreventSelction: function () {
		document.onselectstart = util.returnFalse
		document.onmousedown = util.returnFalse
	},

	onClick: function (event) {
		// this.ieMozPreventSelction()
		var rc = this.getRCCoords(event)
		this.updateSelect(rc.row, rc.col, event.shiftKey)
	},

	getRCCoords: function (event) {
		var tbody = React.findDOMNode(this.refs.tbody)
		var view = this.props.view
		var geo = view.data.geometry
		var actHeight = this.state.actRowHt
		var columns = this.getColumns()
		var offset = $(tbody).offset()
		var y = event.pageY - offset.top
		var x = event.pageX - offset.left
		var xx = x
		var r = Math.floor(y / actHeight, 1)
		var c = 0

		modelActionCreators.setFocus('view')
		columns.forEach(function (col) {
			xx -= (col.width + geo.widthPadding)
			if (xx > 0) c ++
		})

		return {row: r, col: c, x: x, y: y}
	},

	getFieldAt: function (row, col) {
		var tbody = this.refs.tbody
		var row = this.state.pointer.top
		var col = this.state.pointer.left
		var colId = this.getVisibleColumns()[col].column_id
		var obj = this.getValueAt(row)
		var model = this.props.model
		var objId = (obj.cid || obj[model._pk]);
		var rowKey = 'tr-' + objId
		var cellKey = rowKey + '-' + colId
		return this.refs.tbody.refs[rowKey].refs[cellKey]
	},

	editCell: function (event, row, col) {
		var tbody = this.refs.tbody
		this.setState({
			editing: true,
			copyarea: null
		})
		tbody.setState({
			editing: true
		})
		// var field = this.refs.tbody.refs[rowKey].refs[cellKey]
		this.getFieldAt(row, col).handleEdit(event);
	},

	insertRecord: function () {
		var cid = this.store.getClientId()
		var obj = {cid: cid}
		var position = this.state.selection.top;
		var model = this.props.model

		// initialize the new record with default values
		AttributeStore.query({model_id: (model.model_id || model.cid)}).forEach(function(attr) {
			if(('a' + attr.attribute_id) != model._pk) {
				obj['a' + attr.attribute_id] = attr.default_value
			}
		})
		modelActionCreators.insertRecord(this.props.model, obj, position)
		this.setState({copyarea: null})
	},

	deleteRecords: function () {
		var model = this.props.model
		var sel = this.state.selection
		var pk = model._pk
		var selectors = []

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
				clipboard += this.getFieldAt(r, c).props.value + (c == sel.right ? "" : "\t")
			}
			clipboard += (r == sel.bottom ? "" : "\n")
		}
		copyTextToClipboard(clipboard)
		this.setState({copyarea: _.clone(sel)})
	},

	openContextMenu: function (event) {
		event.preventDefault();
		var rc = this.getRCCoords(event)
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

	calibrateRowHeight: function () {
		if (!(this.isMounted())) return
		var geo = this.props.view.data.geometry
		var tbody = this.refs.tbody
		this.setState({
			actRowHt: tbody ? tbody.getRowHeight() : geo.rowHeight,
			offset: tbody ? tbody.getOffset() : geo.headerHeight
		})
		window.setTimeout(this.calibrateRowHeight, 500)
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

	render: function () {
		var _this = this
		var model = this.props.model
		var view = this.props.view
		var columns = this.getVisibleColumns()
		var focused = (FocusStore.getFocus() == 'view')

		// console.log('contextOpen: ' + this.state.contextOpen)

		return <div className="view-body-wrapper" onScroll={this.onScroll} ref="wrapper">
				<table id="main-data-table" className="header tabular-main-table data-table">
					<TabularTHead
						key = {"tabular-thead-" + view.view_id}
						scrollTop = {this.state.scrollTop}
						columns = {columns}
						view = {view} />
					<TabularTBody
						ref = "tbody"
						handleBlur = {_this.handleBlur}
						editCell = {_this.editCell}
						key = {"tbody-" + view.view_id}
						model = {model}
						view = {view}
						store = {_this.store}
						clicker = {_this.onClick}
						openContextMenu = {_this.openContextMenu}
						columns = {columns}
						sorting = {view.data.sorting}
						scrollTop = {this.state.scrollTop}
						/>
				</table>
				{_this.state.contextOpen ?
					<ContextMenu
						x = {this.state.contextX} y = {this.state.contextY}
						handleContextBlur = {this.handleContextBlur}
						insertRecord = {this.insertRecord}
						deleteRecords = {this.deleteRecords}
						copySelection = {this.copySelection}
						/>
					: null}
				<div
					className={"pointer" + (_this.isFocused() ? " focused" : "")}
					ref="anchor"
					onDoubleClick={this.startEdit}
					style={this.getPointerStyle()}>
				</div>
				{this.state.copyarea ? <div
					className={"copyarea marching-ants " + (_this.isFocused() ? " focused" : "")}
					ref="copyarea"
					style={this.getCopyareaStyle()}>
				</div> : null}
				<div
					className={"selection " + (_this.isFocused() ? " focused" : "")}
					ref="selection"
					style={this.getSelectorStyle()}>
				</div>
		</div>
	}
})

export default TabularPane
