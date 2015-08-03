import React from "react"
import $ from "jquery"
import EventListener from 'react/lib/EventListener'
import _ from 'underscore'
import fieldTypes from "../../fields"
import modelActionCreators from "../../../../actions/modelActionCreators"
import FocusStore from "../../../../stores/FocusStore"

import createCubeLevelStore from './CubeLevelStore.jsx'
import consolidate from './consolidate'


var CubeRowTHead = React.createClass ({
	render: function () {
		var _this = this
		var view = this.props.view
		var dimension = this.props.dimension
		var rowHeadStyle = {
			top: ( view.column_aggregates.length * view.data.columnHeight) + 'px',
			left: (this.props.scrollLeft || 0)
		}
		var levels = this.store ? this.store.getLevels() : []
		var trStyle = {
			lineHeight: view.data.rowHeight + 'px'
		}
		
		return <tbody
			id="cube-row-view-header"
			ref="row-head" 
			style = {rowHeadStyle}
			key={"cube-row-thead-" + view.view_id}>
			{
			levels.map(function (level, i) {
				return <tr key={'cube-rowhead-' + i} style = {trStyle}>
				{
					view['row_aggregates'].map(function (group) {
						var width = view.data.columnWidth + 'px'
						var thStyle = {
							minWidth: width,
							maxWidth: width,
							lineHeight: view.data.rowHeight + 'px'
						}
						return <th
							style = {thStyle}
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
		var view = this.props.view
		if (view.view_id && !this.store) this.initStore()
		
		if (this.store) {
			this.store.addChangeListener(this._onChange)
			this.fetch(true)
		}
	},

	initStore: function () {
		var view = this.props.view
		this.store = createCubeLevelStore(view, 'rows')
	},

	fetch: function (force) {
		var view = this.props.view
		modelActionCreators.fetchLevels(view, 'rows', 0, 1000)
	}
})

export default CubeRowTHead