import React from "react"
import $ from "jquery"
import EventListener from 'react/lib/EventListener'
import _ from 'underscore'
import fieldTypes from "../../fields"
import modelActionCreators from "../../../../actions/modelActionCreators"
import FocusStore from "../../../../stores/FocusStore"
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;

var TabularTHead = React.createClass ({
	mixins: [PureRenderMixin],

	render: function () {
		var _this = this
		var style = {top: (this.props.scrollTop || 0) + 'px'}
		var view = this.props.view

		return <thead
			className = "tabular-view-header"
			id="tabular-view-header"
			ref="thead" style={style}
			key={"tabular-thead-" + view.view_id}><tr>
		{
			_this.props.columns.map(function (col, idx) {
				return <TabularTH key={"th-" + col.attribute_id} column={col} view={view} idx={idx}/>;
			})
		}
		</tr></thead>
	}
})

export default TabularTHead

var TabularTH = React.createClass ({
	mixins: [PureRenderMixin],

	render: function () {
		var _this = this
		var view = this.props.view
		var geo = view.data.geometry
		var col = this.props.column
		var cellStyle = {
			minWidth: col.width,
			maxWidth: col.width,
			lineHeight: geo.headerHeight + 'px'
		}
		var sortArrow
		var classes = []

		if (!!col.sorting) sortArrow = <span className={"small sort-icon white after icon icon-arrow-" + (col.sorting.descending ? "up" : "down")}></span>
		// if (!!col.sorting) classes.push(col.sorting.descending ? 'asc' : 'desc')
		if (FocusStore.getFocus() === 'view') classes.push('focused')

		return <th
				onClick={this.onClick}
				style={cellStyle}
				className={classes.join(' ')}>
			{col.name}
			{sortArrow}
			<span
				ref = "resizer"
				className = {"table-resizer " + (this.state.dragging ? "dragging" : "")}
				onMouseDown = {this.onResizerMouseDown}
				style = {{right: (-1 * this.state.pos) + 'px', top: 0}}
			></span>
		</th>
	},

	getInitialState: function () {
		return {
			dragging: false,
			rel: null,
			pos: 0
		}

	},

	componentDidMount: function () {
		var col = this.props.column
		this.setState(col)
	},

	onResizerMouseDown: function (e) {
		// only left mouse button
	    if (e.button !== 0) return
	    var pos = $(this.getDOMNode()).offset()
	    this.setState({
	      dragging: true,
	      rel: e.pageX
	    })
	    e.stopPropagation()
	    e.preventDefault()
	},

	onMouseUp: function (e) {
   	var view = this.props.view
		var viewData = view.data
		var col = this.props.column

		this.setState({dragging: false})
		e.stopPropagation()
		e.preventDefault()

   	viewData.columns[col.column_id].width = (col.width + this.state.pos)
		this.setState({pos: 0})
		view.data = viewData

		// modelActionCreators.create('view', true, view, false)
		modelActionCreators.createView(view, true, false)
	},

	onMouseMove: function (e) {
	   if (!this.state.dragging) return
	   this.setState({
	      pos: e.pageX - this.state.rel
	   })
	   e.stopPropagation()
	   e.preventDefault()
	},

	componentDidUpdate: function (props, state) {
		if (this.state.dragging && !state.dragging) {
			document.addEventListener('mousemove', this.onMouseMove)
			document.addEventListener('mouseup', this.onMouseUp)
		} else if (!this.state.dragging && state.dragging) {
		   document.removeEventListener('mousemove', this.onMouseMove)
		   document.removeEventListener('mouseup', this.onMouseUp)
		}
	},

   onClick: function (event) {
   	var resizer = React.findDOMNode(this.refs.resizer)
		var view = this.props.view
		var col = this.props.column

		if(event.target == resizer) return

		var sortObj = {
			'attribute_id': col.attribute_id,
			'descending': !!(col.sorting && !col.sorting.descending)
		}

		if (!event.shiftKey || !view.data.sorting) view.data.sorting = []
		view.data.sorting.push(sortObj)

		modelActionCreators.createView(view, true, false)
	}

})
