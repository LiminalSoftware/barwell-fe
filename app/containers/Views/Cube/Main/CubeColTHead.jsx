import React from "react"
import $ from "jquery"
import EventListener from 'react/lib/EventListener'
import _ from 'underscore'
import fieldTypes from "../../fields"
import modelActionCreators from "../../../../actions/modelActionCreators"
import FocusStore from "../../../../stores/FocusStore"
import consolidate from './consolidate'


var CubeColTHead = React.createClass ({

	render: function () {
		var _this = this
		var view = this.props.view
		var geo = view.data.geometry

		var width = geo.columnWidth + geo.widthPadding

		var trStyle = {
			lineHeight: geo.rowHeight + 'px'
		}

		var hStart = this.props.hStart

		var levels = this.props.store.getLevels('columns', hStart, hStart  + geo.renderBufferCols)
		levels = _.nest(levels, view.column_aggregates)

		var theadStyle = {
			top: this.props.scrollTop + 'px',
			left: (width * (view.row_aggregates.length + hStart) + geo.leftGutter) + 'px'
		}

		return <thead
			id="cube-column-view-header"
			ref="thead"
			className = "cube-colhead"
			style = {theadStyle}
			key={"cube-col-thead-" + view.view_id}>
			{
			view.column_aggregates.map(function (group) {
				return <tr key={'cube-thead-' + group} style = {trStyle}>
				{
					levels.map(function (level, i) {
						var width = (geo.columnWidth * level.spans['a' + group]) + 'px'
						var thStyle = {
							minWidth: width,
							maxWidth: width
						}
						return <th
							style = {thStyle}
							colSpan = {level.spans['a' + group]}
							key={'cube-head-header-' + i}>
						{level['a' + group]}
						</th>
					})
				}
				</tr>
			})
			}
		</thead>;
	},

	_onChange: function () {
		this.forceUpdate()
	},

	shouldComponentUpdate: function () {

	},

	componentWillMount: function () {
		// var view = this.props.view
		var store = this.props.store

		if (store) {
			store.addChangeListener(this._onChange)
			this.fetch(true)
		}
	},

	fetch: function (force) {
		var view = this.props.view
		modelActionCreators.fetchLevels(view, 'columns', 0, 1000)
	}
})

export default CubeColTHead
