import React from "react"
import _ from "underscore"
import $ from 'jquery'

import fieldTypes from "../../fields"
import modelActionCreators from "../../../../actions/modelActionCreators"

import ModelStore from "../../../../stores/ModelStore"
import ViewStore from "../../../../stores/ViewStore"
import FocusStore from "../../../../stores/FocusStore"
import AttributeStore from "../../../../stores/AttributeStore"

import ViewDataStores from "../../../../stores/ViewDataStores"
import dispatcher from '../../../../dispatcher/MetasheetDispatcher'


import createCubeStore from './CubeStore.jsx'

var CubeTBody = React.createClass ({

	shouldComponentUpdate: function (props, state) {
		var old = this.props
		return props.vStart !== old.vStart ||
			   props.hStart !== old.hStart
	},

	getInitialState: function () {
		var view = this.props.view
		var geo = view.data.geometry
		return {
			actRowHt: geo.rowHeight + geo.rowPadding,
			scrollTop: 0,
			window: {
				hOffset: 0,
				vOffset: 0,
				hLimit: 100,
				vLimit: 20,
				windowSize: 40
			}
		}
	},

	_onChange: function () {
		this.fetch()
		this.forceUpdate()
	},

	componentWillMount: function () {
		var view = this.props.view
		var model = ModelStore.get(view.model_id)
		this.props.store.addChangeListener(this._onChange)
	},

	componentDidMount: function () {
		this.fetch(true)
	},

	componentWillUnmount: function () {
		this.props.store.removeChangeListener(this._onChange)
	},

	render: function () {
		var _this = this
		var model = this.props.model
		var view = this.props.view
		var store = this.props.store
		var geo = view.data.geometry
		var actRowHt = geo.rowHeight + 'px'
		var width = geo.columnWidth + geo.widthPadding
		var vStart = this.props.vStart
		var hStart = this.props.hStart
		var levels = store.getLevels('rows', vStart, vStart + geo.renderBufferRows)
		var element = (fieldTypes[attribute.type] || fieldTypes.TEXT).element

		return <div ref = "cube-tbody"
			className = "cube-main-tbody"
			onMouseDown = {_this.props.clicker}
			onContextMenu={_this.props.openContextMenu}
			onDoubleClick = {_this.editCell}>

		} </div>;
	},

	fetch: function (force) {
		if (!this.props.store.isLevelCurrent()) return

		var view = this.props.view
		var geo = view.data.geometry
		var store = this.props.store
		var vStart = this.props.vStart
		var vEnd = vStart + geo.renderBufferRows
		var hStart = this.props.hStart
		var hEnd = hStart + geo.renderBufferCols
		var filter = []

		var curVStart = store.getStart('rows')
		var curHStart = store.getStart('columns')

		if (Math.abs(curVStart - vStart) < geo.bfrTol &&
			Math.abs(curHStart - hStart) < geo.bfrTol &&
			curVStart !== null && curHStart  !== null) {
			return; // if scroll is within tolerances, do nothing
		}

		var makeFilterStr = function (agg, dimension, pos, invert) {
			var obj = store.getLevel(dimension, pos)

			var val = (obj !== null) ? obj['a' + agg] : null
			var dir = !!(view.data.sorting[agg])
			if (invert) dir = !dir
			if (val) filter.push(
				'a' + agg + '=' + (dir ? 'gte.' : 'lte.')  + val
			)
		}

		// the current filter only uses the highest-level aggregator
		// going deeper would require "or" conditions in the request or multiple requests
		makeFilterStr(view.column_aggregates[0], 'columns', hStart, false)
		makeFilterStr(view.column_aggregates[0], 'columns', hEnd, true)
		makeFilterStr(view.row_aggregates[0], 'rows', vStart, false)
		makeFilterStr(view.row_aggregates[0], 'rows', vEnd, true)

		modelActionCreators.fetchCubeValues(view, filter, hStart, vStart)
		store.setStart('rows', vStart)
		store.setStart('columns', hStart)
	}
})

// export default CubeTBody
//
// var CubeTR = React.createClass({
//
// 	render: function () {
// 		var _this = this
// 		var model = this.props.model
// 		var view = this.props.view
// 		var store = this.props.store
// 		var geo = view.data.geometry
// 		var width = geo.columnWidth
// 		var rowHeight = geo.rowHeight + 'px'
// 		var rowLevel = this.props.rowLevel
// 		var attribute = AttributeStore.get(view.value)
// 		var element = (fieldTypes[attribute.type] || fieldTypes.TEXT).element
// 		var actRowHt = this.props.actRowHt
//
// 		var hLength = geo.renderBufferCols
// 		var hStart = this.props.hStart
//
//
// 		return <div> { store.getLevels('rows', vStart, vLength + vStart).map(function (rowLevel, i) {
// 			store.getLevels('columns', hStart, hLength + hStart).map(function (colLevel, j) {
//
// 				var cellKey = 'cell-' + i + '-' + j
// 				var obj = store.getValues(rowLevel, colLevel)
// 				if (!obj) return null
// 				var count = present ? obj._count : 0
// 				var value = present ? obj['a' + attribute.attribute_id] : null
// 				var selector = _.omit(_.extend({}, rowLevel, colLevel),'spans')
//
// 				var tdStyle = {
// 					minWidth: width + 'px',
// 					maxWidth: width + 'px',
// 					height: geo.rowHeight + 'px',
// 					maxHeight: (geo.rowHeight) + 'px',
// 					minHeight: (geo.rowHeight) + 'px',
// 					left: ((j + view.row_aggregates.length + hStart) * width) + 'px',
// 					top: ((view.column_aggregates.length + vStart + i) * geo.rowHeight) + 'px'
// 				}
//
// 				return React.createElement(element, {
// 					config: {},
// 					model: _this.props.model,
// 					view: _this.props.view,
// 					selector: selector,
// 					value: value,
// 					column_id: ('a' + attribute.attribute_id),
// 					handleBlur: _this.props.handleBlur,
// 					key: cellKey,
// 					cellKey: cellKey,
// 					ref: cellKey,
// 					className: "table-cell " + (present ? "present" : "empty") +
// 						(count > 1 ? " uneditable " : ""),
// 					style: tdStyle
// 				})
// 			})}
// 				</div>
// 	}
// })
