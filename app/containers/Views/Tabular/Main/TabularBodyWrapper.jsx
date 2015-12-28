import React from "react"
import fieldTypes from "../../fields"
import _ from "underscore"

import modelActionCreators from "../../../../actions/modelActionCreators"
import ViewStore from "../../../../stores/ViewStore"
import FocusStore from "../../../../stores/FocusStore"
import ViewDataStores from "../../../../stores/ViewDataStores"

import storeFactory from 'flux-store-factory';
import dispatcher from '../../../../dispatcher/MetasheetDispatcher'
import createTabularStore from './TabularStore.jsx'


import util from '../../../../util/util'

var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;

var OFFSET_TOLERANCE = 30
var WINDOW_ROWS = 30
var FETCH_DEBOUNCE = 800
var MAX_ROWS = 50
var _lastCall = 0
var _timerSet = false

import TabularTBody from "./TabularTBody"
import FakeLines from "./FakeLines"

var TabularBodyWrapper = React.createClass ({

	getInitialState: function () {
		var view = this.props.view
		var geo = view.data.geometry
		return {
			offset: 0
		}
	},

	_onChange: function () {
		this.forceUpdate()
		this.refs.tbody.forceUpdate()
		this.refs.rhsTableBody.forceUpdate()
	},

	componentWillMount: function () {
		ViewStore.addChangeListener(this._onChange)
		this.props.store.addChangeListener(this._onChange)
		this.fetch(true)
	},

	componentWillUnmount: function () {
		ViewStore.removeChangeListener(this._onChange)
		this.props.store.removeChangeListener(this._onChange)
	},

	componentWillReceiveProps: function (newProps) {
		var oldProps = this.props;
		this.fetch()
	},

	fetch: function (force) {
		var now = new Date().getTime()
		var timeSinceUpdt = (now - _lastCall)
		var limit = this.state.limit
		var view = this.props.view
		var geometry = view.data.geometry
		var rowOffset = this.props.rowOffset
		var tgtOffset = (rowOffset - (MAX_ROWS - WINDOW_ROWS) / 2)
		var boundedOffset = util.limit(0, this.props.nRows - MAX_ROWS, tgtOffset)
		var currentOffset = this.state.offset
		var mismatch = Math.abs(currentOffset - tgtOffset)

		if (!view.view_id) return;
		if (timeSinceUpdt < FETCH_DEBOUNCE && !this._timer) _this.timer =
			window.setTimeout((FETCH_DEBOUNCE - timeSinceUpdt),
			this.fetch
		)
		if (timeSinceUpdt < FETCH_DEBOUNCE) return

		if (force || (mismatch > OFFSET_TOLERANCE && currentOffset !== boundedOffset)
			// or sort order has changed
			) {

			console.log('**** FETCH ***** tgtOffset: ' + tgtOffset)
			modelActionCreators.fetchRecords(
				view,
				boundedOffset,
				boundedOffset + MAX_ROWS,
				view.data.sorting
			)
			if (this._timer) clearTimeout(this._timer)
			this._timer = null

			this.setState({
				fetching: true,
				offset: boundedOffset
			})
		}
	},

	handleAddRecord: function (event) {
		this.props._addRecord()
		event.nativeEvent.stopPropagation()
		event.stopPropagation()
	},

	render: function () {
		var view = this.props.view
		var model = this.props.model
		var store = this.props.store
		var rowCount = store.getRecordCount()
		var geo = view.data.geometry
		var focused = this.props.focused
		var rowOffset = this.props.rowOffset

		var wrapperStyle = {
			marginTop: (-1* this.props.rowOffset * geo.rowHeight) + 'px',
			// top: ((-1* this.props.rowOffset * geo.rowHeight) + geo.headerHeight + geo.topGutter) + 'px',
			top: geo.headerHeight + 'px',
			bottom: 0,
			left: (geo.leftGutter) + 'px',
			width: this.props.totalWidth + 'px',
			position: 'absolute',
		}

		var newRowBarStyle = {
			top: rowCount * geo.rowHeight + 'px',
			left: 0,
			height: (geo.rowHeight  + 'px'),
			width: (this.props.totalWidth - 1) + 'px'
		}

		return <div
			className = {"tabular-body-wrapper " + (focused ? "focused" : "blurred")}
			ref="tbodyWrapper"
			style={wrapperStyle}>

			<TabularTBody
				{...this.props}
				floatOffset = {0}
				ref="tbody"
				columns = {this.props.fixedColumns}/>

			<TabularTBody
				{...this.props}
				floatOffset = {this.props.floatOffset}
				ref = "rhsTableBody"
				columns = {this.props.visibleColumns}/>

			{this.props.children}
			<div style = {newRowBarStyle}
				className = "table-cell add-new-row">
				<div className = "table-cell-inner"
					onMouseDown = {this.handleAddRecord}>
					+ Add a new row of data
				</div>
			</div>
		</div>;
	}
});


export default TabularBodyWrapper
