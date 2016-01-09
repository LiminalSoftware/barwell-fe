import React from "react"
import fieldTypes from "../../fields"
import _ from "underscore"
import style from "./styles/tableCells.less"

import ViewStore from "../../../../stores/ViewStore"
import modelActionCreators from "../../../../actions/modelActionCreators"
import util from '../../../../util/util'

import TabularTR from './TabularTR'

var VISIBLE_ROWS = 40
var MAX_SKIP = 2
var CYCLE = 30
var MIN_CYCLE = 25
var BACKWARD_BUFFER = MAX_SKIP
var BUFFER_SIZE = MAX_SKIP
var PAGE_SIZE = MAX_SKIP
var BAILOUT = MAX_SKIP

var onFrame = function (f) {
	// if ('requestAnimationFrame' in window) return window.requestAnimationFrame(f)
	if (false) {}
	else return setTimeout(f, CYCLE)
}

var TabularTBody = React.createClass ({

	getInitialState: function () {
		return {
			offset: 0,
			length: VISIBLE_ROWS,
			direction: 0
		}
	},

	calcTarget: function (rowOffset, prevOffset) {
		var rowCount = this.props.store ? this.props.store.getRecordCount() : 0
		var buffer = 0 - BACKWARD_BUFFER  - (BUFFER_SIZE * this.state.direction)
		var buffer = 0
		return Math.min(Math.max((rowOffset || 0) + buffer , 0), rowCount)
	},

	componentWillReceiveProps: function (next) {
		this.updateOffset(this.calcTarget(next.rowOffset, this.props.rowOffset))
	},

	componentDidUpdate: function (prevProps) {
		var _this = this
		var now = new Date().getTime()

		// we just updated so set the _lastUpdate time to now
		this._lastUpdate = now
		// we shouldn't have a timer set, but if we do clear it
		if (this.__timer) clearTimeout(this.__timer)
		// if we haven't reached the target yet, set a timer for next frame

		if (this.state.offset !== this.calcTarget(this.props.rowOffset, prevProps.rowOffset) ) {
			this.__timer = onFrame(function () {_this.updateOffset()})
		}
	},

	updateOffset: function (target) {
		target = this.calcTarget(target || this.props.rowOffset)
		var current = this.state.offset
		var delta = (target - current)
		var magnitude = Math.abs(delta)
		var direction = Math.sign(delta)
		var setpoint = current + (Math.min(magnitude, MAX_SKIP) * direction)
		this.setState({
			offset: setpoint,
			scrolling: (setpoint !== target),
			direction: (direction || this.state.direction)
		})
	},

	shouldComponentUpdate: function (nextProps, nextState) {
		// return false;
		var now = new Date().getTime()
		if (now - this._lastUpdate < MIN_CYCLE) return false
		return (Math.floor(nextProps.offset/PAGE_SIZE) !==
				Math.floor(this.state.offset/PAGE_SIZE))
	},

	_onChange: function () {
		this.forceUpdate()
	},

	componentWillMount: function () {
		ViewStore.addChangeListener(this._onChange)
		this.props.store.addChangeListener(this._onChange)
		// this.worker = new Worker('/_assets/js/scrollWorker.js');
	},

	componentDidMount: function () {
		this._lastUpdate = new Date().getTime()
	},

	componentWillUnmount: function () {
		ViewStore.removeChangeListener(this._onChange)
		this.props.store.removeChangeListener(this._onChange)
	},

	getNumberCols: function () {
		return this.props.columns.length - 1
	},

	getNumberRows: function () {
		return this.store.getRecordCount()
	},

	getColumns: function () {
		return this.props.columns
	},

	prepareRow: function (obj, index) {
		var view = this.props.view
		var geo = view.data.geometry
		var model = this.props.model
		var pk = model._pk
		var rowKey = this.props.prefix + '-tr-' + (obj.cid || obj[pk])
		var offset = Math.floor(this.state.offset/PAGE_SIZE) * PAGE_SIZE

		return <TabularTR  {...this.props}
			obj = {obj}
			row = {index + offset}
			rowKey = {rowKey}
			geometry = {geo}
			ref = {rowKey}
			key = {rowKey}
			isScrolling = {this.state.scrolling} />;
	},

	render: function () {
		var view = this.props.view
		var model = this.props.model
		var pk = model._pk
		var offset = Math.floor(this.state.offset/PAGE_SIZE) * PAGE_SIZE
		var length = Math.floor(this.state.length/PAGE_SIZE) * PAGE_SIZE
		var rows = this.props.store ? this.props.store.getObjects(
			offset, offset + length
		) : []
		var rowCount = this.props.store ? this.props.store.getRecordCount() : 0
		var geo = view.data.geometry
		var floatOffset = this.props.floatOffset
		// var style

		// if (this.props.prefix === 'rhs') style = {
		// 	left: view.data.fixedWidth + 'px',
		// 	marginLeft: (-1 * view.data.hiddenColWidth) + 'px',
		// 	top: 0,
		// 	width:  view.data.floatWidth + 'px',
		// 	height: (rowCount * geo.rowHeight) + 'px',
		// }
		// if (this.props.prefix === 'lhs') style = {
		// 	left: 0,
		// 	top: 0,
		// 	width:  view.data.fixedWidth + 'px',
		// 	height: (rowCount * geo.rowHeight) + 'px',
		// }

		return <div
				className = {"tabular-tbody "}
				onPaste = {this.props._handlePaste}
				ref = "tbody"
				style = {this.props.style}
				onContextMenu = {this.props._handleContextMenu}>
				{ rows.map(this.prepareRow) }
			</div>
	}
})



export default TabularTBody
