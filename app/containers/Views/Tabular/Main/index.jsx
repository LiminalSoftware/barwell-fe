import React from "react";
import { RouteHandler } from "react-router";
import bw from "barwell";
import styles from "./style.less";
import EventListener from 'react/lib/EventListener';
import _ from 'underscore';
import $ from 'jquery';

var HEADER_HEIGHT = 35;
var ROW_HEIGHT = 21;
var TOP_OFFSET = 12;

var CURSOR_LIMIT = 60;
var WINDOW_SIZE = 25;
var OFFSET_TOLERANCE = 10;
var WIDTH_PADDING = 9;

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
			anchor: void(0),
			cur: {
				offset: 0,
				limit: CURSOR_LIMIT
			},
			fetching: false,
			initialized: false
		}
	},

	componentDidMount: function () {
		var _this = this;
		var view = this.props.view;
		this.setState(view.synget(bw.DEF.VIEW_DATA));
		view.on('update', this.refreshView);
		this.fetch();

		$(document.body).on('keydown', this.onKey);
	},

	updateView: function (view) {
		var _this = this;
		var oldView = this.props.view;
		oldView.removeListener('update', this.refreshView)
		this.setState(view.synget(bw.DEF.VIEW_DATA));
		view.on('update', this.refreshView);
	},

	updateCursor: function (model) {
		this.cursor.removeListener('fetch', this.receiveFetch);
		this.cursor.release();
		this.cursor = model.store.getCursor();
		this.cursor.on('fetch', this.receiveFetch);
		this.setState({initialized: false});
		this.fetch();
	},

	refreshView: function () {
		var view = this.props.view;
		this.setState(view.synget(bw.DEF.VIEW_DATA))
	},

	componentWillMount: function () {
		var model = this.props.model;
		this.cursor = model.store.getCursor();
		this.cursor.on('fetch', this.receiveFetch);
	},

	componentWillReceiveProps: function (props) {
		if (props.model !== this.props.model) this.updateCursor(props.model);
		if (props.view !== this.props.view) this.updateView(props.view);
	},

	componentWillUnmount: function () {
		this.cursor.removeListener('fetch', this.receiveFetch);
		this.cursor.release();
	},

	fetch: function (state) {
		var rowOffset = Math.floor(this.state.scrollTop / ROW_HEIGHT);
		var tgtOffset = Math.floor(rowOffset - (CURSOR_LIMIT / 2) + (WINDOW_SIZE / 2));
		var mismatch = Math.abs(rowOffset - tgtOffset);

		if (!this.state.initialized || (mismatch > OFFSET_TOLERANCE)) {
			this.setState({
				"fetching": true,
				"cur": {
					offset: Math.max(tgtOffset, 0),
					limit: CURSOR_LIMIT
				}
			});
			return this.cursor.fetch(
				this.state.cur.offset, 
				this.state.cur.limit
			);
		}
	},

	receiveFetch: function () {
		this.setState({"fetching": false});
	},

	onScroll: function (event) {
		var wrapper = React.findDOMNode(this.refs.wrapper);
		this.setState({scrollTop: wrapper.scrollTop});
		this.fetch();
	},

	updateSelect: function (row, col, shift) {
		var sel = this.state.selection
		var anc = this.state.anchor
		var ptr = {left: col, top: row}

		if (shift) {
			if (!anc) anc = {left: col, top: row};
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
		});
	},

	onKey: function (e) {
		var anc = this.state.anchor;
		if (e.keyCode == 37) offset = [-1,0];
		if (e.keyCode == 38) offset = [0,1];
		if (e.keyCode == 39) offset = [1,0];
		if (e.keyCode == 40) offset = [0,-1];

	},

	onClick: function (event) {
		var wrapper = React.findDOMNode(this.refs.wrapper);
		var tableBody = React.findDOMNode(this.refs.tbody);
		var y = event.pageY - wrapper.offsetTop + wrapper.scrollTop - HEADER_HEIGHT;
		var x = event.pageX - wrapper.offsetLeft + wrapper.scrollLeft - 3;
		var rowNum = Math.floor(y/ROW_HEIGHT,1);
		var colNum = 0;
		
		this.state.columnList.forEach(function (col) {
			x -= col.width + WIDTH_PADDING;
			if (x > 0) colNum ++;
		});

		this.updateSelect(rowNum, colNum, event.shiftKey);
	},

	getSelectorStyle: function () {
		var _this = this;
		var sel = this.state.selection;
		var columns = _.filter(this.state.columnList, function(col) {return col.visible;});
		var width = -1;
		var height = (this.state.selection.bottom - this.state.selection.top + 1) * ROW_HEIGHT - 2;
		var left = 2;
		var top = HEADER_HEIGHT + this.state.selection.top * ROW_HEIGHT;
		
		columns.forEach(function (col, idx) {
			if (idx < sel.left)
				left += col.width + WIDTH_PADDING;
			else if (idx < sel.right + 1)
				width += col.width + WIDTH_PADDING;
		});
		
		return {
			top: top + 'px',
			left: left + 'px',
			minWidth: width + 'px',
			minHeight: height + "px"
		};
	},

	getTableStyle: function () {
		return {
			top: (this.state.cur.offset * (ROW_HEIGHT) + HEADER_HEIGHT) + 'px',
			height: '10000px'
		};
	},

	getPointerStyle: function () {
		var _this = this;
		var ptr = this.state.pointer;
		var columns = _.filter(this.state.columnList, function(col) {return col.visible})
		var width;
		var height = ROW_HEIGHT - 2;
		var left = 1;
		var top = HEADER_HEIGHT + ptr.top * ROW_HEIGHT - 1;
		
		columns.forEach(function (col, idx) {
			if (idx < ptr.left)
				left += (col.width + WIDTH_PADDING);
			else if (idx < ptr.left + 1)
				width = (col.width + WIDTH_PADDING - 1);
		});

		return {
			top: top + 'px',
			left: left + 'px',
			minWidth: width + 'px',
			minHeight: height + "px"
		};
	},

	render: function () {
		var _this = this;
		var model = this.props.model;
		var view = this.props.view;
		var columns = _.filter(this.state.columnList, function(col) {return !!col.visible;});
		var header = [];
		var rows = [];
		
		header = columns.map(function (col, idx) {
			return <TabularTH key={"th-"+col.id} column={col} view={view} idx={idx}/>;
		});
		
		if (this.state) for (var i = this.state.cur.offset; i < this.state.cur.offset + this.state.cur.limit; i++) {
			var _this = this;
			var row = _this.cursor.at(i);
			var props = columns.map(function (col, idx) {
				var key = 'cell-' + i + '-' + col.id;
				var classes = [];
				var cellValue = (!!row) ? row.attributes[col.id] : ""
				var cellStyle = {minWidth: col.width, maxWidth: col.width}

				if (idx == 0 && i >= _this.state.selection.top && i < _this.state.selection.bottom + 1)
					classes ='first-cell-highlight'
				else 
					classes = 'first-cell';
				
				return <td key={key} className={classes} style={cellStyle} onClick={_this.onClick}>{cellValue}</td>;
			});
			rows.push(<tr key={i}>{props}</tr>);
		}
		return <div className="tabular-wrapper" id="table-wrapper" onScroll={this.onScroll} ref="wrapper">
				<table id="main-data-table" className="header data-table" onKeyPress={this.onKey} >
					<thead ref="thead" style={{top: (this.state.scrollTop || 0 + 'px')}}>
						<tr>{header}</tr>
					</thead>
					<tbody ref="tbody" style={this.getTableStyle()}>
						{rows}
					</tbody>
				</table>
				<div className="anchor" ref="anchor" style={this.getPointerStyle()}></div>
				<div className="selection" ref="selection" style={this.getSelectorStyle()}></div>
		</div>
	}
});

var TabularTH = React.createClass ({
	render: function () {
		var _this = this
		var col = this.props.column
		var cellStyle = {
			minWidth: col.width,
			maxWidth: col.width
		};
		var sortArrow
		var classes = ""
		if (!!col.sorting) sortArrow = <span className={"small white after icon icon-arrow-" + (col.sorting.desc ? "up" : "down")}></span>;
		else sortArrow = ""
		if (!!col.sorting) classes = col.sorting.desc ? 'asc' : 'desc';
		return <th 
				onClick={this.onClick}
				key={"header-" + col.id} 
				style={cellStyle} 
				className={classes}
			>
			{col.name}
			{sortArrow}
			<span 
				className = {"table-resizer " + (this.state.dragging ? "dragging" : "")}
				onMouseDown = {this.onResizerMouseDown}
				style = {{right: (-1 * this.state.pos) + 'px', top: 0}}
			></span>
		</th>;
	},

	getInitialState: function () {
		return {
			dragging: false,
			rel: null,
			pos: 0
		};
	},

	componentWillMount: function () {
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
   	var view = this.props.view;   
		var viewData = view.synget(bw.DEF.VIEW_DATA)
		var col = this.props.column;

   	this.setState({dragging: false})
   	e.stopPropagation()
   	e.preventDefault()

   	viewData.columns[col.id].width = (col.width + this.state.pos);
		this.setState({pos: 0});
		view.set(bw.DEF.VIEW_DATA, viewData); 
	},

	onMouseMove: function (e) {
	   if (!this.state.dragging) return
	   this.setState({
	      pos: e.pageX - this.state.rel
	   });
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
   	// TODO handle multiple sorting
		var view = this.props.view;   
		var viewData = view.synget(bw.DEF.VIEW_DATA);       
		viewData.sorting = [{'id': this.props.column.id, 'desc': false}];       
		view.set(bw.DEF.VIEW_DATA, viewData); 
	} 
});

export default TabularPane;

