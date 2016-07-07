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

import ViewConfigStore from "../../../../stores/ViewConfigStore"
import storeFactory from 'flux-store-factory';
import dispatcher from '../../../../dispatcher/MetasheetDispatcher'

import createCubeStore from '../CubeStore'
import fieldTypes from "../../fields"
import CubeBodyWrapper from "./CubeBodyWrapper"
import Cursors from './Cursors'

import ScrollBar from '../../Tabular/Main/ScrollBar'
import TableMixin from '../../TableMixin.jsx'

var CLIPPING_FUDGE = 3;

var CubePane = React.createClass ({

	mixins: [TableMixin],

	getInitialState: function () {
		var view = this.props.view
		var geometry = view.data.geometry
		return {
			rowOffset: 0,
			columnOffset: 0,
		}
	},

	componentWillMount: function () {
		document.body.addEventListener('keydown', this.onKey)
		FocusStore.addChangeListener(this._onChange);
		ViewStore.addChangeListener(this._onChange);
		this.store = createCubeStore(this.props.view);
		this.store.addChangeListener(this._onChange);

		this._throttleSetCSSOffset = _.throttle(this.setCSSOffset, 15);
	},

	componentWillUnmount: function () {
		document.body.removeEventListener('keydown', this.onKey)
		FocusStore.removeChangeListener(this._onChange)
		ViewStore.removeChangeListener(this._onChange);

		if (this.store) this.store.removeChangeListener(this._onChange)
		this.store.unregister()
	},

	_onChange: function () {
		this.forceUpdate();
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
		return this.store.getCount('column') - 1;
	},

	getNumberRows: function () {
		return this.store.getCount('row') - 1;
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
		});
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
		
		var offset = $(wrapper).offset();
		var y = e.pageY - offset.top;
		var x = e.pageX - offset.left;

		var left = 0;
		var top = 0;
		
		var r;
		var c;

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
	    	style.top = (pos.top * geo.rowHeight + (fudge.top || 0) + CLIPPING_FUDGE - 1) + 'px'
	    	style.height = (geo.rowHeight * ((pos.bottom || pos.top) - pos.top + 1) + (fudge.height || 0)) + 'px'
	    } else {
	    	var top = 0;
	    	var height = 0;
	    	columnHeaders.forEach(function (header, idx) {
	    		var headerIdx = idx - columnHeaders.length;
				if (pos.top > headerIdx) top += geo.rowHeight;
				if (pos.top <= headerIdx && pos.bottom >= headerIdx) height += geo.rowHeight;
			})
			style.top = top + (fudge.top || 0) - 1 + 'px'
			style.height = height + (fudge.height || 0) + 'px'
	    }

	    if (pos.left >= 0) {
	    	style.left = (pos.left * geo.columnWidth + (fudge.left || 0) + CLIPPING_FUDGE + 1) + 'px'
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
			style.width = width + (fudge.width || 0) + 'px'
		} 

	  	return style;
	},

	updatePointer: function (pos, isMove) {
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

		// if the pointer has actually moved, then blur the old pointer
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
		this._debounceCreateViewconfig({
			view_id: view.view_id, 
			pointer: pos
		});
	},

	coalesceCells: function (pos, expand) {
		var view = this.props.view;
		var store = this.store;
		var dimension = pos.left < 0 ? 'row' : pos.top < 0 ? 'column' : 'body';
		var limit = dimension === 'row' ? this.getNumberRows() : this.getNumberCols();
		var header = dimension === 'row' ? view.row_aggregates : view.column_aggregates;
		
		var loLabel = dimension === 'row' ? 'top' : 'left';
		var hiLabel = dimension === 'row' ? 'bottom' : 'right';
		var transLoLabel = dimension === 'row' ? 'left' : 'top';
		var transHiLabel = dimension === 'row' ? 'right' : 'bottom';

		var lo = pos[loLabel];
		var hi = pos[hiLabel] || lo;

		if (pos.left >= 0 && pos.top >= 0) return pos;
		if (lo < 0 || hi < 0) throw new Error('Miscalulated cell areas');

		var sortSpec = header.slice(0, pos[(dimension === 'row' ? 'left' : 'top')] + header.length + 1).map(function(k) {
			return {attribute: 'a' + k};
		});
		while (lo > 0 && util.compare(
			sortSpec,
			store.getLevel(dimension, lo - 1),
			store.getLevel(dimension, lo),
			) === 0) lo--;
		while (hi < limit  && util.compare(
			sortSpec,
			store.getLevel(dimension, hi + 1),
			store.getLevel(dimension, hi),
			) === 0) hi++;

		pos[loLabel] = lo;
		pos[hiLabel] = hi;
		pos[transHiLabel] = pos[transLoLabel];

		return pos;
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

		if (pos.left < 0 || pos.top < 0) {
			sel = this.coalesceCells(pos);
			this.updatePointer(pos);
		} else if (shift) {
			this.scrollTo(pos);
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
			this.updatePointer(ptr);
		}
		
		this.setState({
			selection: sel,
			contextOpen: false
		});
	},

	setHorizontalScrollOffset: function (hOffset) {
		var view = this.props.view;
		var geo = view.data.geometry;
		var columnOffset = Math.floor(hOffset / geo.columnWidth);

		if (columnOffset === this.state.columnOffset) return;

		this.setState({columnOffset: columnOffset});
		this._throttleSetCSSOffset(undefined, columnOffset);
	},

	setVerticalScrollOffset: function (vOffset) {
		var view = this.props.view;
		var geo = view.data.geometry;
		var rowOffset = Math.floor(vOffset / geo.rowHeight);

		if (rowOffset === this.state.rowOffset) return;

		this.setState({rowOffset: rowOffset});
		this._throttleSetCSSOffset(rowOffset);
	},
	
	setCSSOffset: function (_rowOffset, _columnOffset) {
		var view = this.props.view;
		var geo = view.data.geometry;
		var columnOffset = (_columnOffset === undefined) ? this.state.columnOffset : _columnOffset;
		var rowOffset = (_rowOffset === undefined) ? this.state.rowOffset : _rowOffset;

		var lhsOffsetter = this.refs.tableWrapper.refs.lhsOffsetter;
		var rhsOffsetter = this.refs.tableWrapper.refs.rhsOffsetter;
		var underlay = this.refs.cursors.refs.underlayInner;
		var overlay = this.refs.cursors.refs.overlayInner;

		var translateCss = "translate3d("
			+ (-1 * columnOffset * geo.columnWidth) + "px,"
			+ (-1 * rowOffset * geo.rowHeight) + "px, 0)";

		ReactDOM.findDOMNode(lhsOffsetter).style.transform = translateCss;
		ReactDOM.findDOMNode(rhsOffsetter).style.transform = translateCss;
		ReactDOM.findDOMNode(underlay).style.transform = translateCss;
		ReactDOM.findDOMNode(overlay).style.transform = translateCss;
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

			bodyWidth: bodyWidth,
			adjustedWidth: rowHeaderWidth + bodyWidth,

			focused: focused,
			context: this.state.contextOpen,

			pointer: this.state.pointer,
			selection: this.state.selection,
			copyarea: this.state.copyarea,
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
					offset = {rowHeaderWidth}
					ref = "horizontalScrollBar"
					axis = "horizontal"
					_setScrollOffset = {this.setHorizontalScrollOffset}
					view = {view}/>
			</div>
		</div>
	}
})

export default CubePane
