import React from "react"
import fieldTypes from "../../fields"
import _ from "underscore"
import $ from 'jquery'

import modelActionCreators from "../../../../actions/modelActionCreators"

import ModelStore from "../../../../stores/ModelStore"
import ViewStore from "../../../../stores/ViewStore"
import FocusStore from "../../../../stores/FocusStore"

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
		var actRowHt = this.props.actRowHt + geo.rowPadding
		var width = geo.columnWidth + geo.widthPadding
		var vStart = this.props.vStart
		var hStart = this.props.hStart

		var style = {
			top: ((view.column_aggregates.length + vStart) * actRowHt) + 'px',
			left: (width * (view.row_aggregates.length + hStart) + geo.leftGutter) + 'px'
		}

		return <tbody ref = "tbody"
			className = "cube-main-tbody"
			onClick = {_this.props.clicker}
			style = {style}
			onDoubleClick = {_this.editCell}>
			{
				store.getLevels('rows', vStart, vStart + geo.renderBufferRows).map(function (rowLevel, i) {
					var rowKey = 'cell-' + (vStart + i)
					return <CubeTR
						{..._this.props}
						hStart = {hStart}
						rowLevel = {rowLevel}
						key = {rowKey}
						rowKey = {rowKey} />
				})
			}
		</tbody>;
	},

	fetch: function (force) {
		console.log('A')
		if (!this.props.store.isLevelCurrent()) return
		console.log('B')

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
			console.log('dont fetch')
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

		console.log(filter)

		modelActionCreators.fetchCubeValues(view, filter, hStart, vStart)
		store.setStart('rows', vStart)
		store.setStart('columns', hStart)
	}
})

export default CubeTBody

var CubeTR = React.createClass({

	render: function () {
		var _this = this
		var model = this.props.model
		var view = this.props.view
		var store = this.props.store
		var geo = view.data.geometry
		var width = geo.columnWidth + 'px'
		var rowHeight = geo.rowHeight + 'px'
		var rowLevel = this.props.rowLevel
		// this.props.actRowHt + 'px'

		var hLength = geo.renderBufferCols
		var hStart = this.props.hStart

		var tdStyle = {
			minWidth: width,
			maxWidth: width,
			height: rowHeight
		}

		return <tr> {store.getLevels('columns', hStart, hLength + hStart).map(function (colLevel, j) {
			var key = _this.props.rowKey + '-' + (hStart + j)

			var obj = store.getValues(rowLevel, colLevel)
			var present = !!obj
			var count = present ? obj._count : 0
			var value = present ? obj[view.aggregator] : null

			return <td
				key = {key}
				className = {
					(present ? "present" : "empty") +
					(count > 1 ? " uneditable" : "")
				}
				id = {key}
				style = {tdStyle}>
			 	{ value }
			</td>
		})} </tr>
	}
})
