import React from "react"
import fieldTypes from "../../fields"
import _ from "underscore"
import $ from 'jquery'

import modelActionCreators from "../../../../actions/modelActionCreators"

import ModelStore from "../../../../stores/ModelStore"
import ViewStore from "../../../../stores/ViewStore"
import KeyStore from "../../../../stores/KeyStore"
import KeycompStore from "../../../../stores/KeycompStore"
import AttributeStore from "../../../../stores/AttributeStore"
import RelationStore from "../../../../stores/RelationStore"
import FocusStore from "../../../../stores/FocusStore"

import ViewDataStores from "../../../../stores/ViewDataStores"
import storeFactory from 'flux-store-factory';
import dispatcher from '../../../../dispatcher/MetasheetDispatcher'

import createTabularStore from './TabularStore.jsx'

var PureRenderMixin = require('react/addons').addons.PureRenderMixin;

global.$$ = $

var limit = function (min, max, value) {
	if (value < min) return min
	if (value > max) return max
	else return value
}

var TabularTBody = React.createClass ({
	mixins: [PureRenderMixin],

	getInitialState: function () {
		var view = this.props.view
		var geo = view.data.geometry
		return {
			actRowHt: (geo.rowHeight + geo.rowPadding),
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
		this.props.store.addChangeListener(this._onChange)
		this.fetch(true)
	},

	componentwillUnmount: function () {
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
		var boundedOffset = limit(0, this.props.nRows - window.cursorLimit, tgtOffset)
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

	getRowHeight: function () {
		if (!this.isMounted()) return
		var tbody = React.findDOMNode(this.refs.tabularTbody)
		var actRowHt = (tbody.scrollHeight / tbody.children.length)
		return actRowHt
	},

	getOffset: function () {
		if (!this.isMounted()) return
		var tbody = React.findDOMNode(this.refs.tabularTbody)
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
		var geometry = view.data.geometry
		var actRowHt = this.state.actRowHt
		// var height = (rows.length * this.state.rowHt) + 'px'
		var style = {
			top: geometry.headerHeight + 'px'
		}

		return <tbody
			ref = "tabularTbody"
			style = {style}
			onClick = {_this.props.clicker}
			onContextMenu={_this.props.openContextMenu}
			className = "tabular-tbody"
			onDoubleClick = {_this.props.editCell}>
			{
				rows.map(function (obj, i) {
					var rowKey = 'tr-' + (obj.cid || obj[pk])
					return <TabularTR  {..._this.props}
						obj={obj}
						rowKey = {rowKey}
						ref = {rowKey}
						key = {rowKey}
						geometry = {geometry}
						handleBlur = {_this.props.handleBlur} />;
				})
			}
			</tbody>;
	}
})

var TabularTR = React.createClass({
	shouldComponentUpdate: function (updt) {
		var old = this.props
		return !(
			_.isEqual(updt.obj, old.obj) &&
			updt.view == old.view &&
			updt.editing == old.editing
		)
	},

	render: function () {
		var _this = this
		var model = _this.props.model
		var rowKey = this.props.rowKey
		var obj = this.props.obj
		var geometry = this.props.geometry
		var style = {
			lineHeight: geometry.rowHeight + 'px',
			height: (geometry.rowHeight) + 'px',
			maxHeight: geometry.rowHeight + 'px',
			minHeight: geometry.rowHeight + 'px'
			// lineHeight: '0px'
		}
		var selector = {}
		selector[model._pk] = obj[model._pk]

		return <tr id={rowKey} style={style} className = {obj._dirty ? "dirty" : ""}>
			{_this.props.columns.map(function (col) {
				var element = (fieldTypes[col.type] || fieldTypes.TEXT).element
				var cellKey = rowKey + '-' + col.column_id
				
				return React.createElement(element, {
					config: col,
					model: _this.props.model,
					view: _this.props.view,
					selector: selector,
					value: obj[col.column_id],
					column_id: col.column_id,
					handleBlur: _this.props.handleBlur,
					key: cellKey,
					cellKey: cellKey,
					ref: cellKey,
					style: {
						minWidth: col.width,
						maxWidth: col.width,
						textAlign: col.align,
						height: (geometry.rowHeight) + 'px',
					}
				})
			})}
		</tr>
	}
})

export default TabularTBody
