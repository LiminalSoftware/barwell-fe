import React from "react"
import fieldTypes from "../../fields"
import _ from "underscore"

import ViewStore from "../../../../stores/ViewStore"
import modelActionCreators from "../../../../actions/modelActionCreators"

import TabularTR from './TabularTR'

import util from '../../../../util/util'

var VISIBLE_ROWS = 50
var MAX_SKIP = 3
var CYCLE = 25
var LONG_CYCLE = 250
var BACKWARD_BUFFER = 10

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
		var _this = this
		var now = new Date().getTime()
		var target = Math.max(this.props.rowOffset - BACKWARD_BUFFER, 0)
		// we just updated so set the _lastUpdate time to now
		this._lastUpdate = now
		// we shouldn't have a timer set, but if we do clear it
		if (this.__timer) clearTimeout(this.__timer)
		// if we haven't reached home yet, set a timer for next frame

		if (this.state.offset !== target ) {
			this.__timer = setTimeout(function() {
				_this.updateOffset(target)
			}, CYCLE)
		}
	},

	updateOffset: function (target) {
		var current = this.state.offset
		var delta = (target - current)
		var magnitude = Math.abs(delta)
		var direction = Math.sign(delta)
		var setpoint = current + (Math.min(magnitude, MAX_SKIP) * direction)
		this.setState({offset: setpoint})
	},

	shouldComponentUpdate: function (nextProps, nextState) {
		var now = new Date().getTime()
		return (nextProps.rowOffset !== this.state.offset &&
			now - this._lastUpdate >= CYCLE);
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

	createRow: function (obj, index) {
		var view = this.props.view
		var geo = view.data.geometry
		var model = this.props.model
		var pk = model._pk
		var rowKey = this.props.prefix + '-tr-' + (obj.cid || obj[pk])
		var offset = this.state.offset

		return <TabularTR  {...this.props}
			obj = {obj}
			rowKey = {rowKey}
			row = {index + offset}
			ref = {rowKey}
			key = {rowKey}
			geometry = {geo}
			handlePaste = {this.props._handlePaste}
			handleBlur = {this.props._handleBlur} />;
	},

	render: function () {
		var view = this.props.view
		var model = this.props.model
		var pk = model._pk
		var offset = this.state.offset
		var length = this.state.length
		var rows = this.props.store ? this.props.store.getObjects(
			offset, offset + length
		) : []
		var rowCount = this.props.store ? this.props.store.getRecordCount() : 0
		var geo = view.data.geometry
		var floatOffset = this.props.floatOffset

		return <div
				className = {"tabular-tbody "}
				onPaste = {this.props._handlePaste}
				ref = "tbody"
				style = {this.props.style}
				onContextMenu = {this.props._handleContextMenu}>

				{ rows.map(this.createRow) }
			</div>
	}
})


export default TabularTBody
