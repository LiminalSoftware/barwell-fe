import React from "react"
import $ from "jquery"
import EventListener from 'react/lib/EventListener'
import _ from 'underscore'
import fieldTypes from "../../fields"
import modelActionCreators from "../../../../actions/modelActionCreators"
import FocusStore from "../../../../stores/FocusStore"
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;

var TabularTHContext = require('./TabularTHContext')

var TabularTH = React.createClass ({

  columnMinWidth: 50,

	render: function () {
		var _this = this
		var view = this.props.view
		var geo = view.data.geometry
		var col = this.props.column
		var left = this.props.left
		var cellStyle = {
			minWidth: (col.width - 1) + 'px',
			maxWidth: (col.width - 1) + 'px',
			top: 0,
			left: left + 'px',
			height: geo.headerHeight + 'px',
		}
		var sortArrow
		var classes = []
		classes.push('table-cell')
		classes.push('table-header-cell')
		if (!!col.sorting) classes.push(col.sorting.descending ? 'desc' : 'asc')
    if (this.state.context) classes.push('context')
    if (FocusStore.getFocus() === 'view') classes.push('focused')
		else if (!this.state.context) classes.push('blurred')

		return <span
				onContextMenu = {this.onContextMenu}
				style = {cellStyle}
				className = {classes.join(' ')}>
			<span className="table-cell-inner">
			   {col.name}
			</span>
      {this.state.context ? <TabularTHContext
        headerHeight = {geo.headerHeight}
        config = {col}
        handleBlur = {this.handleBlur}/> : null}
			<span
				ref = "resizer"
				className = {"table-resizer " + (this.state.dragging ? "dragging" : "")}
				onMouseDown = {this.onResizerMouseDown}
				style = {{right: (-1 * this.state.pos) + 'px', top: 0}}>
			</span>
		</span>
	},

	getInitialState: function () {
		return {
			dragging: false,
			rel: null,
			pos: 0,
      context: false
		}

	},

	componentDidMount: function () {
		var col = this.props.column
		this.setState(col)
	},

	onResizerMouseDown: function (e) {
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
		var col = this.props.column

   	view.data.columns[col.column_id].width = (col.width + this.state.pos)
		modelActionCreators.createView(view, true, false)
		this.setState({
			dragging: false,
			pos: 0
		})
		e.stopPropagation()
		e.preventDefault()
	},

	onMouseMove: function (e) {
	   if (!this.state.dragging) return
	   this.setState({
	      pos: Math.max(e.pageX - this.state.rel, this.columnMinWidth - this.state.rel - this.props.column.width)
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

  onContextMenu: function (e) {
    modelActionCreators.setFocus('view-config')
    this.setState({context: true})
    e.stopPropagation()
		e.preventDefault()
  },

  handleBlur: function () {
    modelActionCreators.setFocus('view')
    this.setState({context: false})
  },

  handleKeyPress: function (event) {
    if (event.keyCode === constant.keycodes.ESC) this.handleBlur()
  },



})

export default TabularTH
