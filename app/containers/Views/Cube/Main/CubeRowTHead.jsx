import React from "react"
import $ from "jquery"
import EventListener from 'react/lib/EventListener'
import _ from 'underscore'
import fieldTypes from "../../fields"
import modelActionCreators from "../../../../actions/modelActionCreators"
import FocusStore from "../../../../stores/FocusStore"
import calcSpans from './calcSpans'

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
		var rowHeadStyle = {
			top: ((view.column_aggregates.length + vStart) * actRowHt ) + 'px',
			left: ((this.props.scrollLeft || 0) + geo.leftGutter) + 'px'
		}
		var trStyle = {lineHeight: rowHeight}
		var thStyle = {
			minWidth: geo.columnWidth + 'px',
			maxWidth: geo.columnWidth + 'px'
		}
		var store = this.props.store
		var groups = view.row_aggregates.map(g => 'a' + g)
		var levels = store.getLevels('rows', vStart, vStart + geo.renderBufferRows)

		return <tbody
			id="cube-row-view-header"
			ref="rowhead"
			className = "cube-rowhead"
			style = {rowHeadStyle}
			key={"cube-row-thead-" + view.view_id} >
			{levels.map(function (level) {
				return <tr style={trStyle}> {groups.map(function (group) {
					if (level.spans[group] === 0)	return null
					else return <td rowSpan={level.spans[group]} style={thStyle}>{level[group]}</td>
				}) } </tr>
			})}
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
	},

	shouldComponentUpdate: function (newProps, newState) {
		var oldProps = this.props
		return !(
			_.isEqual(newProps.view, oldProps.view) &&
			newProps.scrollTop === oldProps.scrollTop &&
			newProps.scrollLeft === oldProps.scrollLeft
		)
	},
})

export default CubeRowTHead
