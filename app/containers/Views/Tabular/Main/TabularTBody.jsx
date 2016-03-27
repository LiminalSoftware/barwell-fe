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
var MAX_ROWS = 55
var SLOW_SKIP = 2
var FAST_SKIP = 3
var FASTER_SKIP = 4
var FAST_THRESHOLD = 5
var FASTER_THRESHOLD = 25
var CYCLE = 30
var MIN_CYCLE = 15
var BACKWARD_BUFFER = 10
var BUFFER_SIZE = 5
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

	updateOffset: function (target, scrollDirection) {
		var store = this.props.store
		var fetchStart = this.props.fetchStart
		var fetchEnd = this.props.fetchEnd

		var buffer = 0 - BACKWARD_BUFFER  + (BUFFER_SIZE * scrollDirection)
		var adjTarget = util.limit(fetchStart, fetchEnd - 1, target + buffer)

		// if (this.props.prefix === 'rhs' ) window.msAdjTarget = adjTarget

		var start = this.state.start
		var end = this.state.end
		var visibleRows = (end - start)
		var lag = Math.abs(target - start)
		var skip = (lag >= FAST_THRESHOLD || !this.state.scrolling) ? 
			(lag >= FASTER_THRESHOLD ? FASTER_SKIP : FAST_SKIP) : SLOW_SKIP
		var startTarget = adjTarget
		var endTarget = Math.min(adjTarget + VISIBLE_ROWS, fetchEnd)
		
		// advance or retreat the begining of the range as appropriate

		if (
			// if scrolling up, then advance the start preferentially
			(start > startTarget && scrollDirection === -1) || 
			// but if we have too many rows, then bring it in
			(start !== startTarget && visibleRows > MAX_ROWS) ||
			// if we are at rest then take the opportunity to bring it in
			(start !== startTarget && scrollDirection === 0)
		) start += util.magLimit(skip, startTarget - start)
		
		if (
			// if scrolling down, then advance the end preferentially
			(end < endTarget && scrollDirection === 1) || 
			// but if we have exceeded our max rows then advance the end too
			(end !== endTarget && visibleRows > MAX_ROWS) ||
			// and if we are at rest then also bring in the end
			(end !== endTarget && scrollDirection === 0)
		) end += util.magLimit(skip, endTarget - end)

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
		return this.isUnpainted(nextState)
	},

	_onChange: function () {
		this.forceUpdate()
	},

	componentWillMount: function () {
		ViewStore.addChangeListener(this._onChange)
		this.props.store.addChangeListener(this._onChange)
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

		// if (this.props.prefix === 'rhs') console.log('render tbody, target: ' + this.state.target + ', start: ' + this.state.start + ', end: ' + this.state.end)

		return <div
			className = {"tabular-body force-layer " + (this.props.focused ? ' focused ' : ' gray-out ')}
			
			onMouseDown = {this.props._handleClick}
			onDoubleClick = {this.props._handleEdit}
			onWheel = {this.props._handleWheel}
			onContextMenu = {this.props._handleContextMenu}
			
			ref = "tbody"
			style = {this.props.style}>
			{ rows.map(this.prepareRow) }
		</div>
	}
})



export default TabularTBody
