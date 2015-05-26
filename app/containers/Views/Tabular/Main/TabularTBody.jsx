import React from "react"
import bw from "barwell"
import fieldTypes from "./fields"
import _ from 'underscore'

var HEADER_HEIGHT = 35
var ROW_HEIGHT = 22
var CURSOR_LIMIT = 100
var WINDOW_SIZE = 30
var OFFSET_TOLERANCE = 30

var TabularTBody = React.createClass ({
	getInitialState: function () {
		return {
			window: {
				offset: 0,
				limit: CURSOR_LIMIT
			},
			fetching: false
		}
	},
	shouldComponentUpdate: function (nextProps, nextState) {
		var oldProps = this.props
		var oldState = this.state
		var oldView = oldProps.view.synget(bw.DEF.VIEW_DATA)
		var newView = nextProps.view.synget(bw.DEF.VIEW_DATA)
		return !(
			nextState.window.offset === oldState.window.offset && 
			_.isEqual(oldView, newView)
		)
	},
	componentWillMount: function () {
		var model = this.props.model
		var cursor = model.store.getCursor()
		this.setState({cursor: cursor})
		// cursor.on('fetch', this.handleFetch)
	},
	componentDidMount: function () {
		var cursor = this.state.cursor
		cursor.on('fetch', this.handleFetch)
		this.fetch(true)
	},
	componentWillReceiveProps: function (newProps) {
		var model = newProps.model
		if (newProps.model !== this.props.model) {
			// free old cursor
			this.state.cursor.release()
			this.state.cursor.removeListener('fetch', this.handleFetch)
			// set new cursor
			this.setState({cursor: model.store.getCursor()})
			this.state.cursor.on('fetch', this.handleFetch)
			this.fetch(true)
		}
	},
	componentWillUnmount: function () {
		this.state.cursor.release()
		this.state.cursor.removeListener('fetch', this.handleFetch)
	},
	handleFetch: function () {
		console.log('handle fetch')
		this.forceUpdate()
	},
	fetch: function (force) {
		var rowOffset = Math.floor(this.props.scrollTop / ROW_HEIGHT)
		var tgtOffset = Math.floor(rowOffset - (CURSOR_LIMIT / 2) + (WINDOW_SIZE / 2))
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
			return this.state.cursor.fetch(
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
		var cursor = this.state.cursor
		var columns = this.props.columns
		var clicker = this.props.clicker
		
		for (var i = window.offset; i < window.offset + window.limit; i++) {
			var obj = cursor.at(i)
			var els = columns.map(function (col, idx) {
				var field = fieldTypes[col.type]
				if (!field) field = fieldTypes["Text"]

				return React.createElement(field, {
					attribute: col, 
					value: (!!obj) ? obj.attributes[col.id] : "", 
					clicker: clicker, 
					key: 'cell-' + i + '-' + col.id, 
					style: {minWidth: col.width, maxWidth: col.width}
				})
			})
			rows.push(<tr key={i}>{els}</tr>)
		}
		return <tbody ref="tbody" style={this.getStyle()}>
			{rows}
		</tbody>
	}
})

export default TabularTBody