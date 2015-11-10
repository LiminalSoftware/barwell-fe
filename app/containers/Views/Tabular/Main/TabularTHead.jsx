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
		var view = this.props.view
		var geo = view.data.geometry
		var style = {
			top: (geo.topGutter + 'px'),
		}
		var left = geo.leftGutter

		return <div
			className = "tabular-view-header"
			id = "tabular-view-header"
			ref = "thead"
			style = {style}
			key={"tabular-thead-" + view.view_id}>
		{
			_this.props.columns.map(function (col, idx) {
				var el = <TabularTH key={"th-" + col.attribute_id} column={col} view={view} idx={idx} left={left}/>;
				left += col.width
				return el
			})
		}
		</div>
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
		var left = this.props.left
		var cellStyle = {
			minWidth: col.width,
			maxWidth: col.width,
			top: geo.topGutter + 'px',
			left: left + 'px',
			height: geo.headerHeight + 'px'
		}
		var sortArrow
		var classes = []
		classes.push('table-cell')
		classes.push('table-header-cell')
		if (!!col.sorting) classes.push(col.sorting.descending ? 'desc' : 'asc')
		if (!!col.sorting) sortArrow = <span className={"small sort-icon white after icon icon-arrow-" + (col.sorting.descending ? "up" : "down")}></span>
		// if (!!col.sorting) classes.push(col.sorting.descending ? 'asc' : 'desc')
		if (FocusStore.getFocus() === 'view') classes.push('focused')

		return <span
				onClick={this.onClick}
				style={cellStyle}
				className={classes.join(' ')}>
			<span className="table-cell-inner">
			{col.name}
			{sortArrow}
			</span>
			<span
				ref = "resizer"
				className = {"table-resizer " + (this.state.dragging ? "dragging" : "")}
				onMouseDown = {this.onResizerMouseDown}
				style = {{right: (-1 * this.state.pos) + 'px', top: 0}}
			></span>
		</span>
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
