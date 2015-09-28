import React from "react"
import $ from "jquery"
import EventListener from 'react/lib/EventListener'
import _ from 'underscore'
import fieldTypes from "../../fields"
import modelActionCreators from "../../../../actions/modelActionCreators"
import FocusStore from "../../../../stores/FocusStore"
import AttributeStore from "../../../../stores/AttributeStore"
import calcSpans from './calcSpans'


var CubeColTHead = React.createClass ({

	render: function () {
		var _this = this
		var view = this.props.view
		var geo = view.data.geometry
		var width = geo.columnWidth + geo.widthPadding
		var trStyle = {lineHeight: geo.rowHeight + 'px'}
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
			onMouseDown = {this.props.clicker}
			style = {theadStyle}
			key={"cube-col-thead-" + view.view_id}>
			{
			view.column_aggregates.map(function (group, c) {
				var attr = AttributeStore.get(group)
				var element = (fieldTypes[attr.type] || fieldTypes.TEXT).element
				var agroup = 'a' + group

				return <tr key={'cube-col-thead-' + group} style = {trStyle}>
					{levels.map(function (level) {
						if (level.spans[group] === 0) return null;
						var width = geo.columnWidth * level.spans[agroup]
						var tdStyle = {
							minWidth: width + 'px',
							maxWidth: width + 'px'
						}
						var selector = {}
						selector[group] = level[group]
						var cellKey = 'cell-' + c + '-' + level[agroup]
						if (level.spans[agroup] === 0)	return null
						// else return <td rowSpan={level.spans[group]} style={thStyle}>{level[group]}</td>
						else return React.createElement(element, {
							config: {},
							model: _this.props.model,
							view: _this.props.view,
							selector: _.clone(selector),
							value: level[agroup],
							column_id: agroup,
							handleBlur: _this.props.handleBlur,
							key: cellKey,
							cellKey: cellKey,
							ref: cellKey,
							colSpan: level.spans[agroup],
							style: tdStyle
						})
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
