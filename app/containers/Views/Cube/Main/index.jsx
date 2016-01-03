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

import ViewDataStores from "../../../../stores/ViewDataStores"
import storeFactory from 'flux-store-factory';
import dispatcher from '../../../../dispatcher/MetasheetDispatcher'

import createCubeStore from './CubeStore.jsx'

import fieldTypes from "../../fields"
import CubeColTHead from "./CubeColTHead"
import CubeRowTHead from "./CubeRowTHead"
import CubeTBody from "./CubeTBody"
import OverflowHider from "./OverflowHider"

import ContextMenu from './CubeContextMenu'

import TableMixin from '../../TableMixin.jsx'

var CubePane = React.createClass ({

	mixins: [TableMixin],

	getInitialState: function () {
		var view = this.props.view
		var geometry = view.data.geometry
		return {
			scrollTop: 0,
			scrollLeft: 0,
			actRowHt: geometry.rowHeight
		}
	},

	componentWillMount: function () {
		ViewStore.addChangeListener(this._onChange)
		AttributeStore.addChangeListener(this._onChange)
		ModelStore.addChangeListener(this._onChange)
		FocusStore.addChangeListener(this._onChange)

		this.store = createCubeStore(this.props.view)
		this.store.addChangeListener(this._onChange)
	},

	componentWillUnmount: function () {
		ViewStore.removeChangeListener(this._onChange)
		AttributeStore.removeChangeListener(this._onChange)
		ModelStore.removeChangeListener(this._onChange)
		FocusStore.removeChangeListener(this._onChange)

		if (this.store) this.store.removeChangeListener(this._onChange)
		this.store.unregister()
	},

	_onChange: function () {
		this.forceUpdate()
	},

	onScroll: function (event) {
		var wrapper = ReactDOM.findDOMNode(this.refs.wrapper)
		this.setState({
			scrollTop: wrapper.scrollTop,
			scrollLeft: wrapper.scrollLeft
		})
	},

	getNumberCols: function () {
		return this.store.getCount('columns') - 1
	},

	getNumberRows: function () {
		return this.store.getCount('rows') - 1
	},

	getColumns: function () {
		var view = this.props.view
		if (!this.colLevelStore) return []
		return this.store.getLevels('columns').map(function () {
			return {width: view.data.columnWidth}
		})
	},

	getSelectorStyle: function () {
		var sel = this.state.selection

		return this.getOverlayStyle({
			left: sel.left,
			right: sel.right,
			top: sel.top,
			bottom: sel.bottom
		}, {
			left: -1,
			top: -2,
			height: 0,
			width: 0
		})
	},

	getPointerStyle: function () {
		var ptr = this.state.pointer
		return this.getOverlayStyle({
			left: ptr.left,
			right: ptr.left,
			top: ptr.top,
			bottom: (('bottom' in ptr) ? ptr.bottom : ptr.top)
		}, {
			left: 0,
			top: -1,
			height: 0,
			width: -1
		})
	},

	getOverlayStyle: function (pos, fudge) {
		var view = this.props.view
		var geo = view.data.geometry
		var headerRows = view.row_aggregates.length
		var headerCols = view.column_aggregates.length
		var actRowHt = this.state.actRowHt
		var width = geo.columnWidth + geo.widthPadding

		return {
			top: ((pos.top + headerCols) * actRowHt + fudge.top || 0) + 'px',
			left: (((pos.left + headerRows) * width) + geo.leftGutter + fudge.left || 0 ) + 'px',
			minWidth: ((pos.right - pos.left + 1) * width + fudge.width || 0) + 'px',
			minHeight: ((pos.bottom - pos.top + 1) * actRowHt - geo.rowPadding) + 'px'
		}
	},

	getRCCoords: function (event, isDrag) {
		var tableBody = ReactDOM.findDOMNode(this.refs.tbody)
		var view = this.props.view
		var geo = view.data.geometry
		var columnWidth = geo.columnWidth + geo.widthPadding
		var offset = $(tableBody).offset()
		var y = event.pageY - offset.top
		var x = event.pageX - offset.left
		var r = Math.floor(y / this.state.actRowHt, 1)
		var c = Math.floor(x / columnWidth, 1)

		var coords = {top: r, left: c, x: x, y: y}
		return coords
	},

	getFieldAt: function (pos) {
		var tbody = this.refs.tbody
		var view = this.props.view
		var rowKey = 'cell-' + row
		var cellKey
		var attribute

		if (pos.left >= 0 && pos.top >= 0) {
			cellKey = rowKey + '-' + col
			return this.refs.tbody.refs[rowKey].refs[cellKey]
		} else if (col < 0) {
			attribute = 'a' + view.row_aggregates[view.row_aggregates.length + left]
			cellKey = rowKey + '-' + attribute
			return this.refs.rowhead.refs[cellKey]
		}
	},

	editCell: function (event) {
		var tbody = this.refs.tbody
		this.setState({
			editing: true,
			copyarea: null
		})
		tbody.setState({
			editing: true
		})
		// var field = this.refs.tbody.refs[rowKey].refs[cellKey]
		this.getFieldAt(this.state.pointer).handleEdit(event);
	},

	updateSelect: function (row, col, shift, direction) {
		var numCols = this.getNumberCols()
		var numRows = this.getNumberRows()
		var sel = this.state.selection
		var anc = this.state.anchor
		var ptr = {left: col, top: row}
		var view = this.props.view

		if (shift && anc.left >= 0 && anc.top >= 0 && row >= 0 && col >= 0) {
			col = Math.min(col, numCols)
			row = Math.min(row, numRows)
			if (!anc) anc = {left: col, top: row}
			sel = {
				left: Math.max(Math.min(anc.left, ptr.left, numCols), 0),
				right: Math.min(Math.max(anc.left, ptr.left, 0), numCols),
				top: Math.max(Math.min(anc.top, ptr.top, numRows), 0),
				bottom: Math.min(Math.max(anc.top, ptr.top, 0), numRows)
			}
			ptr.left = col
			ptr.top = row
		} else if (ptr.left < 0) {
			ptr.left = Math.max(-1 * view.row_aggregates.length, ptr.left)
			// TODO: functionalize this and harmonize rows/cols
			var attribute = 'a' + view.row_aggregates[view.row_aggregates.length + ptr.left]
			var row
			for(; ptr.top >= 0 && ptr.top < numRows; ptr.top += (direction === 'down' ? 1 : -1) ) {
				row = this.store.getLevel('rows', ptr.top)
				if (row.spans[attribute] > 0) break;
			}
			ptr.bottom = ptr.top + row.spans[attribute] - 1
			sel = ptr
			sel.right = numCols
		} else if (ptr.top < 0) {
			ptr.top = Math.max(-1 * view.column_aggregates.length, ptr.top)
			var attribute = 'a' + view.column_aggregates[view.column_aggregates.length + ptr.top]
			var col
			for(; ptr.left >= 0 && ptr.right < numCols; ptr.left += (direction === 'right' ? 1 : -1) ) {
				col = this.store.getLevel('columns', ptr.left)
				if (col.spans[attribute] > 0) break;
			}
			ptr.right = ptr.left + col.spans[attribute] - 1
			sel = ptr
			sel.bottom = numRows
		} else {
			col = Math.min(col, numCols)
			row = Math.min(row, numRows)

			ptr = anc = {
				left: col,
				top: row
			}
			sel = {
				left: col,
				right: col,
				top: row,
				bottom: row
			}
		}

		this.setState({
			pointer: ptr,
			selection: sel,
			anchor: anc
		})
	},

	selectRow: function () {
		var view = this.props.view
		var numGroupCols = view.row_aggregates.length
		var ptr = this.state.pointer
		ptr.left = ((Math.min(ptr.left, 0)) % numGroupCols) - 1
		this.updateSelect(ptr.top, ptr.left)
	},

	insertRecord: function () {
		var obj = {}
		var model = this.props.model
		var rowLevel = this.store.getLevel('rows', this.state.pointer.top)
		var colLevel = this.store.getLevel('columns', this.state.pointer.left)

		// initialize the new record with default values
		AttributeStore.query({model_id: (model.model_id || model.cid)}).forEach(function(attr) {
			if(('a' + attr.attribute_id) != model._pk) {
				obj['a' + attr.attribute_id] = attr.default_value
			}
		})
		// override defaults based on the location in the cube
		obj = _.omit(_.extend(obj, rowLevel, colLevel), 'spans')

		modelActionCreators.insertRecord(this.props.model, obj)
		this.setState({copyarea: null})
	},

	deleteRecord: function () {

	},

	copySelection: function () {

	},

	openContextMenu: function (event) {

		event.preventDefault();
		var rc = this.getRCCoords(event)
		var sel = this.state.selection
		var geo = this.props.view.data.geometry
		modelActionCreators.setFocus('view')
		if (rc.row > sel.bottom || rc.row < sel.top ||
			rc.col > sel.right || rc.col < sel.left)
			this.updateSelect(rc.row, rc.col, false, false)

		this.setState({
			contextOpen: true,
			contextX: 20,
			contextY: rc.top * geo.rowHeight
		})
	},

	getVStart: function () {
		var scrollTop = this.state.scrollTop
		var geo = this.props.view.data.geometry
		var vStart = scrollTop / this.state.actRowHt - (geo.renderBufferRows - geo.screenRows) / 2
		return Math.max(0, Math.floor(vStart))
	},

	getHStart: function () {
		var scrollLeft = this.state.scrollLeft
		var geo = this.props.view.data.geometry
		var hStart = scrollLeft / geo.columnWidth - (geo.renderBufferCols - geo.screenCols) / 2
		return Math.max(0, Math.floor(hStart))
	},

	render: function () {
		var _this = this
		var model = this.props.model
		var view = this.props.view
		var geo = view.data.geometry
		var scrollLeft = this.state.scrollLeft
		var scrollTop = this.state.scrollTop
		var height = this.state.actRowHt
		var hStart = this.getHStart()
		var vStart = this.getVStart()

		var numAggregates = view.row_aggregates.length + view.column_aggregates.length

		if (numAggregates === 0)
			return <div className="view-body-wrapper" onScroll={this.onScroll} ref="wrapper"></div>

		return <div className="view-body-wrapper" onScroll={this.onScroll} ref="wrapper">
				<div id="main-data-table" className="header data-table">
					<CubeColTHead
						key = {"cube-col-thead-" + view.view_id}
						clicker = {_this.onMouseDown}
						dimension = 'column'
						store = {this.store}
						hStart = {hStart}
						scrollTop = {scrollTop}
						handleBlur = {_this.handleBlur}
						openContextMenu = {_this.openContextMenu}
						model = {model}
						view = {view} />
					<CubeRowTHead
						ref = 'rowhead'
						key = {"cube-row-thead-" + view.view_id}
						clicker = {_this.onMouseDown}
						dimension = 'row'
						store = {this.store}
						vStart = {vStart}
						scrollLeft = {scrollLeft}
						handleBlur = {_this.handleBlur}
						openContextMenu = {_this.openContextMenu}
						actRowHt = {height}
						model = {model}
						view = {view} />
					<CubeTBody
						key = {"cube-body-" + view.view_id}
						ref = 'tbody'
						clicker = {_this.onMouseDown}
						view = {view}
						model = {model}
						scrollLeft = {scrollLeft}
						scrollTop = {scrollTop}
						handleBlur = {_this.handleBlur}
						openContextMenu = {_this.openContextMenu}
						actRowHt = {height}
						vStart = {vStart}
						hStart = {hStart}
						store = {this.store}
						/>
				</div>
				<div
					className={"pointer" + (_this.isFocused() ? " focused" : "")}
					ref = "anchor"
					onDoubleClick = {this.startEdit}
					style = {_this.getPointerStyle()}>
				</div>
				<div
					className={"selection" + (_this.isFocused() ? " focused" : "")}
					ref="selection"
					style={_this.getSelectorStyle()}>
				</div>
				{_this.state.contextOpen ?
					<ContextMenu
						x = {_this.state.contextX} y = {_this.state.contextY}
						handleContextBlur = {_this.handleContextBlur}
						addNewRecord = {_this.insertRecord}
						deleteRecords = {_this.deleteRecords}
						copySelection = {_this.copySelection}
						/>
					: null}
		</div>
	}
})

export default CubePane

// <OverflowHider
						// scrollLeft = {_this.state.scrollLeft}
						// scrollTop = {_this.state.scrollTop}
						// view = {view} />
