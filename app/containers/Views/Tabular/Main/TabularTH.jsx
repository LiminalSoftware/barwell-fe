import React from "react"
import ReactDOM from "react-dom"
import $ from "jquery"

import _ from 'underscore'
import fieldTypes from "../../fields"
import modelActionCreators from "../../../../actions/modelActionCreators"
import FocusStore from "../../../../stores/FocusStore"
import PureRenderMixin from 'react-addons-pure-render-mixin';

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
			width: (col.width - 1) + 'px',
			left: left + 'px',
		}
		var sortArrow
		var classes = []
		

		return <span
				onContextMenu = {this.onContextMenu}
				style = {cellStyle}
				className = 'table-header-cell '>
			<span className = {"table-cell-inner header-cell-inner " + 
				(this.props.sorted ? ' table-cell-inner-sorted ' : '')}>
			   {col.name}
			</span>
			{
				this.state.context ?
				<TabularTHContext
	        		headerHeight = {geo.headerHeight}
	        		config = {col}
	        		handleBlur = {this.handleBlur}/>
	        	: null
	        }
			<span ref = "resizer"
				className = {"table-resizer col-resizer " + (this.state.dragging ? "dragging" : "")}
				onMouseDown = {this.onResizerMouseDown}
				style = {{
					right: (-1 * this.state.pos) + 'px',
					top: "0",
					height: this.state.dragging ? "1000px" : "100%",
					width: this.state.dragging ? "2px" : "10px"
				}}>
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
		var pos = $(ReactDOM.findDOMNode(this)).offset()
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
	      pos: Math.max(
	      	e.pageX - this.state.rel,
	      	this.columnMinWidth - this.state.rel - this.props.column.width
	      )
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
	// disable column context menus for now
  	// modelActionCreators.setFocus('view-config')
  	// this.setState({context: true})
  	e.stopPropagation()
	e.preventDefault()
	},

	handleBlur: function () {
  	modelActionCreators.setFocus('view')
  	this.setState({context: false})
	},

	handleKeyPress: function (event) {
		if (event.keyCode === constant.keycodes.ESC)
			this.handleBlur()
	},

})

export default TabularTH
