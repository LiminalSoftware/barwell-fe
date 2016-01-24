import React from "react"
import fieldTypes from "../../fields"
import _ from "underscore"
import style from "./styles/tableCells.less"

import ViewStore from "../../../../stores/ViewStore"
import modelActionCreators from "../../../../actions/modelActionCreators"
import util from '../../../../util/util'

import TabularTR from './TabularTR'


var VISIBLE_ROWS = 40
var MAX_ROWS = 90
var MAX_SKIP = 1
var TURBO_SKIP = 2
var TURBO_THRESHOLD = 10 
var CYCLE = 31
var MIN_CYCLE = 30
var BACKWARD_BUFFER = 6
var BUFFER_SIZE = 4
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
			start: 0,
			end: VISIBLE_ROWS,
			offset: 0,
			target: 0,
			length: VISIBLE_ROWS,
			scrollDirection: 1,
			speed: 0
		}
	},

	
	componentWillReceiveProps: function (next) {
		var rowCount = this.props.store ? this.props.store.getRecordCount() : 0
		var newOffset = next.rowOffset
		var oldOffset = this.props.rowOffset
		var delta = (newOffset - oldOffset)
		var scrollDirection = (delta > 0 ? 1 : delta < 0 ? -1 : this.state.scrollDirection)
		var buffer = 0 - BACKWARD_BUFFER  + (BUFFER_SIZE * scrollDirection)
		var target = util.limit(0, rowCount, newOffset + buffer)

		// target = 0

		this.setState({
			scrollDirection: scrollDirection,
			speed: Math.abs(delta),
			target: target
		})
		this.updateOffset()
	},

	componentWillUpdate: function () {
		
	},

	updateOffset: function () {
		if (!this.isMounted()) return
		var rowCount = this.props.store ? this.props.store.getRecordCount() : 0
		var current = this.state.offset
		var target = this.state.target
		var delta = (target - current)
		var paintDirection = (delta > 0 ? 1 : delta < 0 ? -1 : 0)
		var magnitude = Math.abs(delta)
		var skip = (magnitude >= TURBO_THRESHOLD || this.state.speed > 3) ? TURBO_SKIP : MAX_SKIP
		var step = Math.min(magnitude, skip) * paintDirection
		var setpoint = current + step
		var start = this.state.start
		var end = this.state.end
		var visibleRows = (end - start)
		
		// if (start > target && start - 1 >= 0) 
		// 	start -= (magnitude >= TURBO_THRESHOLD ? TURBO_SKIP : MAX_SKIP)
		// if (paintDirection > 0 && visibleRows >= MAX_ROWS) start += TURBO_SKIP
		// if (paintDirection === 0 && start < setpoint) start += TURBO_SKIP

		// if (end < target + VISIBLE_ROWS && end + 1 <= rowCount) 
		// 	end += (magnitude >= TURBO_THRESHOLD ? TURBO_SKIP : MAX_SKIP)
		// if (paintDirection < 0 && visibleRows >= MAX_ROWS) end -= TURBO_SKIP
		// if (paintDirection === 0 && end > setpoint + VISIBLE_ROWS) end -= TURBO_SKIP	

		this.setState({
			scrolling: (setpoint !== target),
			offset: setpoint,
			start: start,
			end: end
		})
	},

	componentDidUpdate: function (prevProps) {
		var now = new Date().getTime()
		var visibleRows = this.state.end - this.state.start

		// we just updated so set the _lastUpdate time to now
		this._lastUpdate = now
		// we shouldn't have a timer set, but if we do clear it
		if (this.__timer) clearTimeout(this.__timer)
		// if we haven't reached the target yet, set a timer for next frame

		if (this.state.offset !== this.state.target || visibleRows >= VISIBLE_ROWS) {
			this.__timer = onFrame(this.updateOffset)
		}
	},

	shouldComponentUpdate: function (nextProps, nextState) {
		// return false;
		var now = new Date().getTime()
		var visibleRows = this.state.end - this.state.start
		if (now - this._lastUpdate < MIN_CYCLE) return false

		return (this.state.offset !== this.state.target || visibleRows >= VISIBLE_ROWS)
	},

	_onChange: function () {
		console.log('tbody onchange')
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
		var model = this.props.model
		var pk = model._pk
		var ptr = this.props.pointer
		var rowKey = this.props.prefix + '-tr-' + (obj.cid || obj[pk])
		var offset = this.state.offset
		// var offset = this.state.start

		return <TabularTR  {...this.props}
			obj = {obj}
			row = {index + offset}
			rowKey = {rowKey}
			ref = {rowKey}
			key = {rowKey}
			isScrolling = {this.state.scrolling}/>;
	},

	render: function () {
		var view = this.props.view
		var model = this.props.model
		var pk = model._pk
		var offset = Math.floor(this.state.offset/PAGE_SIZE) * PAGE_SIZE
		var length = Math.floor(this.state.length/PAGE_SIZE) * PAGE_SIZE
		var rows = this.props.store ? this.props.store.getObjects(
			// this.state.start, this.state.end
			this.state.offset, this.state.offset + VISIBLE_ROWS
		) : []
		var rowCount = this.props.store ? this.props.store.getRecordCount() : 0
		var geo = view.data.geometry
		var floatOffset = this.props.floatOffset

		return <div
			className = {"tabular-tbody "}
			onPaste = {this.props._handlePaste}
			onDoubleClick = {this.props._handleEdit}
			onClick = {this.props._handleClick}
			ref = "tbody"
			style = {this.props.style}
			onContextMenu = {this.props._handleContextMenu}>
			{ rows.map(this.prepareRow) }
		</div>
	}
})



export default TabularTBody
