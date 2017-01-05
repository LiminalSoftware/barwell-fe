import React from "react"
import ReactDOM from "react-dom"
import fieldTypes from "../../fields"
import _ from "underscore"
import style from "./styles/tableCells.less"

import ViewStore from "../../../stores/ViewStore"
import modelActionCreators from "../../../actions/modelActionCreators"
import util from "../../../util/util"

import ReactPerf from "react-addons-perf"

import TabularTR from './TabularTR'


var VISIBLE_ROWS = 50
var MAX_ROWS = 50
var SLOW_SKIP = 2
var FAST_SKIP = 3
var FASTER_SKIP = 5
var FAST_THRESHOLD = 10
var FASTER_THRESHOLD = 15
var CYCLE = 25
var MIN_CYCLE = 15
var BUFFER_SIZE = 10
var PAGE_SIZE = SLOW_SKIP
var BAILOUT = SLOW_SKIP

var HAS_3D = util.has3d()

var TabularTBody = React.createClass ({

	// LIFECYCLE ==============================================================

	getInitialState: function () {
		const offset = this.props.rowOffset || 0;
		return {
			start: offset || 0,
			end:  offset + VISIBLE_ROWS,
			offset: 0,
			target: 0,
			length: VISIBLE_ROWS,
			scrollDirection: 1,
			speed: 0,
			rowOffset: offset || 0,
			pages: []
		}
	},

	// _onChange: function () {
	// 	this.forceUpdate()
	// },

	// componentWillMount: function () {
	// 	this.props.store.addChangeListener(this._onChange);
	// },

	// componentWillUnmount: function () {
	// 	this.props.store.removeChangeListener(this._onChange);
	// },

	// UTILITY ================================================================

	getInterimTarget: function (target) {
		var fetchStart = this.props.fetchStart
		var fetchEnd = this.props.fetchEnd
		var adjTarget = util.limit(fetchStart, fetchEnd - 1, target - BUFFER_SIZE)
		var start = this.state.start
		var end = this.state.end
		var lag = Math.abs(target - start)
		var skip = (lag >= FAST_THRESHOLD || !this.state.scrolling) ?
			(lag >= FASTER_THRESHOLD ? FASTER_SKIP : FAST_SKIP) : SLOW_SKIP
		var startTarget = adjTarget
		var endTarget = adjTarget + VISIBLE_ROWS

		// advance or retreat the begining of the range as appropriate

		if (start > endTarget) {
			end = endTarget
			start = endTarget - 2
		} else if (end < startTarget) {
			end = startTarget + 2
			start = startTarget
		} else {
			if (start > startTarget || start < startTarget)
				start += util.magLimit(skip, startTarget - start);
			if (end < endTarget || end > endTarget)
				end += util.magLimit(skip, endTarget - end);
		}

		return {
			start: start,
			target: target,
			end: end
		}
	},

	updateOffset: function (target, scrollDirection) {
		const tgt = this.getInterimTarget(target)

		this.setState(tgt);
		return (this.state.start !== tgt.start || this.state.end !== tgt.end)
	},

	isUnpainted: function () {
		const tgt = this.getInterimTarget(this.state.target)
		return (this.state.start !== tgt.start || this.state.end !== tgt.end)
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

	// RENDER ================================================================

	preparePage: function (objects, index) {

	},

	prepareRow: function (obj, index, orderProps) {
		const {store, model, pointer, prefix} = this.props
		const {start: offset} = this.state
		const pk = model._pk

		const rowKey = prefix + '-tr-' + (obj.cid || obj[pk])
		const selectedRecords = this.props.store.getSelection()
		const rowCount = store.getRecordCount()

		return <TabularTR
			view = {this.props.view}
			model = {this.props.model}
			hasRowLabel = {this.props.hasRowLabel}
			selected = {(obj.cid || obj[pk]) in selectedRecords}
			columns = {this.props.columns}
			obj = {obj}
			row = {index + offset}
			rowKey = {rowKey}
			ref = {rowKey}
			key = {rowKey}
			{...orderProps}/>;
	},

	render: function () {
		const {view, model, store} = this.props
		const pk = model._pk
		const rows = store ? store.getObjects(
			this.state.start,
			this.state.end
		) : []
		const rowCount = store ? this.props.store.getRecordCount() : 0
		const geo = view.data.geometry

		const scrollOffset = -1 * this.state.rowOffset * geo.rowHeight

		const style = {
			left: 0,
			margin: 0,
			top: HAS_3D ? 0 : (scrollOfset + 'px'),
			height: rowCount * geo.rowHeight,
			width: this.props.width,
			transform: HAS_3D ?
				`translate3d(0, ${scrollOffset}px, 5px)`
				: null,
			zIndex: 5
		}

		return <div
			className = {`tabular-body-${this.props.prefix} tabular-body wrapper`}

			onMouseDown = {this.props._handleClick}
			onDoubleClick = {this.props._handleEdit}
			onWheel = {this.props._handleWheel}
			onDrop = {this.props._handleDrop}
			onDragOver = {this.props._handleDragOver}
			onContextMenu = {this.props._handleContextMenu}
			ref = "tbody"
			style = {this.props.style}>

			{ rows.map((obj, index) => {
				let prev = index > 0 ? rows[index - 1] : {}
				let next = index + 1 < rows.length ? rows[index + 1] : {}

				const orderProps = {
					ooo: !!obj._outoforder,
					oooFirst: index > 0 && !!obj._outoforder && !prev._outoforder,
					oooNext: !!next._outoforder && !obj._outoforder,
					oooLast: index !== rows.length - 1 && !next._outoforder && !!obj._outoforder,
				}

				return this.prepareRow(obj, index, orderProps)
			}) }

		</div>
	}
})



export default TabularTBody
