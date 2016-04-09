import React from "react"
import ReactDOM from "react-dom"
import _ from 'underscore'
import $ from 'jquery'

import util from '../../../../util/util'

import './style.less'

import modelActionCreators from "../../../../actions/modelActionCreators.jsx"

import ModelStore from "../../../../stores/ModelStore"
import KeyStore from "../../../../stores/KeyStore"
import ViewStore from "../../../../stores/ViewStore"
import KeycompStore from "../../../../stores/KeycompStore"
import AttributeStore from "../../../../stores/AttributeStore"
import FocusStore from "../../../../stores/FocusStore"

import ViewDataStores from "../../../../stores/ViewDataStores"
import storeFactory from 'flux-store-factory';
import dispatcher from '../../../../dispatcher/MetasheetDispatcher'

import createCubeStore from './CubeStore.jsx'
import fieldTypes from "../../fields"
import CubeBodyWrapper from "./CubeBodyWrapper"
import Cursors from './Cursors'

import ScrollBar from '../../Tabular/Main/ScrollBar'
import TableMixin from '../../TableMixin.jsx'

var CubePane = React.createClass ({

	mixins: [TableMixin],

	getInitialState: function () {
		var view = this.props.view
		var geometry = view.data.geometry
		return {
			scrollTop: 0,
			scrollLeft: 0,
			actRowHt: geometry.rowHeight
		}
	},

	componentWillMount: function () {
		document.body.addEventListener('keydown', this.onKey)
		FocusStore.addChangeListener(this._onChange)
		this.store = createCubeStore(this.props.view)
		this.store.addChangeListener(this._onChange)
		this._debounceCreateView = _.debounce(this.createView, 500)
	},

	componentWillUnmount: function () {
		document.body.removeEventListener('keydown', this.onKey)
		FocusStore.removeChangeListener(this._onChange)
		if (this.store) this.store.removeChangeListener(this._onChange)
		this.store.unregister()
	},

	_onChange: function () {
		this.forceUpdate()
	},

	createView: function (view) {
		modelActionCreators.createView(view, false, false, true)
	},

	onScroll: function (event) {
		var wrapper = ReactDOM.findDOMNode(this.refs.wrapper)
		this.setState({
			scrollTop: wrapper.scrollTop,
			scrollLeft: wrapper.scrollLeft
		})
	},

	editCell: function (e) {
		var pos = this.state.pointer;
		var field = this.refs.cursors.refs.pointerCell;
		if (!field.handleEdit) return;
		
		this.setState({
			editing: true,
			copyarea: null
		});
		field.handleEdit(e);
	},

	getNumberCols: function () {
		return this.store.getCount('column');
	},

	getNumberRows: function () {
		return this.store.getCount('row');
	},

	scrollTo: function () {

	},

	selectRow: function () {
		var view = this.props.view;
		var numGroupCols = view.row_aggregates.length;
		var ptr = this.state.pointer;
		ptr.left = ((Math.min(ptr.left, 0)) % numGroupCols) - 1;
		this.updateSelect(ptr.top, ptr.left);
	},

	insertRecord: function () {
		var obj = {};
		var model = this.props.model;
		var rowLevel = this.store.getLevel('rows', this.state.pointer.top);
		var colLevel = this.store.getLevel('columns', this.state.pointer.left);

		// initialize the new record with default values
		AttributeStore.query({model_id: (model.model_id || model.cid)}).forEach(function(attr) {
			if(('a' + attr.attribute_id) != model._pk) {
				obj['a' + attr.attribute_id] = attr.default_value
			}
		})
		// override defaults based on the location in the cube
		obj = _.omit(_.extend(obj, rowLevel, colLevel), 'spans')
 
		modelActionCreators.insertRecord(this.props.model, obj)
		this.setState({copyarea: null})
	},

	deleteRecord: function () {

	},

	copySelection: function () {

	},

	openContextMenu: function (event) {
		event.preventDefault();
		var rc = this.getRCCoords(event)
		var sel = this.state.selection
		var geo = this.props.view.data.geometry
		modelActionCreators.setFocus('view')
		if (rc.row > sel.bottom || rc.row < sel.top ||
			rc.col > sel.right || rc.col < sel.left)
			this.updateSelect(rc.row, rc.col, false, false)

		this.setState({
			contextOpen: true,
			contextX: 20,
			contextY: rc.top * geo.rowHeight
		})
	},

	getRCCoords: function (e) {
		var store = this.store;
		var wrapper = ReactDOM.findDOMNode(this.refs.tableWrapper.refs.tbodyWrapper)
		var view = this.props.view
		var geo = view.data.geometry

		var numColumns = store.getCount('column');
		var numRows = store.getCount('row');

		var getColumns = (c => view.data.columns['a' + c]);
		
		var columnHeaders = view.column_aggregates.map(getColumns);
		var columnHeaderHeight = columnHeaders.length * geo.rowHeight;

		var rowHeaders = view.row_aggregates.map(getColumns);
		var rowHeaderWidth = util.sum(rowHeaders, 'width');
		
		var offset = $(wrapper).offset()
		var y = e.pageY - offset.top
		var x = e.pageX - offset.left

		var left = 0
		var top = 0
		
		var r
		var c

		if (x < rowHeaderWidth) {
			rowHeaders.some(function (header, idx) {
				left += header.width
				if (left < x) return false
				c = idx - rowHeaders.length
				return true
			});
		} else  { // (x >= rowHeaderWidth)
			c = Math.floor((x - rowHeaderWidth) / geo.columnWidth, 1)
			c = Math.min(numColumns - 1, c)
		}

		if (y < columnHeaderHeight) {
			columnHeaders.some(function (header, idx) {
				top += geo.rowHeight
				if (top < y) return false
				r = idx - columnHeaders.length
				return true
			});
		} else { // (y >= columnHeaderHeight)
			r = Math.floor((y - columnHeaderHeight) / geo.rowHeight, 1)
			r = Math.min(numRows - 1, r)
		}

		if (r < 0 && c < 0) r = 0
		return {top: r, left: c}
	},

	getRangeStyle: function (pos, fudge) {
		var store = this.store;
		var view = this.props.view;
	    var geo = view.data.geometry;
	    
	    // this is repetitive, not sure what to do about it though
	    var numColumns = store.getCount('column');
		var getColumns = (c => view.data.columns['a' + c]);
		var columnHeaders = view.column_aggregates.map(getColumns);
		var columnHeaderHeight = columnHeaders.length * geo.rowHeight;

		var numRows = store.getCount('row');
		var rowHeaders = view.row_aggregates.map(getColumns);
		var rowHeaderWidth = util.sum(rowHeaders, 'width');
		
	    var style = this.props.style || {};

	    pos = pos || {};
	    fudge = fudge || {};

	    if (pos.top >= 0) {
	    	style.top = (columnHeaderHeight + pos.top * geo.rowHeight + (fudge.top || 0)) + 'px'
	    	style.height = (geo.rowHeight * ((pos.bottom || pos.top) - pos.top + 1) + (fudge.height || 0)) + 'px'
	    } else {
	    	var top = 0;
	    	var height = 0;
	    	columnHeaders.forEach(function (header, idx) {
	    		var headerIdx = idx - columnHeaders.length;
				if (pos.top > headerIdx) top += geo.rowHeight;
				if (pos.top <= headerIdx && pos.bottom >= headerIdx) height += geo.rowHeight;
			})
			style.top = top + (fudge.top || 0) + 'px'
			style.height = height + (fudge.height || 0) + (Math.max(pos.bottom, 0) * geo.rowHeight) + 'px'
	    }

	    if (pos.left >= 0) {
	    	style.left = (rowHeaderWidth + pos.left * geo.columnWidth + (fudge.left || 0)) + 'px'
	    	style.width = (geo.columnWidth * ((pos.right || pos.left) - pos.left + 1) + (fudge.width || 0)) + 'px'
	    } else  {
	    	var left = 0;
	    	var width = 0;
	    	rowHeaders.forEach(function (header, idx) {
	    		var headerIdx = idx - rowHeaders.length
				if (pos.left > headerIdx) left += header.width
				if (pos.left <= headerIdx && pos.right >= headerIdx) width += header.width
			})
			style.left = left + (fudge.left || 0) + 'px'
			style.width = width + (fudge.width || 0) + (Math.max(pos.right, 0) * geo.columnWidth) + 'px'
		} 

	  	return style;
	},

	updatePointer: function (pos) {
		var oldPos = this.state.pointer;
		var view = this.props.view;
		var numCols = this.getNumberCols();
		var numRows = this.getNumberRows();
		var store = this.store
		
		var columnHeaders = store.getDimensions('column');
    	var rowHeaders = store.getDimensions('row');
		var numColumnHeaders = columnHeaders.length;
		var numRowHeaders = rowHeaders.length;

		pos.left = Math.max(Math.min(pos.left, numCols), -1 * numRowHeaders);
		pos.top = Math.max(Math.min(pos.top, numRows), -1 * numColumnHeaders);
		pos.bottom = pos.bottom || pos.top;
		pos.right = pos.right || pos.left;

		if (pos.left !== oldPos.left ||pos.top !== oldPos.top)
			this.blurPointer();
		// save the new values to state
		
		this.setState({
			pointer: pos,
			expanded: false,
			contextOpen: false
		});
		this.scrollTo(pos);
		
		// focus the paste area just in case
		document.getElementById("copy-paste-dummy").focus();

		// commit the pointer position to the view object, but debounce
		view.data.pointer = pos;

		this._debounceCreateView(view, false, false, true);
	},

	updateSelect: function (pos, shift) {
		var sel = this.state.selection;
		var ptr = this.state.pointer;
		var view = this.props.view;
		var store = this.store;

		var numCols = this.getNumberCols();
		var numRows = this.getNumberRows();
		var columnHeaders = view.column_aggregates;
    	var rowHeaders = view.row_aggregates;
		var numColumnHeaders = columnHeaders.length;
		var numRowHeaders = rowHeaders.length;

		if (pos.left < 0) {
			var top = pos.top;
			var bottom = pos.top;
			pos.bottom = pos.top;

			var sortSpec = rowHeaders.slice(0, pos.left + numRowHeaders + 1).map(function(k) {
				return {attribute_id: k};
			});
			
			while (top > 0 && util.compare(
				store.getLevel('row', top - 1),
				store.getLevel('row', pos.top),
				sortSpec) === 0) top--;
			while (bottom < numRows - 1 && util.compare (
				store.getLevel('row', bottom + 1), 
				store.getLevel('row', pos.bottom), 
				sortSpec) === 0) bottom++;
			pos.top = top;
			pos.bottom = bottom;
			pos.right = pos.left;
			sel = {
				left: Math.max(Math.min(pos.left, numCols), -1 * numRowHeaders),
				right: numCols,
				top: Math.max(Math.min(pos.top, numRows), -1 * numColumnHeaders),
				bottom: pos.bottom
			}
			this.updatePointer(pos);
		} else if (pos.top < 0) {
			var left = pos.left;
			var right = pos.left;
			pos.right = pos.left;

			var sortSpec = columnHeaders.slice(0, pos.top + numColumnHeaders + 1).map(function(k) {
				return {attribute_id: k}
			});
			
			while (left > 0 && util.compare(
				store.getLevel('column', left - 1),
				store.getLevel('column', pos.left),
				sortSpec) === 0) left--;
			while (right < numCols - 1 && util.compare (
				store.getLevel('column', right + 1), 
				store.getLevel('column', pos.right), 
				sortSpec) === 0) right++;
			pos.left = left
			pos.right = right
			pos.bottom = pos.top
			sel = {
				top: Math.max(Math.min(pos.top, numRows), -1 * numColumnHeaders),
				bottom: numRows,
				left: Math.max(Math.min(pos.left, numCols), -1 * numRowHeaders),
				right: pos.right
			}
			this.updatePointer(pos);
		} else if (shift) {
			this.scrollTo(pos)
			sel = {
				left: Math.max(Math.min(ptr.left, pos.left, numCols), -1 * numRowHeaders),
				right: Math.min(Math.max(ptr.left, pos.left, 0), numCols),
				top: Math.max(Math.min(ptr.top, pos.top, numRows), -1 * numColumnHeaders),
				bottom: Math.min(Math.max(ptr.top, pos.top, 0), numRows)
			}
		} else {
			ptr = pos
			sel = {
				left: Math.max(Math.min(pos.left, numCols), -1 * numRowHeaders),
				right: Math.max(Math.min(pos.left, numCols), -1 * numRowHeaders),
				top: Math.max(Math.min(pos.top, numRows), -1 * numColumnHeaders),
				bottom: Math.max(Math.min(pos.top, numRows), -1 * numColumnHeaders)
			}
			this.updatePointer(ptr)
		}
		
		this.setState({
			selection: sel,
			contextOpen: false
		})
	},

	setHorizontalScrollOffset: function (hOffset) {
		
	},

	setVerticalScrollOffset: function (vOffset) {
		var view = this.props.view;
		var geo = view.data.geometry;
		var rowOffset = Math.floor(vOffset / geo.rowHeight);
		
		var rowHeaderOffsetter = this.refs.tableWrapper.refs.rowHeaderOffsetter;
		var rhsOffsetter = this.refs.tableWrapper.refs.bodyOffsetter;
		var underlay = this.refs.cursors.refs.underlayInner;
		var overlay = this.refs.cursors.refs.overlayInner;

		if (rowOffset === this.state.rowOffset) return;

		ReactDOM.findDOMNode(rowHeaderOffsetter).style.transform = "translate3d(0, " + (-1 * rowOffset * geo.rowHeight) + "px, 0)"
		ReactDOM.findDOMNode(rhsOffsetter).style.transform = "translate3d(0, " + (-1 * rowOffset * geo.rowHeight) + "px, 0)"
		ReactDOM.findDOMNode(underlay).style.transform = "translate3d(0, " + ( -1 * rowOffset * geo.rowHeight) + "px, 0)"
		ReactDOM.findDOMNode(overlay).style.transform = "translate3d(0, " + ( -1 * rowOffset * geo.rowHeight) + "px, 0)"

		this.setState({
			rowOffset: rowOffset
		})
		
		// if (!this._timer) this._timer = getFrame(this.refreshTable, CYCLE)
	},

	render: function () {
		var _this = this;
		var store = this.store;
		var model = this.props.model;
		var view = this.props.view;
		var geo = view.data.geometry;
		var scrollLeft = this.state.scrollLeft;
		var scrollTop = this.state.scrollTop;
		var height = this.state.actRowHt;
		var childProps = _.clone(this.props);
		var numColumns = store.getCount('column');
		var numRows = store.getCount('row');
		var getColumns = (c => view.data.columns['a' + c]);
		var rowHeaders = view.row_aggregates.map(getColumns);
		var columnHeaders = view.column_aggregates.map(getColumns);
		var rowHeaderWidth = util.sum(rowHeaders, 'width');
		var bodyWidth = numColumns * geo.columnWidth;
		var focused = (FocusStore.getFocus(0) == 'view');


		Object.assign(childProps, {
			_getRangeStyle: this.getRangeStyle,
			_handleClick: this.onMouseDown,
			_handleBlur: this.handleBlur,
			_handlePaste: this.pasteSelection,
			_copySelection: this.copySelection,
			_addRecord: this.addRecord,
			_deleteRecords: this.deleteRecords,
			_insertRecord: this.insertRecord,
			_handleContextMenu: this.showContext,
			_hideContextMenu: this.hideContext,
			_handleWheel: this.handleMouseWheel,
			_handleEdit: this.editCell,
			
			store: this.store,

			hOffset: this.state.hOffset,
			vOffset: this.state.vOffset,
			scrollTop: scrollTop,
			scrollLeft: scrollLeft,

			rowHeaders: rowHeaders,
			rowHeaderWidth: rowHeaderWidth,
			columnHeaders: columnHeaders,
			columnHeaderHeight: columnHeaders.length * geo.rowHeight,

			numColumns: numColumns,
			numRows: numRows,

			rowHeaderWidth: rowHeaderWidth,
			bodyWidth: bodyWidth,
			adjustedWidth: rowHeaderWidth + bodyWidth,

			focused: focused,

			pointer: this.state.pointer,
			selection: this.state.selection,
			copyarea: this.state.copyarea
		});

		return <div className = "model-panes">
			<div className="view-body-wrapper">
				<CubeBodyWrapper 
					{...childProps} 
					store = {this.store} 
					ref = "tableWrapper"/>

				<Cursors 
					{...childProps} 
					ref = "cursors"/>

				<ScrollBar
					innerDimension = {(numRows + 1) * geo.rowHeight}
					offset = {columnHeaders.length * geo.rowHeight}
					ref = "verticalScrollBar"
					axis = "vertical"
					_setScrollOffset = {this.setVerticalScrollOffset}
					view = {view}/>
				
				<ScrollBar
					innerDimension = {bodyWidth}
					offset = {rowHeaderWidth + 100}
					ref = "horizontalScrollBar"
					axis = "horizontal"
					_setScrollOffset = {this.setHorizontalScrollOffset}
					view = {view}/>
			</div>
		</div>
	}
})

export default CubePane
