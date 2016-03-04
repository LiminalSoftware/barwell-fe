import React from "react"
import fieldTypes from "../../fields"
import _ from "underscore"
import style from "./styles/tableCells.less"

import ViewStore from "../../../../stores/ViewStore"
import modelActionCreators from "../../../../actions/modelActionCreators"
import util from '../../../../util/util'

import ReactPerf from "react-addons-perf"

import TabularTR from './TabularTR'


var VISIBLE_ROWS = 45
var MAX_ROWS = 45
var SLOW_SKIP = 2
var FAST_SKIP = 3
var FASTER_SKIP = 6
var FAST_THRESHOLD = 5
var FASTER_THRESHOLD = 25
var CYCLE = 30
var MIN_CYCLE = 15
var BACKWARD_BUFFER = 5
var BUFFER_SIZE = 0
var PAGE_SIZE = SLOW_SKIP
var BAILOUT = SLOW_SKIP

var HAS_3D = util.has3d()

var TabularTBody = React.createClass ({

	getInitialState: function () {
		return {
			start: 0,
			end: VISIBLE_ROWS,
			offset: 0,
			target: 0,
			length: VISIBLE_ROWS,
			scrollDirection: 1,
			speed: 0,
			rowOffset: 0
		}
	},

	componentWillUpdate: function () {
		//we shouldn't have a timer set, but if we do clear it
		if (this.__timer) clearTimeout(this.__timer)
	},

	updateOffset: function (target, scrollDirection) {
		var store = this.props.store
		var fetchStart = this.props.fetchStart
		var fetchEnd = this.props.fetchEnd

		var buffer = 0 - BACKWARD_BUFFER  + (BUFFER_SIZE * scrollDirection)
		var adjTarget = util.limit(fetchStart, fetchEnd - 10, target + buffer)

		var start = this.state.start
		var end = this.state.end
		var visibleRows = (end - start)
		var lag = Math.abs(target - start)
		var skip = (lag >= FAST_THRESHOLD || !this.state.scrolling) ? (lag >= FASTER_THRESHOLD ? FASTER_SKIP : FAST_SKIP) : SLOW_SKIP
		var startTarget = adjTarget
		var endTarget = adjTarget + VISIBLE_ROWS
		
		// advance or retreat the begining of the range as appropriate
		if (start > startTarget && scrollDirection === -1 && start < endTarget) start -= Math.min(skip, start - startTarget)
		else if ((end === target + VISIBLE_ROWS && visibleRows > VISIBLE_ROWS) || visibleRows >= MAX_ROWS) 
			start += Math.min(skip, visibleRows - VISIBLE_ROWS)
		
		// advance or retreat the end of the range as appropriate
		if (end < endTarget && scrollDirection === 1 && end > startTarget) end += Math.min(skip, endTarget - end + 1)
		else if ((start === target && visibleRows > VISIBLE_ROWS) || visibleRows >= MAX_ROWS) 
			end -= Math.min(skip, visibleRows - VISIBLE_ROWS)

		// if the render range is totally out of the visible range, then just wind it down and start over
		if (start > endTarget || end < startTarget) end -= Math.min(FASTER_SKIP, end - start)
		if (end === start && end < startTarget) {
			start = startTarget
			end = startTarget + skip
		} else if (end === start) {
			start = endTarget - skip
			end = endTarget
		}

		this.setState({
			start: start,
			target: adjTarget,
			end: end
		})
	},

	isUnpainted: function () {
		var startTarget = Math.max(this.state.target, this.props.fetchStart)
		var endTarget = Math.min(this.state.target + VISIBLE_ROWS, this.props.fetchEnd)
		return Math.abs(this.state.start - startTarget) + Math.abs(this.state.end  - endTarget) > 3
	},

	shouldComponentUpdate: function (nextProps, nextState) {

		if (nextProps.view !== this.props.view) return true
		if (nextProps.focused !== this.props.focused) return true
		// if (!nextProps.shouldPaint) return false
		// if (now - this._lastUpdate < MIN_CYCLE) return false
		return this.isUnpainted(nextState)
	},

	componentDidUpdate: function (prev) {
		// this.updateOffset(this.state.target, this.state.scrollDirection)
	},

	_onChange: function () {
		this.forceUpdate()
	},

	componentWillMount: function () {
		// if (this.props.prefix === 'lhs') gTbodyHistory = []
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
		// var offset = this.state.offset
		var offset = this.state.start

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
			this.state.start, this.state.end
			// this.state.offset, this.state.offset + VISIBLE_ROWS
		) : []
		var rowCount = this.props.store ? this.props.store.getRecordCount() : 0
		var geo = view.data.geometry
		var floatOffset = this.props.floatOffset		
		var style = this.props.style
		style.transform = "translate3d(0, " + (-1 * this.state.rowOffset * geo.rowHeight ) + "px, 0)"

		// console.log('tbody render.  ' + this.props.prefix)

		return <div
			className = {"tabular-body force-layer " + (this.props.focused ? ' focused ' : ' gray-out ')}
			
			onMouseDown = {this.props._handleClick}
			onDoubleClick = {this.props._handleEdit}
			onWheel = {this.props._handleWheel}
			
			ref = "tbody"
			style = {this.props.style}
			onContextMenu = {this.props._handleContextMenu}>
			{ rows.map(this.prepareRow) }
		</div>
	}
})



export default TabularTBody
