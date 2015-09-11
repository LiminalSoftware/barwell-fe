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

import ViewDataStores from "../../../../stores/ViewDataStores"
import storeFactory from 'flux-store-factory';
import dispatcher from '../../../../dispatcher/MetasheetDispatcher'

import createCubeStore from './CubeStore.jsx'

import fieldTypes from "../../fields"
import CubeColTHead from "./CubeColTHead"
import CubeRowTHead from "./CubeRowTHead"
import CubeTBody from "./CubeTBody"
import OverflowHider from "./OverflowHider"

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

	componentDidMount: function () {
		this.calibrate()
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
		var wrapper = React.findDOMNode(this.refs.wrapper)
		this.setState({
			scrollTop: wrapper.scrollTop,
			scrollLeft: wrapper.scrollLeft
		})
	},

	calibrate: function () {
		if (!(this.isMounted())) return
		var view = this.props.view
		var geometry = view.data.geometry
		var calibration = this.refs.rowhead.getCalibration() || geometry.rowHeight

		this.setState({
			rowHeight: calibration,
			actRowHt: calibration
		})
		window.setTimeout(this.calibrate, 500)
	},

	getNumberCols: function () {
		return this.store.getCount('columns')
	},

	getNumberRows: function () {
		return this.store.getCount('rows')
	},

	getColumns: function () {
		var view = this.props.view
		if (!this.colLevelStore) return []
		return this.store.getLevels('columns').map(function () {
			return {width: view.data.columnWidth}
		})
	},

	getSelectorStyle: function () {
		var view = this.props.view
		var geo = view.data.geometry
		var headerRows = view.row_aggregates.length
		var headerCols = view.column_aggregates.length

		var actRowHt = this.state.actRowHt
		var width = geo.columnWidth + geo.widthPadding
		var sel = this.state.selection

		return {
			top: ((sel.top + headerCols) * actRowHt - 1) + 'px',
			left: ((sel.left + headerRows) * width + geo.leftGutter) + 'px',
			minWidth: ((sel.right - sel.left + 1) * width) + 'px',
			minHeight: ((sel.bottom - sel.top + 1) * actRowHt - 1) + 'px'
		}
	},

	getPointerStyle: function () {
		var view = this.props.view
		var geo = view.data.geometry
		var headerRows = view.row_aggregates.length
		var headerCols = view.column_aggregates.length

		var actRowHt = this.state.actRowHt
		var width = geo.columnWidth + geo.widthPadding
		var ptr = this.state.pointer

		return {
			top: ((ptr.top + headerCols) * actRowHt - 2) + 'px',
			left: (((ptr.left + headerRows) * width) + geo.leftGutter ) + 'px',
			minWidth: (width - 1) + 'px',
			minHeight: (actRowHt - geo.rowPadding) + 'px'
		}
	},

	onClick: function (e) {
		var tableBody = React.findDOMNode(this.refs.tbody)
		var view = this.props.view
		var geo = view.data.geometry
		var columnWidth = geo.columnWidth + geo.widthPadding

		var offset = $(tableBody).offset()
		var y = event.pageY - offset.top
		var x = event.pageX - offset.left
		var r = Math.floor(y / this.state.actRowHt, 1)
		var c = Math.floor(x / columnWidth, 1)

		modelActionCreators.setFocus('view')
		this.updateSelect(r, c, event.shiftKey)
	},

	editCell: function (event, initialValue) {
		var row = this.state.pointer.top
		var col = this.state.pointer.left
		var obj = this.getValueAt(row);
		var model = this.props.model
		var pk = model._pk
		var objId = (obj.cid || obj[pk]);
		var rowKey = 'tr-' + objId
		var cellKey = rowKey + '-' + colId

		this.setState({
			editing: true,
			editObjId: objId,
			editColId: colId
		})
		var field = this.refs[rowKey].refs[cellKey]
		field.handleEdit(event, initialValue);
	},

	isFocused: function () {
		return (FocusStore.getFocus() === 'view')
	},

	handleBlur: function () {
		this.setState({editing: false})
	},

	handleContextBlur: function () {
		this.setState({contextOpen: false})
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
				<table id="main-data-table" className="header data-table">
					<CubeColTHead
						key = {"cube-col-thead-" + view.view_id}
						dimension = 'column'
						store = {this.store}
						hStart = {hStart}
						scrollTop = {scrollTop}
						view = {view} />
					<CubeRowTHead
						ref = 'rowhead'
						key = {"cube-row-thead-" + view.view_id}
						dimension = 'row'
						store = {this.store}
						vStart = {vStart}
						scrollLeft = {scrollLeft}
						actRowHt = {height}
						view = {view} />
					<CubeTBody
						key = {"cube-body-" + view.view_id}
						ref = 'tbody'
						clicker = {_this.onClick}
						view = {view}
						model = {model}
						scrollLeft = {scrollLeft}
						scrollTop = {scrollTop}
						actRowHt = {height}
						vStart = {vStart}
						hStart = {hStart}
						store = {this.store}
						/>
				</table>
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
		</div>
	}
})

export default CubePane

// <OverflowHider
						// scrollLeft = {_this.state.scrollLeft}
						// scrollTop = {_this.state.scrollTop}
						// view = {view} />
