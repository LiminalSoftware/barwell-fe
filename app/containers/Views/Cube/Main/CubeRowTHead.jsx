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

	fetch: function () {
		
	},

	render: function () {
		
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
						width: width + 'px',
						height: (geo.rowHeight * level.spans[group]) + 'px',
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
