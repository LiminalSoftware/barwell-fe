import React from "react"
import $ from "jquery"
 
import _ from 'underscore'
import fieldTypes from "../../fields"
import modelActionCreators from "../../../../actions/modelActionCreators"
import FocusStore from "../../../../stores/FocusStore"
import AttributeStore from "../../../../stores/AttributeStore"
import calcSpans from './calcSpans'

import util from '../../../../util/util'

var CubeRowTHead = React.createClass ({

	getInitialState: function () {
		return {
			fetched: false,
			rowOffset: 0,
			colOffset: 0,
		}
	},

	render: function () {
		var _this = this
		var view = this.props.view
		var geo = view.data.geometry
		var groups = this.props.groups
		var left = 0
		var store = this.props.store
		var levels = store.getLevels('rows', 0, 100) || []
		var spans = groups.map(g => 0)

		return <div
			id = "cube-row-view-header"
			ref = "rowHead"
			className = "tabular-body force-layer wrapper"
			key = {"cube-row-thead-" + view.view_id} >

			{
			levels.map(function (level, r) {
				var selector = {}
				var left = 0
				
				return groups.map(function (group, c) {
					var column_id = group.column_id
					var width = group.width
					var cellKey = 'cell-' + r + '-' + group.column_id

					selector[column_id] = level[column_id]
					spans[c] ++
					
					if (r === levels.length - 1 || level[column_id] !== levels[r + 1][column_id]) {
						var fieldType = fieldTypes[group.type].element
						var height = spans[c] * geo.rowHeight
						var thStyle = {
							width: width + 'px',
							height: height + 'px',
							lineHeight: (height - 1) + 'px',
							left: left + 'px',
							top: ((r - spans[c]) * geo.rowHeight) + 'px'
						}
						left += width
						spans[c] = 0
						return React.createElement(fieldType, {
							config: group,
							model: _this.props.model,
							view: _this.props.view,
							selector: _.clone(selector),
							value: level[column_id],
							column_id: group.column_id,
							key: cellKey,
							cellKey: cellKey,
							ref: cellKey,
							style: thStyle,
							className: 'table-cell'
						})
					
					} else {
						left += width
					}
				})
				
			})
			}
		</div>;
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
