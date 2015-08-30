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

		if (this.cubeStore) {
			this.cubeStore.addChangeListener(this._onChange)
		}
	},

	componentDidMount: function () {
		this.fetch(true)
	},

	componentWillUnmount: function () {
		if (!this.store) return;
		this.store.removeChangeListener(this._onChange)
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
			onClick = {_this.onClick}
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
		if (!store.isLevelCurrent()) return

		var view = this.props.view
		var geo = view.data.geometry
		var store = this.props.store
		var vStart = this.props.vStart
		var vEnd = vStart + geo.renderBufferRows
		var hStart = this.props.hStart
		var hEnd = hStart + geo.renderBufferCols
		var filter = []

		var curVStart = store.getStart

		// if (!store.isCurrent()) return;

		var makeFilterStr = function (agg, dimension, pos) {
			var obj = store.getLevel(dimension, pos)
			var val = obj ? obj['a' + agg] : null
			var dir = !!(view.data.sorting[agg])
			if (val) filter.push(
				'a' + agg + '=' + (dir ? 'gt.' : 'lt.')  + val
			)
		}

		// the current filter only uses the highest-level aggregator
		// going deeper would require "or" conditions in the request or multiple requests
		makeFilterStr(view.column_aggregates[0], 'columns', hStart)
		makeFilterStr(view.column_aggregates[0], 'columns', hEnd)
		makeFilterStr(view.row_aggregates[0], 'rows', vStart)
		makeFilterStr(view.row_aggregates[0], 'rows', vEnd)

		// modelActionCreators.fetchCubeValues(view, filter, hStart, vStart)
		console.log(filter)

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
		var trStyle = {
			height: rowHeight
			// height: rowHeight,
		}


		return <tr style = {trStyle}> {store.getLevels('columns', hStart, hLength + hStart).map(function (colLevel, j) {
			var key = _this.props.rowKey + '-' + (hStart + j)
			var value = store.getValues(rowLevel, colLevel)
			if (value) value = value[view.aggregator.toLowerCase()]


			// {_this.props.rowKey + '-' +  (j + hStart)}
			return <td 
				key = {key}
				className = {value == null ? "empty" : "present"}
				id = {key}
				style = {tdStyle}>
			 	{ value }
			</td>
		})} </tr>	
	}
})