import React from "react"
import $ from "jquery"
import EventListener from 'react/lib/EventListener'
import _ from 'underscore'
import fieldTypes from "../../fields"
import modelActionCreators from "../../../../actions/modelActionCreators"
import FocusStore from "../../../../stores/FocusStore"
import AttributeStore from "../../../../stores/AttributeStore"
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
		var width = geo.columnWidth
		var vStart = this.props.vStart
		var vEnd = vStart + geo.renderBufferRows
		var hStart = this.props.hStart
		var store = this.props.store
		var groups = view.row_aggregates.map(g => 'a' + g)
		var groupAttrs = view.row_aggregates.map(g => AttributeStore.get(g))
		var elements = groupAttrs.map(attr => (fieldTypes[attr.type] || fieldTypes.TEXT).element)
		var levels = store.getLevels('rows', vStart, vEnd)





		return <div
			id="cube-row-view-header"
			ref="rowhead"
			className = "cube-rowhead"
			onMouseDown = {this.props.clicker}
			key={"cube-row-thead-" + view.view_id} >

			{groups.map(function (group, c) {
				return <span className="table-cell table-header-cell"
					style={{left: (c * width) + 'px', width: width + 'px', height: geo.rowHeight}}>
					<span className="table-cell-inner">{group}</span>
				</span>
			})}

			{levels.map(function (level, r) {
				var selector = {}
				return <div key={'cell-' + r}>



				{ groups.map(function (group, c) {
					var thStyle = {
						minWidth: width + 'px',
						maxWidth: width + 'px',
						minHeight: (geo.rowHeight * level.spans[group]) + 'px',
						maxHeight: (geo.rowHeight * level.spans[group]) + 'px',
						left: (c * width) + 'px',
						top: ((r + view.column_aggregates.length) * (geo.rowHeight)) + 'px'
					}

					selector[group] = level[group]
					var cellKey = 'cell-' + r + '-' + group
					if (level.spans[group] === 0)	return null

					else return React.createElement(elements[c], {
						config: {},
						model: _this.props.model,
						view: _this.props.view,
						selector: _.clone(selector),
						value: level[group],
						column_id: group,
						handleBlur: _this.props.handleBlur,
						key: cellKey,
						cellKey: cellKey,
						ref: cellKey,
						style: thStyle,
						className: 'table-cell'
					})
				}) } </div>
			})}
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
