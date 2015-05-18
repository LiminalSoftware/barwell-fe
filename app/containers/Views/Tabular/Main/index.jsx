import React from "react";
import { RouteHandler } from "react-router";
import bw from "barwell";
import styles from "./style.less";
import EventListener from 'react/lib/EventListener';
import _ from 'underscore';

var HEADER_HEIGHT = 35;
var ROW_HEIGHT = 21;
var TOP_OFFSET = 12;
var TabularPane = React.createClass ({
	getInitialState: function () {
		return {
			'offset': 0, 
			'records': 100, 
			'selection': {
				'left': 1, 
				'top': 1,
				'right': 1,
				'bottom': 1
			},
			'anchor': {
				"left": 1,
				"top": 1
			}};
	},

	componentDidMount: function () {
		var _this = this;
		var model = this.props.model;
		var view = this.props.view;
	},
	
	componentWillMount: function () {
		var _this = this;
		var model = this.props.model;
		var view = this.props.view;
		this.cursor = this.getCursor();
		this.updateCursor();
	},

	getCursor: function () {
		var _this = this;
		var model = this.props.model;
		this.cursor = model.store.getCursor(this.state);
		return this.cursor;
	},

	updateCursor: function (state) {
		var _this = this;
		return this.cursor.fetch();
	},

	handleScroll: function (event) {
		var wrapper = React.findDOMNode(this.refs.wrapper);
		var head = React.findDOMNode(this.refs.thead);
		this.setState({scrollTop: wrapper.scrollTop});
	},

	handleKey: function (event) {
		
	},

	handleClick: function (event) {
		var view = this.props.view;
		var viewData = view.synget(bw.DEF.VIEW_DATA);

		var wrapper = React.findDOMNode(this.refs.wrapper);
		var tableBody = React.findDOMNode(this.refs.tbody);
		var y = event.pageY - wrapper.offsetTop + wrapper.scrollTop - HEADER_HEIGHT;
		var x = event.pageX - wrapper.offsetLeft + wrapper.scrollLeft - 3;
		var rowNum = Math.ceil(y/ROW_HEIGHT,1);
		var colNum = 0;
		var sel = this.state.selection;
		var anc = this.state.anchor;
		
		viewData.columnList.forEach(function (col) {
			x -= col.width + 2;
			if (x > 0) colNum ++;
		});

		if (event.shiftKey) {
			if (colNum <= this.state.anchor.left) {
				sel.right = this.state.anchor.left;
				sel.left = colNum;
			} else {
				sel.right = colNum;
			}
			if (rowNum <= this.state.anchor.top) {
				sel.bottom = this.state.anchor.top;
				sel.top = rowNum;
			} else {
				sel.bottom = rowNum;
			}
		} else {
			anc.left = sel.right = sel.left = colNum;
			anc.top = sel.top = sel.bottom = rowNum;
		}
		this.setState({"selection": sel, "anchor": anc});
	},

	getCursorStyle: function () {
		var _this = this;
		var view = this.props.view;
		var viewData = view.synget(bw.DEF.VIEW_DATA);
		var columns = _.filter(viewData.columnList, function(col) {return col.visible;});
		var i = 0;
		var width = 0;
		var height = (this.state.selection.bottom - this.state.selection.top + 1) * ROW_HEIGHT;
		var topPx = TOP_OFFSET + 1 + this.state.selection.top * ROW_HEIGHT;
		var leftPx = 2;
		
		columns.forEach(function (col) {
			i++;
			if (i <= _this.state.selection.left)
				leftPx += col.width + 3;
			else if (i <= _this.state.selection.right + 1)
				width += col.width + 3;
		});
		
		return {
			"top": topPx + 'px',
			"left": leftPx + 'px',
			"minWidth": width + 'px',
			"minHeight": height + "px"
		}
	},

	getAnchorStyle: function () {
		var _this = this;
		var view = this.props.view;
		var viewData = view.synget(bw.DEF.VIEW_DATA);
		var columns = _.filter(viewData.columnList, function(col) {return col.visible;});
		var i = 0;
		var width;
		var height = ROW_HEIGHT;
		var topPx = TOP_OFFSET + this.state.anchor.top * ROW_HEIGHT;
		var leftPx = 1;
		
		columns.forEach(function (col) {
			i++;
			if (i <= _this.state.anchor.left)
				leftPx += col.width + 3;
			else if (i == _this.state.anchor.left + 1)
				width = col.width + 3;
		});
		
		return {
			"top": topPx + 'px',
			"left": leftPx + 'px',
			"minWidth": width + 'px',
			"minHeight": height + "px"
		}
	},

	render: function () {
		console.log('render TabularPane');
		var _this = this;
		var model = this.props.model;
		var modelId = model.synget(bw.DEF.MODEL_ID);
		var view = this.props.view;
		var viewData = view.synget(bw.DEF.VIEW_DATA);
		var attributes = model.synget(bw.DEF.MODEL_FIELDS);
		var columns = _.filter(viewData.columnList, function(col) {return !!col.visible;});
		var header = [];
		var rows = [];

		columns.map(function (col) {
			var cellStyle = {
				minWidth: col.width,
				maxWidth: col.width
			}
			var head = <th key={"header-" + col.id} style={cellStyle}>{col.name}</th>;
			if (!!col.visible) header.push(head);
		});
		
		if (this.state) for (var i = this.state.offset; i < this.state.offset + this.state.records; i++) {
			var _this = this;
			var row = _this.cursor.at(i);
			var props = [];
			if (!row) continue;
			columns.forEach(function (col) {
				var key = 'table-row-' + i + '-' + col.id;
				var cellStyle = {
					minWidth: col.width,
					maxWidth: col.width
				}
				props.push(<td key={key} style={cellStyle} onClick={_this.handleClick}>{row.attributes[col.id]}</td>);
			});
			rows.push(<tr key={i}>{props}</tr>);
		}
		
		return <div className="model-pane" >
			<div className="tabular-wrapper" onScroll={this.handleScroll} ref="wrapper">
				<table className="header data-table" onKeyPress={this.handleKey} >
					<thead ref="thead" style={{top: (this.state.scrollTop + 'px')}}>
						<tr key="header">{header}</tr>
					</thead>
					<tbody ref="tbody">
						{rows}
					</tbody>
				</table>
				<div className="anchor" ref="anchor" style={this.getAnchorStyle()}></div>
				<div className="selection" ref="selection" style={this.getCursorStyle()}></div>
			</div>
		</div>;
	}
});


export default TabularPane;

