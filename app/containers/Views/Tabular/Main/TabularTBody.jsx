import React from "react"
import bw from "barwell"
import fieldTypes from "./fields"
import _ from 'underscore'

var HEADER_HEIGHT = 35
var ROW_HEIGHT = 22
var CURSOR_LIMIT = 100
var WINDOW_SIZE = 30
var OFFSET_TOLERANCE = 35

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

		return !(
			nextProps.scrollTop === oldProps.scrollTop && 
			_.isEqual(oldCols, newCols)
		)
	},
	componentWillMount: function () {
		var model = this.props.model
		this.cursor = model.store.getCursor()
	},
	componentDidMount: function () {
		var cursor = this.cursor
		cursor.on('fetch', this.handleFetch)
		this.fetch(true)
	},
	componentWillReceiveProps: function (newProps) {
		var newModel = newProps.model
		if (newModel !== this.props.model) {
			console.log('newModel->Name: ' + newModel.synget('Name'))
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
	},
	handleFetch: function () {
		var cursor = this.cursor
		this.setState({fetching: false})
		this.forceUpdate()
	},
	fetch: function (force) {
		var rowOffset = Math.floor(this.props.scrollTop / ROW_HEIGHT)
		var tgtOffset = limit(0, this.props.nRows - CURSOR_LIMIT, Math.floor(rowOffset - (CURSOR_LIMIT / 2) + (WINDOW_SIZE / 2)) )
		var mismatch = Math.abs(rowOffset - tgtOffset)

		// console.log('rowOffset: '+ JSON.stringify(rowOffset, null, 2))
		// console.log('tgtOffset: '+ JSON.stringify(tgtOffset, null, 2))
		// console.log('mismatch: '+ JSON.stringify(mismatch, null, 2))

		if (force || (mismatch > OFFSET_TOLERANCE)) {
			this.setState({
				"fetching": true,
				"window": {
					offset: Math.max(tgtOffset, 0),
					limit: CURSOR_LIMIT
				}
			})
			return this.cursor.fetch(
				this.state.window.offset, 
				this.state.window.limit
			)
		}
	},
	getStyle: function () {
		return {
			top: (this.state.window.offset * (ROW_HEIGHT) + HEADER_HEIGHT) + 'px',
			height: '10000px' // TODO
		}
	},
	render: function () {
		var rows = []
		var window = this.state.window
		var cursor = this.cursor
		var columns = this.props.columns
		var clicker = this.props.clicker
		// var pk = this.props.model.synget('Primary key');y

		if (this.cursor) for (var i = window.offset; i < window.offset + window.limit; i++) {
			var obj = cursor.at(i)
			var rowKey = 'tabular-' +  i //(!!pk && !!obj ? obj.synget(pk) : i)

			var els = columns.map(function (col, idx) {
				var field = fieldTypes[col.type]
				var cellKey = rowKey + '-' + col.id
				var value = (!!obj) ? obj.attributes[col.id] : ""
				if (!field) field = fieldTypes["Text"]

				return React.createElement(field, {
					attribute: col,
					value: value, 
					clicker: clicker,
					key: cellKey,
					style: {minWidth: col.width, maxWidth: col.width}
				})
			})
			rows.push(<tr key={rowKey}>{els}</tr>)
		}
		return <tbody ref="tbody" style={this.getStyle()}>
			{rows}
		</tbody>
	}
})

export default TabularTBody