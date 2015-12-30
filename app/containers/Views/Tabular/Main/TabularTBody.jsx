import React from "react"
import fieldTypes from "../../fields"
import _ from "underscore"

import ViewStore from "../../../../stores/ViewStore"
import modelActionCreators from "../../../../actions/modelActionCreators"

import TabularTR from './TabularTR'

import util from '../../../../util/util'

var VISIBLE_ROWS = 40
var MAX_SKIP = 1
var CYCLE = 40

var TabularTBody = React.createClass ({

	getInitialState: function () {
		return {
			offset: 0,
			length: VISIBLE_ROWS
		}
	},

	componentWillReceiveProps: function (next) {
		this.updateOffset(next.rowOffset || 0)
	},

	componentDidUpdate: function (prevProps) {
		var now = new Date().getTime()
		this._lastUpdate = new Date().getTime()
		if (this.state.offset !== this.props.rowOffset)
			this.updateOffset(this.props.rowOffset)
		if (this._timer) window.clearTimeout(this._timer)
		this._timer = window.setTimeout(this._onChange, this._lastUpdate - now)
	},

	updateOffset: function (target) {
		target = Math.max(target - 5, 0)
		var current = this.state.offset
		var delta = (target - current)
		var magnitude = Math.abs(delta)
		var direction = Math.sign(delta)
		var setpoint = current + (Math.min(magnitude, MAX_SKIP) * direction)
		if (setpoint !== current) this.setState({offset: setpoint})
	},

	shouldComponentUpdate: function () {
		var now = new Date().getTime()
		return (now - this._lastUpdate > CYCLE);
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

	getStyle: function () {
		var geometry = view.data.geometry
		return {
			top: 0 + 'px'
		}
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

	render: function () {
		// console.log('render tbody')
		var _this = this
		var view = this.props.view
		var model = this.props.model
		var pk = model._pk
		var offset = this.state.offset
		var length = this.state.length
		var rows = _this.props.store ? _this.props.store.getObjects(
			offset, offset + length
		) : []
		var rowCount = _this.props.store ? _this.props.store.getRecordCount() : 0
		var geo = view.data.geometry
		var floatOffset = this.props.floatOffset

		var style = {
			top: 0,
			left: floatOffset + 'px',
			height: (rowCount * geo.rowHeight) + 'px',
			width: (this.props.totalWidth) + 'px',
			position: 'absolute'
		}

		return <div
				className = {"tabular-tbody "}
				onPaste = {this.props._handlePaste}
				ref = "tbody"
				style = {style}
				onContextMenu = {_this.props._handleContextMenu}>

				{
					rows.map(function (obj, i) {
						var rowKey = 'tr-' + (obj.cid || obj[pk])
						return <TabularTR  {..._this.props}
							selection = {_this.selection}
							obj = {obj}
							rowKey = {rowKey}
							row = {i + offset}
							ref = {rowKey}
							key = {rowKey}
							geometry = {geo}
							handlePaste = {_this.props._handlePaste}
							handleBlur = {_this.props._handleBlur} />;
					})
				}
			</div>
	}
})


export default TabularTBody
