import React from "react";
import { RouteHandler } from "react-router";
import bw from "barwell";
import styles from "./style.less";
import EventListener from 'react/lib/EventListener';
import _ from 'underscore';

var HEADER_HEIGHT = 35;
var ROW_HEIGHT = 21;
var TOP_OFFSET = 12;

var CURSOR_LIMIT = 40;
var WINDOW_SIZE = 3;
var OFFSET_TOLERANCE = 4;

var TabularPane = React.createClass ({
	getInitialState: function () {
		return {
			'selection': {
				'left': 0, 
				'top': 0,
				'right': 0,
				'bottom': 0
			},
			'anchor': {
				"left": 0,
				"top": 0
			},
			'scrollTop': 0,
			'cur': {
				'offset': 1,
				'limit': 100
			},
			'fetching': false
		}
	},

	componentDidMount: function () {
		var _this = this;
		var model = this.props.model;
		var view = this.props.view;
		this.fetch();
		this.cursor.on('fetch', this.receiveFetch);
	},

	componentWillMount: function () {
		var model = this.props.model;
		this.cursor = model.store.getCursor();
	},

	fetch: function (state) {
		var rowOffset = Math.floor(this.state.scrollTop / ROW_HEIGHT);
		var tgtOffset = Math.floor(Math.max(rowOffset - CURSOR_LIMIT/2 + WINDOW_SIZE, 0));
		var mismatch = Math.abs(rowOffset - tgtOffset);

		if (mismatch > OFFSET_TOLERANCE && !this.state.fetching){

			this.setState({
				"fetching": true,
				"cur": {
					offset: tgtOffset,
					limit: CURSOR_LIMIT
				}
			});
			console.log('rowOffset: '+ JSON.stringify(rowOffset, null, 2));
			console.log('offset: '+ this.state.cur.offset + '; limit: ' + this.state.cur.limit);
			return this.cursor.fetch(this.state.cur.offset, this.state.cur.limit);
		}
	},

	receiveFetch: function () {
		this.setState({"fetching": false});
	},

	handleScroll: function (event) {
		var wrapper = React.findDOMNode(this.refs.wrapper);
		console.log('wrapper.scrollTop: '+ JSON.stringify(wrapper.scrollTop, null, 2));
		this.setState({scrollTop: wrapper.scrollTop});
		this.fetch();
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
		var rowNum = Math.floor(y/ROW_HEIGHT,1);
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
		this.setState({
			"selection": sel, 
			"anchor": anc
		});
	},

	getSelectorStyle: function () {
		var _this = this;
		var view = this.props.view;
		var viewData = view.synget(bw.DEF.VIEW_DATA);
		var columns = _.filter(viewData.columnList, function(col) {return col.visible;});
		var i = 0;
		var width = -1;
		var height = (this.state.selection.bottom - this.state.selection.top + 1) * ROW_HEIGHT - 2;
		var topPx = HEADER_HEIGHT + this.state.selection.top * ROW_HEIGHT;
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
		};
	},

	getTableStyle: function () {
		return {
			"top": (this.state.cur.offset * (ROW_HEIGHT) + HEADER_HEIGHT) + 'px',
			"height": '10000px'
		};
	},

	getAnchorStyle: function () {
		var _this = this;
		var view = this.props.view;
		var viewData = view.synget(bw.DEF.VIEW_DATA);
		var columns = _.filter(viewData.columnList, function(col) {return col.visible;});
		var i = 0;
		var width;
		var height = ROW_HEIGHT - 2;
		var topPx = HEADER_HEIGHT + this.state.anchor.top * ROW_HEIGHT - 1;
		var leftPx = 1;
		
		columns.forEach(function (col) {
			i++;
			if (i <= _this.state.anchor.left)
				leftPx += col.width + 3;
			else if (i == _this.state.anchor.left + 1)
				width = col.width + 2;
		});
		
		return {
			"top": topPx + 'px',
			"left": leftPx + 'px',
			"minWidth": width + 'px',
			"minHeight": height + "px"
		}
	},

	render: function () {
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
			var head = <th key={"header-" + col.id} style={cellStyle}>{col.name}<span className="table-resizer"></span></th>;
			if (!!col.visible) header.push(head);
		});
		
		if (this.state) for (var i = this.state.cur.offset; i < this.state.cur.offset + this.state.cur.limit; i++) {
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
				if (i > _this.state.selection.top && i <= _this.state.selection.bottom + 1)
					cellStyle['background'] = "palegoldenrod";
				
				props.push(<td key={key} style={cellStyle} onClick={_this.handleClick}>{row.attributes[col.id]}</td>);
			});
			rows.push(<tr key={i}>{props}</tr>);
		}

		var loading = (!!this.state.fetching) ? 
			<div className="loading-banner"><span className="icon icon-cldownload"></span>Loading more data...</div>
			: void(0);
		
		return <div className="model-pane" >
			<div id="table-wrapper" className="tabular-wrapper" onScroll={this.handleScroll} ref="wrapper">
				<table id="main-data-table" className="header data-table" onKeyPress={this.handleKey} >
					<thead ref="thead" style={{top: (this.state.scrollTop + 'px')}}>
						<tr key="header">{header}</tr>
					</thead>
					<tbody ref="tbody" style={this.getTableStyle()}>
						{rows}
					</tbody>
				</table>
				<div className="anchor" ref="anchor" style={this.getAnchorStyle()}></div>
				<div className="selection" ref="selection" style={this.getSelectorStyle()}></div>
					
			</div>
			{loading}
		</div>;
	}
});


export default TabularPane;

