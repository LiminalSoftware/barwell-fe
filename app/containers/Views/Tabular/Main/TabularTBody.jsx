import React from "react"
import bw from "barwell"
import fieldTypes from "./fields"
import _ from 'underscore'

var HEADER_HEIGHT = 35
var ROW_HEIGHT = 22
var CURSOR_LIMIT = 60
var WINDOW_SIZE = 40
var OFFSET_TOLERANCE = 5

var limit = function (min, max, value) {
	if (value < min) return min
	if (value > max) return max
	else return value
}

var TabularTBody = React.createClass ({
	getInitialState: function () {
		return {
			scrollTop: 0,
			fetching: false,
			window: {
				offset: 0,
				limit: CURSOR_LIMIT
			}
		}
	},
	shouldComponentUpdate: function (nextProps, nextState) {
		var oldProps = this.props
		var oldState = this.state
		var oldCols = oldProps.columns
		var newCols = nextProps.columns
		var oldSort = oldProps.sorting
		var newSort = nextProps.sorting

		return !(
			nextProps.scrollTop === oldProps.scrollTop && 
			_.isEqual(oldCols, newCols) &&
			_.isEqual(oldSort, newSort)
		)
	},
	getCursor: function () {
		var model = this.props.model
		var sorting = this.props.sorting
		this.cursor = model.store.getCursor({sort: sorting})
	},
	componentWillMount: function () {
		var model = this.props.model
		this.cursor = model.store.getCursor()
	},
	componentDidMount: function () {
		var cursor = this.cursor
		cursor.on('fetch', this.handleFetch)
		cursor.on('update', this.handleFetch)
		this.fetch(true)
	},
	componentWillReceiveProps: function (newProps) {
		var newModel = newProps.model
		if (newModel !== this.props.model) {
			// free old cursor
			this.cursor.removeListener('fetch', this.handleFetch)
			this.cursor.release()
			// set new cursor
			this.cursor = newModel.store.getCursor()
			this.cursor.on('fetch', this.handleFetch)
			this.fetch(true)
		} else if (newProps.scrollTop !== this.props.scrollTop) {
			this.fetch()
		}
	},
	componentWillUnmount: function () {
		this.cursor.release()
		this.cursor.removeListener('fetch', this.handleFetch)
		this.cursor.removeListener('update', this.handleFetch)
	},
	handleFetch: function () {
		var cursor = this.cursor
		this.setState({fetching: false})
		this.forceUpdate()
	},
	fetch: function (force) {
		var rowOffset = Math.floor(this.props.scrollTop / ROW_HEIGHT)
		var tgtOffset = Math.floor(rowOffset - (CURSOR_LIMIT / 2) + (WINDOW_SIZE / 2)) 
		var boundedOffset = limit(0, this.props.nRows - CURSOR_LIMIT, tgtOffset)
		var currentOffset = this.state.window.offset
		var mismatch = Math.abs(currentOffset - tgtOffset)

		// console.log('rowOffset: '+ rowOffset + '; tgtOffset: '+ tgtOffset + '; mismatch: '+ mismatch)

		if (force || (mismatch > OFFSET_TOLERANCE && currentOffset !== boundedOffset)) {
			this.setState({
				fetching: true,
				window: {
					offset: boundedOffset,
					limit: CURSOR_LIMIT
				}
			})
			this.cursor.fetch(
				boundedOffset,
				CURSOR_LIMIT
			)
		}
	},
	getStyle: function () {
		return {
			top: (this.state.window.offset * (ROW_HEIGHT) + HEADER_HEIGHT) + 'px',
			height: (((	(this.cursor.store.objCount || 0) - this.state.window.offset) * ROW_HEIGHT) + HEADER_HEIGHT) + 'px'
		}
	},
	render: function () {
		var rows = []
		var window = this.state.window
		var cursor = this.cursor
		var columns = this.props.columns
		var clicker = this.props.clicker
		var pk = this.props.model.synget('Primary key')

		rows = this.cursor.map(function (obj, i) {
			var rowKey = 'tabular-' +  i //(!!pk && !!obj ? obj.synget(pk) : i)
			var els = columns.map(function (col, idx) {
				var field = fieldTypes[col.type]
				var cellKey = rowKey + '-' + col.id
				var value = (!!obj) ? obj.attributes[col.id] : ""
				// YIKES! hopefully I won't need this someday
				if (!field) field = fieldTypes.Text

				return React.createElement(field, {
					attribute: col,
					value: value, 
					clicker: clicker,
					key: cellKey,
					style: {minWidth: col.width, maxWidth: col.width}
				})
			})
			return <tr id={rowKey} key={rowKey}>{els}</tr>
		})
		return <tbody ref="tbody" style={this.getStyle()}>
			{rows}
		</tbody>
	}
})

export default TabularTBody