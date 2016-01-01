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

var OFFSET_TOLERANCE = 100
var WINDOW_ROWS = 50
var FETCH_DEBOUNCE = 800
var MAX_ROWS = 500

import TabularTBody from "./TabularTBody"
import FakeLines from "./FakeLines"

var TabularBodyWrapper = React.createClass ({

	_lastFetch: 0,
	_lastPaint: 0,

	getInitialState: function () {
		var view = this.props.view
		var geo = view.data.geometry
		return {
			offset: 0
		}
	},

	_onChange: function () {
		this.forceUpdate()
		this.refs.lhs.forceUpdate()
		this.refs.rhs.forceUpdate()
	},

	componentWillMount: function () {
		ViewStore.addChangeListener(this._onChange)
		this.props.store.addChangeListener(this._onChange)
		this.debounceFetch = _.debounce(this.fetch, FETCH_DEBOUNCE)
		this.fetch(true)
	},

	componentWillUnmount: function () {
		ViewStore.removeChangeListener(this._onChange)
		this.props.store.removeChangeListener(this._onChange)
	},

	fetch: function (force) {
		var view = this.props.view
		var offset = this.props.rowOffset
		var target = (offset - (MAX_ROWS - WINDOW_ROWS) / 2)
		var boundedOffset = util.limit(0, this.props.nRows - MAX_ROWS, target)
		var delta = Math.abs(offset - target)

		if (force || (delta > OFFSET_TOLERANCE && offset !== boundedOffset)
			// or sort order has changed
			) {
			modelActionCreators.fetchRecords(
				view,
				boundedOffset,
				boundedOffset + MAX_ROWS,
				null //view.data.sorting
			)
			this.setState({
				fetching: true,
			})
		}
	},

	handleAddRecord: function (event) {
		this.props._addRecord()
		event.nativeEvent.stopPropagation()
		event.stopPropagation()
	},

	render: function () {
		// console.log('render tbodywrapper: ' + this.id)
		var view = this.props.view
		var model = this.props.model
		var store = this.props.store
		var rowCount = store.getRecordCount()
		var geo = view.data.geometry
		var focused = this.props.focused

		var rowOffset = this.props.rowOffset
		var colOffset = this.props.hiddenColWidth

		var marginTop = (-1* this.props.rowOffset * geo.rowHeight)
		var fixedWidth = util.sum(this.props.fixedColumns, 'width')
		var floatWidth = util.sum(this.props.visibleColumns, 'width')

		var newRowBarStyle = {
			top: rowCount * geo.rowHeight + 'px',
			left: 0,
			height: (geo.rowHeight  + 'px'),
			width: (fixedWidth + floatWidth - 1) + 'px'
		}

		return <div
			className = {"tabular-body-wrapper " + (focused ? "focused" : "blurred")}
			ref="tbodyWrapper"
			style = {{
				left: 0,
				top: 0,
				bottom: 0,
				width: (fixedWidth + floatWidth + 2) + 'px'
			}}>

			<FakeLines
				totalWidth = {this.props.totalWidth}
				rowCount = {rowCount}
				{...this.props}/>

			<div
				className = "inner-wrapper lhs-wrapper"
				style = {{
					left: geo.leftGutter + 'px',
					top: geo.headerHeight + 'px',
					marginTop: marginTop + 'px',
					bottom: 0,
					width: fixedWidth + 'px',
				}}>
			{this.props.children}
			<div style = {newRowBarStyle}
				className = "table-cell add-new-row">
				<div className = "table-cell-inner"
					onMouseDown = {this.handleAddRecord}>
					+ Add a new row of data
				</div>
			</div>
			<TabularTBody
				{...this.props}
				style = {{
					left: 0,
					marginLeft: 0,
					top: 0,
					width:  view.data.fixedWidth + 'px',
					height: (rowCount * geo.rowHeight) + 'px',
				}}
				ref="lhs"
				prefix = "lhs"
				columns = {this.props.fixedColumns}/>
			</div>

			<div
				className = "inner-wrapper rhs-wrapper"
				style = {{
					left: geo.leftGutter + fixedWidth + 'px',
					marginLeft: 0,
					top: geo.headerHeight + 'px',
					marginTop: marginTop + 'px',
					bottom: 0,
					width:  floatWidth + 'px',
				}}>
			<TabularTBody
				{...this.props}
				style = {{
					left: 0,
					marginLeft: (-1 * this.props.hiddenColWidth) + 'px',
					top: 0,
					width:  view.data.floatWidth + 'px',
					height: (rowCount * geo.rowHeight) + 'px',
				}}
				ref = "rhs"
				prefix = "rhs"
				columns = {this.props.visibleColumns}/>
			</div>



		</div>;
	}
});


export default TabularBodyWrapper
