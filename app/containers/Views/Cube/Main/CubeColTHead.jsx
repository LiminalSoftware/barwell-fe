import React from "react"
import $ from "jquery"
import EventListener from 'react/lib/EventListener'
import _ from 'underscore'
import fieldTypes from "../../fields"
import modelActionCreators from "../../../../actions/modelActionCreators"
import FocusStore from "../../../../stores/FocusStore"
import calcSpans from './calcSpans'


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

		var theadStyle = {
			top: this.props.scrollTop + 'px',
			left: (width * (view.row_aggregates.length + hStart) + geo.leftGutter) + 'px'
		}

		return <tbody
			id="cube-column-view-header"
			ref="thead"
			className = "cube-colhead"
			style = {theadStyle}
			key={"cube-col-thead-" + view.view_id}>
			{
			view.column_aggregates.map(function (group) {
				group = 'a' + group
				return <tr key={'cube-col-thead-' + group} style = {trStyle}>
					{levels.map(function (level) {
						if (level.spans[group] === 0) return null;
						var width = geo.columnWidth * level.spans[group]
						console.log('width: ' + width)
						var tdStyle = {
							minWidth: width + 'px',
							maxWidth: width + 'px'
						}
						return <td style = {tdStyle} colSpan = {level.spans[group]}>{level[group]}</td>
					}) }
				</tr>
			})
			}
		</tbody>;
	},

	_onChange: function () {
		this.forceUpdate()
	},

	shouldComponentUpdate: function (newProps, newState) {
		var oldProps = this.props
		return !(
			_.isEqual(newProps.view, oldProps.view) &&
			newProps.scrollTop === oldProps.scrollTop &&
			newProps.scrollLeft === oldProps.scrollLeft
		)
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
