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


var VISIBLE_ROWS = 45
var MAX_ROWS = 45
var SLOW_SKIP = 2
var FAST_SKIP = 3
var FASTER_SKIP = 2
var FAST_THRESHOLD = 5
var FASTER_THRESHOLD = 25
var CYCLE = 25
var MIN_CYCLE = 15
var BACKWARD_BUFFER = 10
var BUFFER_SIZE = 5
var PAGE_SIZE = SLOW_SKIP
var BAILOUT = SLOW_SKIP

var HAS_3D = util.has3d()

var TabularTBody = React.createClass ({

	// LIFECYCLE ==============================================================

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

	formatRowKey: function (obj) {
		var model = this.props.model;
		var pk = model._pk;
		return this.props.prefix + '-tr-' + (obj.cid || obj[pk]);
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

	prepareRow: function (obj, index, ooo) {
		var model = this.props.model;
		var pk = model._pk;
		var ptr = this.props.pointer;
		var rowKey = this.props.prefix + '-tr-' + (obj.cid || obj[pk]);
		var offset = this.state.start;
		var selectedRecords = this.props.store.getSelection();

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
			outoforder = {ooo}
			isScrolling = {this.state.scrolling}/>;
	},

	render: function () {
		var _this = this
		var view = this.props.view
		var model = this.props.model
		var pk = model._pk
		var offset = Math.floor(this.state.offset/PAGE_SIZE) * PAGE_SIZE
		var length = Math.floor(this.state.length/PAGE_SIZE) * PAGE_SIZE
		var rows = this.props.store ? this.props.store.getObjects(
			this.state.start,
			Math.min(this.state.end, this.props.fetchEnd)
			// this.state.offset, this.state.offset + VISIBLE_ROWS
		) : []
		var rowCount = this.props.store ? this.props.store.getRecordCount() : 0
		var geo = view.data.geometry
		var floatOffset = this.props.floatOffset		
		var style = {
			left: 0,
			top: 0,
			height: rowCount * geo.rowHeight,
			width: this.props.width,
			transformStyle: "preserve-3d",
			zIndex: 5
		}
		var prevOutOfOrder = false
		

		style.transform = "translate3d(0, " + (-1 * this.state.rowOffset * geo.rowHeight ) + "px, 5px)"

		return <div
			className = {`tabular-body-${this.props.prefix} tabular-body`}
			
			onMouseDown = {this.props._handleClick}
			onDoubleClick = {this.props._handleEdit}
			onWheel = {this.props._handleWheel}
			onDrop = {this.props._handleDrop}
			onDragOver = {this.props._handleDragOver}
			onContextMenu = {this.props._handleContextMenu}
			
			ref = "tbody"
			style = {this.props.style}>
			{ rows.map(function (row, idx) {
				var next = idx + 1 <rows.length  ? rows[idx + 1] : {}
				var ooo = (next._outoforder && !row._outoforder) 
				       || (!next._outoforder && row._outoforder)

				return _this.prepareRow(row, idx, ooo);
			}) 
			}
			{
			this.props.hasRowLabel ? 
			<span className="new-adder" 
			onClick = {this.props._addRecord}
			onContextMenu = {util.clickTrap}
			style={{
				position: "absolute",
				top: rowCount * geo.rowHeight + 10 + 'px',
				width: geo.labelWidth,
				height: 28,
				left: 0
			}}>
			<span className="icon icon-plus" style={{margin: 0}}/>
			</span>
			: null
			}
		</div>
	}
})



export default TabularTBody
