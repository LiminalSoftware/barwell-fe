import React from "react"
import fieldTypes from "../../fields"
import _ from "underscore"
import modelActionCreators from "../../../../actions/modelActionCreators"
import ModelStore from "../../../../stores/ModelStore"
import ViewStore from "../../../../stores/ViewStore"
import AttributeStore from "../../../../stores/AttributeStore"
import FocusStore from "../../../../stores/FocusStore"
import ViewDataStores from "../../../../stores/ViewDataStores"
import storeFactory from 'flux-store-factory';
import dispatcher from '../../../../dispatcher/MetasheetDispatcher'
import createTabularStore from './TabularStore.jsx'
var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;

import TabularTR from './TabularTR'

import util from '../../../../util/util'

var TabularTBody = React.createClass ({
	shouldComponentUpdate: function () {
		return false
	},

	getInitialState: function () {
		var view = this.props.view
		var geo = view.data.geometry
		return {
			scrollTop: 0,
			window: {
				offset: 0,
				limit: 100,
				windowSize: 40
			}
		}
	},

	_onChange: function () {
		this.forceUpdate()
	},

	componentWillMount: function () {
		ViewStore.addChangeListener(this._onChange)
		AttributeStore.addChangeListener(this._onChange)
		ModelStore.addChangeListener(this._onChange)
		this.props.store.addChangeListener(this._onChange)
		this.fetch(true)
	},

	componentwillUnmount: function () {
		ViewStore.removeChangeListener(this._onChange)
		AttributeStore.removeChangeListener(this._onChange)
		ModelStore.removeChangeListener(this._onChange)
		this.props.store.removeChangeListener(this._onChange)
	},

	componentWillReceiveProps: function (newProps) {
		var oldProps = this.props;
		if (!_.isEqual(oldProps.sorting, newProps.sorting)) {
			this.fetch(true)
		}
	},

	fetch: function (force) {
		var window = this.state.window
		var view = this.props.view
		var geometry = view.data.geometry
		var rowOffset = Math.floor(this.props.scrollTop / geometry.rowHeight)
		var tgtOffset = Math.floor(rowOffset - (window.cursorLimit / 2) + (window.windowSize / 2))
		var boundedOffset = util.limit(0, this.props.nRows - window.cursorLimit, tgtOffset)
		var currentOffset = this.state.window.offset
		var mismatch = Math.abs(currentOffset - tgtOffset)

		if (!view.view_id) {
			return;
		}

		if (force || (mismatch > OFFSET_TOLERANCE && currentOffset !== boundedOffset)
			|| !_.isEqual(oldSort, view.data.sorting)) {

			modelActionCreators.fetchRecords(view, 0, 100, view.data.sorting)

			this.setState({
				fetching: true,
				sortSpec: view.data.sorting,
				window: {
					offset: boundedOffset,
					limit: this.state.window.limit
				}
			})
		}
	},

	getStyle: function () {
		var geometry = view.data.geometry
		return {
			top: (this.state.window.offset * (geometry.rowHeight + geometry.rowPadding) +
				geometry.headerHeight) + 'px',
			height: ((	(this.props.view.rows || 0) - this.state.window.offset) *
				(geometry.rowHeight + geometry.rowPadding)) + 'px'
		}
	},

	getOffset: function () {
		if (!this.isMounted()) return
		var tbody = React.findDOMNode(this.refs.tbody)
		var offset = tbody.offsetTop
		return offset
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
		var _this = this
		var view = this.props.view
		var model = this.props.model
		var pk = model._pk
		var rows = _this.props.store ? _this.props.store.getObjects() : []
		var rowCount = _this.props.store ? _this.props.store.getRecordCount() : 0
		var geometry = view.data.geometry

		var style = {
			top: 0,
			left: 0,
			height: (rowCount * geometry.rowHeight) + 'px',
			width: this.props.totalWidth + 'px',
			position: 'absolute'
		}

		return <div className = "tabular-tbody"
				ref = "tbody"
				style = {style}
				onMouseDown = {_this.props.clicker}
				// onContextMenu={_this.props.openContextMenu}
				onDoubleClick = {_this.props.editCell}>
				{
					rows.map(function (obj, i) {
						var rowKey = 'tr-' + (obj.cid || obj[pk])
						return <TabularTR  {..._this.props}
							selection = {_this.selection}
							obj={obj}
							rowKey = {rowKey}
							row = {i}
							ref = {rowKey}
							key = {rowKey}
							geometry = {geometry}
							handleBlur = {_this.props.handleBlur} />;
					})
				}
			</div>
	}
})


export default TabularTBody
