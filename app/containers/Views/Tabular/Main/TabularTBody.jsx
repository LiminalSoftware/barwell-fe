import React from "react"
import fieldTypes from "../../fields"
import _ from "underscore"

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

	shouldComponentUpdate: function (next) {
		var old = this.props
		return !(
			next.scrollTop === old.scrollTop && 
			_.isEqual(old.columns, next.columns) &&
			_.isEqual(old.sorting, next.sort)
		)
	},

	componentWillMount: function () {
		
	},
	
	componentDidMount: function () {
		
	},

	componentWillReceiveProps: function (newProps) {

	},

	componentWillUnmount: function () {

	},

	handleFetch: function () {
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
		}
	},

	getStyle: function () {
		return {
			top: (this.state.window.offset * (ROW_HEIGHT) + HEADER_HEIGHT) + 'px',
			height: (((	(this.props.view.rows || 0) - this.state.window.offset) * ROW_HEIGHT)) + 'px'
		}
	},

	getValueAt: function (row, col) {
		// return this.cursor.at(row)
		return null
	},

	render: function () {
		var rows = []
		var window = this.state.window
		var model = this.props.model
		var view = this.props.view
		var columns = this.props.columns
		var clicker = this.props.clicker
		var dblClicker = this.props.dblClicker
		//var pk = model.primary_key_attribute_id

		rows = (view.records || []).map(function (obj, i) {
			var rowKey = 'tabular-' +  i //(!!pk && !!obj ? obj.synget(pk) : i)
			var els = columns.map(function (col, idx) {
				var element = (fieldTypes[col.type] || fieldTypes.Text).element
				var cellKey = rowKey + '-' + col.id
				var value = (!!obj) ? obj.attributes[col.id] : ""

				return React.createElement(element, {
					config: col,
					object: obj,
					value: value,
					key: cellKey,
					style: {minWidth: col.width, maxWidth: col.width}
				})
			})
			return <tr id={rowKey} key={rowKey}>{els}</tr>
		})
		return <tbody ref="tbody" style={this.getStyle()} onClick={clicker} onDoubleClick={dblClicker}>
			{rows}
		</tbody>
	}
})

export default TabularTBody