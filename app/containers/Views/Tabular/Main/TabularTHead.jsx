import React from "react"
import $ from "jquery"
import EventListener from 'react/lib/EventListener'
import _ from 'underscore'
import fieldTypes from "../../fields"

var TabularTHead = React.createClass ({
	render: function () {
		var style = {top: (this.props.scrollTop || 0) + 'px'}
		var view = this.props.view
		var header = this.props.columns.map(function (col, idx) {
			return <TabularTH key={"th-"+col.id} column={col} view={view} idx={idx}/>
		})
		return <thead id="tabular-view-header" ref="thead" style={style}>
			<tr>{header}</tr>
		</thead>
	}
})

export default TabularTHead


var TabularTH = React.createClass ({
	// shouldComponentUpdate: function (nextProps, nextState) {
	// 	var old = this.props.column
	// 	var nxt = nextProps.column 
	// 	return !(old.width == nxt.width && old.sorting == nxt.sorting)
	// },
	render: function () {
		var _this = this
		var col = this.props.column
		var cellStyle = {minWidth: col.width, maxWidth: col.width}
		var sortArrow
		var classes = ""
		if (!!col.sorting) sortArrow = <span className={"small white after icon icon-arrow-" + (col.sorting.descending ? "up" : "down")}></span>
		if (!!col.sorting) classes = col.sorting.descending ? 'asc' : 'desc'
		return <th 
				onClick={this.onClick}
				key={"header-" + col.id} 
				style={cellStyle} 
				className={classes}
			>
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

   		viewData.columns[col.id].width = (col.width + this.state.pos)
		this.setState({pos: 0})
		view.set(bw.DEF.VIEW_DATA, viewData)
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
   		if(event.target == resizer) return

		var view = this.props.view   
		var col = this.props.column
		var viewData = view.data
		var sortOrder = !!(col.sorting && !col.sorting.descending)
		var sortObj = {'id': col.id, 'descending': sortOrder}
		if (!event.shiftKey || !(viewData.sorting instanceof Array)) viewData.sorting = []
		else viewData.sorting = _.filter(viewData.sorting, function (obj) {return obj.id !== col.id})
		viewData.sorting.push(sortObj)
		      
		dispatcher.dispatch({
			actionType: "VIEW_UPDATE",
			data: viewData
		})
	}
})