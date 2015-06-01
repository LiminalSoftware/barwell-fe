import React from "react"
import { RouteHandler } from "react-router"
import bw from "barwell"
import styles from "./style.less"
import EventListener from 'react/lib/EventListener'
import _ from 'underscore'
import $ from 'jquery'
import fieldTypes from "./fields.jsx"
import TabularTBody from "./TabularTBody"


var HEADER_HEIGHT = 35
var ROW_HEIGHT = 22
var TOP_OFFSET = 12
var WIDTH_PADDING = 9

var TabularPane = React.createClass ({
	
	getInitialState: function () {
		return {
			selection: {
				left: 0, 
				top: 0,
				right: 0,
				bottom: 0
			},
			pointer: {
				left: 0,
				top: 0
			},
			anchor: {
				left: 0, 
				top: 0
			},
			scrollTop: 0,
			focused: false,
			editing: false
		}
	},

	componentDidMount: function () {
		var view = this.props.view
		this.refreshView()
		view.on('update', this.refreshView)
		$(document.body).on('keydown', this.onKey)
	},

	componentWillUnmount: function () {
		var view = this.props.view
		view.removeListener('update', this.refreshView)
		$(document.body).off('keydown', this.onKey)
	},

	updateView: function (view) {
		var oldView = this.props.view
		oldView.removeListener('update', this.refreshView)
		view.on('update', this.refreshView)
		this.refreshView
	},

	refreshView: function () {
		var viewData = this.props.view.synget(bw.DEF.VIEW_DATA)
		this.setState(viewData)
	},

	componentWillReceiveProps: function (newProps) {
		console.log('tabular receiving props')
		if (newProps.view !== this.props.view) this.updateView(newProps.view)
	},

	onScroll: function (event) {
		var wrapper = React.findDOMNode(this.refs.wrapper)
		this.setState({scrollTop: wrapper.scrollTop})
	},

	updateSelect: function (row, col, shift) {
		var sel = this.state.selection
		var anc = this.state.anchor
		var ptr = {left: col, top: row}

		if (shift) {
			if (!anc) anc = {left: col, top: row}
			sel = {
				left: Math.min(anc.left, ptr.left),
				right: Math.max(anc.left, ptr.left),
				top: Math.min(anc.top, ptr.top),
				bottom: Math.max(anc.top, ptr.top)
			}
		} else {
			ptr = anc = {left: col, top: row}
			sel = {left: col, right: col, top: row, bottom: row}
		}
		this.setState({
			pointer: ptr,
			selection: sel,
			anchor: anc
		})
	},

	startEdit: function (e) {
		var columns = this.getVisibleColumns()
		var col = columns[this.state.pointer.left]
		var field = fieldTypes[col.type]
		var obj = this.refs.tabularbody.getValueAt(this.state.pointer.top);
		var value = obj.synget(col.id)

		if (field.uneditable) return

		this.setState({editing: true, editorVal: value}, function () {
			React.findDOMNode(this.refs.inputter).focus();
		})
		document.addEventListener('keyup', this.handleEditKeyPress)
	},

	revert: function () {
		document.removeEventListener('keyup', this.handleEditKeyPress)
		this.setState({editing: false})
	},
	
	handleEditKeyPress: function (event) {
		if (event.keyCode === 27) this.cancelChanges()
		if (event.keyCode === 13) this.commitChanges()
	},
	
	cancelChanges: function () {
		// TODO
		this.revert()
	},
	
	commitChanges: function () {
		// TODO
		this.revert()
	},

	onKey: function (e) {
		if ((!this.state.focused) || this.state.editing) return;
		var ptr = this.state.pointer
		var numCols = this.state.columnList.length
		var numRows = 10000 //TODO ... 
		var left = ptr.left
		var top = ptr.top

		if (e.keyCode == 37 && left > 0) left --
		else if (e.keyCode == 38 && top > 0) top --
		else if (e.keyCode == 39 && left < numCols) left ++
		else if (e.keyCode == 40 && top < numRows) top ++
		else if (e.keyCode == 113) return this.startEdit(e) 
		else return

		e.stopPropagation()
   		e.preventDefault()
		if (e.keyCode >= 37 && e.keyCode <= 40) this.updateSelect(top, left, e.shiftKey)
	},

	onClick: function (event) {
		var wrapper = React.findDOMNode(this.refs.wrapper)
		var tableBody = React.findDOMNode(this.refs.tbody)
		var y = event.pageY - wrapper.offsetTop + wrapper.scrollTop - HEADER_HEIGHT
		var x = event.pageX - wrapper.offsetLeft + wrapper.scrollLeft - 3
		var r = Math.floor(y/ROW_HEIGHT,1)
		var c = 0
		
		this.setState({focused: true})

		this.state.columnList.forEach(function (col) {
			x -= col.width + WIDTH_PADDING
			if (x > 0) c ++
		})
		this.updateSelect(r, c, event.shiftKey)
	},

	getVisibleColumns: function () {
		return _.filter(
			this.state.columnList, 
			function(col) {
				return col.visible
			})
	},

	getSelectorStyle: function () {
		var sel = this.state.selection
		var columns = this.getVisibleColumns()
		var width = -1
		var height = (sel.bottom - sel.top + 1) * ROW_HEIGHT - 2
		var left = 2
		var top = HEADER_HEIGHT + this.state.selection.top * ROW_HEIGHT
		
		columns.forEach(function (col, idx) {
			if (idx < sel.left)
				left += col.width + WIDTH_PADDING
			else if (idx < sel.right + 1)
				width += col.width + WIDTH_PADDING
		})
		return {
			top: top + 'px',
			left: left + 'px',
			minWidth: width + 'px',
			minHeight: height + "px"
		}
	},

	getPointerStyle: function () {
		var ptr = this.state.pointer
		var columns = this.getVisibleColumns()
		var width
		var height = ROW_HEIGHT - 2
		var left = 1
		var top = HEADER_HEIGHT + ptr.top * ROW_HEIGHT - 1
		
		columns.forEach(function (col, idx) {
			if (idx < ptr.left)
				left += (col.width + WIDTH_PADDING)
			else if (idx < ptr.left + 1)
				width = (col.width + WIDTH_PADDING - 1)
		})
		return {
			top: top + 'px',
			left: left + 'px',
			minWidth: width + 'px',
			minHeight: height + "px"
		}
	},

	render: function () {
		var _this = this
		var model = this.props.model
		var view = this.props.view
		var columns = this.getVisibleColumns()
		var sorting = this.state.sorting
		var id = view.synget(bw.DEF.MODEL_ID)
		var inputter = <input
			ref = "inputter" 
			className = "input-editor" 
			type = "text" 
			value = {this.state.editorVal}
			onBlur = {this.commitChanges} />
		
		return <div className="view-body-wrapper" onScroll={this.onScroll} ref="wrapper">
				<table id="main-data-table" className="header data-table">
					<TabularTHead  
						key={"thead-" + id} 
						scrollTop={this.state.scrollTop}
						columns={columns}
						view={view} />
					<TabularTBody 
						ref="tabularbody" 
						key={"tbody-" + id}
						model={model}
						view={view}
						columns={columns}
						sorting={sorting}
						scrollTop={this.state.scrollTop}
						clicker={this.onClick}
						dblClicker={this.startEdit} />
				</table>
				<div 
					className={"pointer" + (this.state.focused ? " focused" : "")} 
					ref="anchor" 
					onDoubleClick={this.startEdit} 
					style={this.getPointerStyle()}>
					{this.state.editing ? inputter : ""}
				</div>
				<div 
					className={"selection" + (this.state.focused ? " focused" : "")} 
					ref="selection" 
					style={this.getSelectorStyle()}>
				</div>
		</div>
	}
})

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
		var viewData = view.synget(bw.DEF.VIEW_DATA)
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
		var viewData = view.synget(bw.DEF.VIEW_DATA)
		var sortOrder = !!(col.sorting && !col.sorting.descending)
		var sortObj = {'id': col.id, 'descending': sortOrder}
		if (!event.shiftKey || !(viewData.sorting instanceof Array)) viewData.sorting = []
		else viewData.sorting = _.filter(viewData.sorting, function (obj) {return obj.id !== col.id})
		viewData.sorting.push(sortObj)
		      
		view.set(bw.DEF.VIEW_DATA, viewData) 
	}
})

export default TabularPane