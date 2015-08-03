import React from "react"
import $ from "jquery"
import EventListener from 'react/lib/EventListener'
import _ from 'underscore'
import fieldTypes from "../../fields"
import modelActionCreators from "../../../../actions/modelActionCreators"
import FocusStore from "../../../../stores/FocusStore"

import createCubeLevelStore from './CubeLevelStore.jsx'
import consolidate from './consolidate'


var CubeColTHead = React.createClass ({
	render: function () {
		var _this = this
		var view = this.props.view
		var dimension = this.props.dimension
		var theadStyle = {
			top: (this.props.scrollTop || 0) + 'px',
			left: ((view.data.columnWidth )* view.row_aggregates.length) + 'px'
		}
		var trStyle = {
			lineHeight: view.data.rowHeight + 'px'
		}
		
		var levels = this.store ? this.store.getLevels() : [];
		
		return <thead
			id="cube-column-view-header" 
			ref="thead" 
			style = {theadStyle}
			key={"cube-col-thead-" + view.view_id}>
			{
			view.column_aggregates.map(function (group) {
				return <tr key={'cube-thead-' + group} style = {trStyle}>
				{
					consolidate(levels, group).map(function (level, i) {
						var width = (view.data.columnWidth * level.span) + 'px'
						var thStyle = {
							minWidth: width,
							maxWidth: width
						}
						return <th 
							style = {thStyle} 
							colSpan = {level.span}
							key={'cube-head-header-' + i}>
						{level.level}
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
		this.store = createCubeLevelStore(view, 'columns')
	},

	fetch: function (force) {
		var view = this.props.view
		modelActionCreators.fetchLevels(view, 'columns', 0, 1000)
	}
})

export default CubeColTHead