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

var VISIBLE_ROWS = 50

var TabularTBody = React.createClass ({

	shouldComponentUpdate: function () {
		return false
	},

	_onChange: function () {
		this.forceUpdate()
	},

	componentWillMount: function () {
		this.props.store.addChangeListener(this._onChange)
	},

	componentWillUnmount: function () {
		this.props.store.removeChangeListener(this._onChange)
	},

	getStyle: function () {
		var geometry = view.data.geometry
		return {
			top: 0 + 'px'
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
		var rowOffset = this.props.rowOffset
		var rows = _this.props.store ? _this.props.store.getObjects(
			rowOffset, rowOffset + VISIBLE_ROWS
		) : []
		var rowCount = _this.props.store ? _this.props.store.getRecordCount() : 0
		var geo = view.data.geometry
		var floatOffset = this.props.floatOffset

		var style = {
			top: (rowOffset * geo.rowHeight) + 'px',
			left: floatOffset + 'px',
			height: (VISIBLE_ROWS * geo.rowHeight) + 'px',
			width: (this.props.totalWidth) + 'px',
			position: 'absolute'
		}

		// console.log('render tbody')

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
							row = {i}
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
