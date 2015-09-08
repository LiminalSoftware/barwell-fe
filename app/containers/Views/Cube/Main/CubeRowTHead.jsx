import React from "react"
import $ from "jquery"
import EventListener from 'react/lib/EventListener'
import _ from 'underscore'
import fieldTypes from "../../fields"
import modelActionCreators from "../../../../actions/modelActionCreators"
import FocusStore from "../../../../stores/FocusStore"
import consolidate from './consolidate'

import util from '../../../../util/util'

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
		levels = util.nest(levels, view.row_aggregates.map(id => 'a' + id))

		var rowHeadStyle = {
			top: ((view.column_aggregates.length + vStart) * actRowHt ) + 'px',
			left: ((this.props.scrollLeft || 0) + geo.leftGutter) + 'px'
		}
		var trStyle = {lineHeight: rowHeight}
		var thStyle = {
			minWidth: geo.columnWidth + 'px',
			maxWidth: geo.columnWidth + 'px'
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

						<th
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
