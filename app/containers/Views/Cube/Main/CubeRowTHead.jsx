import React from "react"
import $ from "jquery"
import EventListener from 'react/lib/EventListener'
import _ from 'underscore'
import fieldTypes from "../../fields"
import modelActionCreators from "../../../../actions/modelActionCreators"
import FocusStore from "../../../../stores/FocusStore"
import consolidate from './consolidate'


var CubeRowTHead = React.createClass ({

	getCalibration: function () {
		if (!this.isMounted()) return;
		
		return ($(React.findDOMNode(this.refs.rowhead)).get(0).scrollHeight / 
				$(React.findDOMNode(this.refs.rowhead)).children().length)
	},

	render: function () {
		var _this = this
		var view = this.props.view
		var geo = view.data.geometry
		var rowHeight = geo.rowHeight + 'px'
		var actRowHt = this.props.actRowHt + geo.rowPadding

		var vStart = this.props.vStart
		var hStart = this.props.hStart

		var store = this.props.store
		var levels = store.getLevels('rows', vStart, vStart + geo.renderBufferRows)
		levels = consolidate(levels, view.row_aggregates)

		var rowHeadStyle = {
			top: ((view.column_aggregates.length + vStart) * actRowHt ) + 'px',
			left: ((this.props.scrollLeft || 0) + geo.leftGutter) + 'px'
		}

		var trStyle = {
			lineHeight: rowHeight,
			// height: rowHeight,
			// maxHeight: rowHeight,
			// minHeight: rowHeight
		}

		var spans = {}
		view.row_aggregates.forEach(function (group) {
			spans['a' + group] = 1
		})

		// console.log('vStart: ' + vStart)
		
		return <tbody
			id="cube-row-view-header"
			ref="rowhead" 
			className = "cube-rowhead"
			style = {rowHeadStyle}
			key={"cube-row-thead-" + view.view_id}>
			{
			levels.map(function (level, i) {
				return <tr key={'cube-rowhead-' + i} style = {trStyle}>
				{
					view['row_aggregates'].map(function (group) {
						var thStyle = _.extend({
							minWidth: geo.columnWidth + 'px',
							maxWidth: geo.columnWidth + 'px'
						}, trStyle)

						if (spans['a' + group]-- > 1) return null
						else spans['a' + group] = level.spans['a' + group]
						return <th
							style = {thStyle}
							rowSpan = {level.spans['a' + group]}
							key={'cube-header-' + group}>
						{level['a' + group]}
						</th>
						

					})
				}
				</tr>
			})
			}
		</tbody>;
	},

	_onChange: function () {	
		this.forceUpdate()
	},

	componentWillMount: function () {
		var store = this.props.store
		
		if (store) {
			store.addChangeListener(this._onChange)
			this.fetch(true)
		}
	},

	fetch: function (force) {
		var view = this.props.view
		modelActionCreators.fetchLevels(view, 'rows', 0, 1000)
	}
})

export default CubeRowTHead