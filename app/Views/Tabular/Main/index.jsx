import React from "react"
import ReactDOM from "react-dom"
import { RouteHandler } from "react-router"
import cursorStyles from "./styles/cursors.less"

import csv from 'csv'
import _ from 'underscore'
import $ from 'jquery'

import modelActionCreators from "../../../actions/modelActionCreators.jsx"

import util from "../../../util/util"
import copyTextToClipboard from "../../../util/copyTextToClipboard"

import storeFactory from 'flux-store-factory';
import dispatcher from "../../../dispatcher/MetasheetDispatcher"
import createTabularStore from '../TabularStore'

import fieldTypes from "../../fields"
import TabularBodyWrapper from "./TabularBodyWrapper"
import TableMixin from '../../TableMixin'

import ContextMenu from './ContextMenu'
import ScrollBar from "./ScrollBar"
import Cursors from "./Cursors"

import constant from "../../../constants/MetasheetConstants"

import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
import PureRenderMixin from 'react-addons-pure-render-mixin'

import ViewConfigBar from "../ViewConfigBar"

const THROTTLE_DELAY = 14;
const MIN_CYCLE = 10;
const CYCLE = 25;

const getFrame = function (f, cycle) {
	if (window.requestAnimationFrame) return window.requestAnimationFrame(f)
	else return window.setTimeout(f, cycle)
}

const cancelFrame = function (id) {
	if (window.cancelAnimationFrame) return window.cancelAnimationFrame(id)
	else return window.clearTimeout(id)
}

const TabularPane = React.createClass ({

	mixins: [TableMixin],

	getInitialState: function () {
		var viewconfig = this.props.viewconfig;
		return {
			sorting: null,
			contextOpen: false,
			detailOpen: false,
			detailWidth: 300,
			contextPosition: {left: 0, top: 0},
			hiddenColWidth: 0,

			rowOffset: viewconfig.rowOffset || 0,
			columnOffset: viewconfig.columnOffset || 0,

			expanded: false,
			context: false,
			renderSide: 'lhs',

			designMode: false
		}
	},


	componentWillMount: function () {
		const copyPasteDummy = document.getElementById('copy-paste-dummy')

		document.body.addEventListener('keydown', this.onKey);
		copyPasteDummy.addEventListener('paste', this.pasteSelection);

		this.store = createTabularStore(this.props.view);
		this.store.addChangeListener(this._onChange);

		this._throttleSetVerticalScrollOffset = _.throttle(this.setVerticalScrollOffset, 15);

	},

	componentWillUnmount: function () {
		const copyPasteDummy = document.getElementById('copy-paste-dummy');

		document.body.removeEventListener('keydown', this.onKey);
		copyPasteDummy.removeEventListener('paste', this.pasteSelection);
		
		if (this._timer) cancelFrame(this._timer)

		this.store.removeChangeListener(this._onChange);
		this.store.unregister();
	},

	componentDidMount: function () {
		var viewconfig = this.props.viewconfig;
		var copyPasteDummy = document.getElementById('copy-paste-dummy')
		copyPasteDummy.addEventListener('paste', this.pasteSelection)
		copyPasteDummy.focus();
		
		// this.scrollTo(viewconfig.rowOffset || 0);
	},

	componentWillReceiveProps: function (nextProps) {
		const cursors = ReactDOM.findDOMNode(this.refs.cursors)
		const wrapper = ReactDOM.findDOMNode(this.refs.tableWrapper)

		if (!nextProps.focused && this.props.focused) {
			cursors.classList.add('gray-out')
			wrapper.classList.add('gray-out')
		} else if (nextProps.focused && !this.props.focused) {
			cursors.classList.remove('gray-out')
			wrapper.classList.remove('gray-out')
		}
	},

	shouldComponentUpdate: function (nextProps, nextState) {
		var props = this.props
		var state = this.state

		return props.view !== nextProps.view ||
			!_.isEqual(state.selection, nextState.selection) ||
			!_.isEqual(state.pointer, nextState.pointer) ||
			this.state.contextPos !== nextState.contextPos || 
			state.copyarea !== nextState.copyarea ||
			state.contextOpen !== nextState.contextOpen ||
			state.hiddenColWidth !== nextState.hiddenColWidth;
	},

	_onChange: function () {

		if (!this.props.focused) this.blurPointer()
		this.forceUpdate()
		if (this.refs.tableWrapper) this.refs.tableWrapper.forceUpdate()
		this.refs.cursors.forceUpdate()
	},

	getTotalWidth: function () {
    	var view = this.props.view
		return util.sum(view.data.visibleCols, 'width');
	},

	getNumberCols: function () {
		return this.props.view.data.visibleCols.length - 1;
	},

	getNumberRows: function () {
		return this.store.getRecordCount() - 1;
	},

	getValueAt: function (idx) {
		return this.store.getObject(idx);
	},

	getColumnAt: function (pos) {
		var left = pos.left || 0;
		return this.props.view.data.visibleCols[left];
	},

	selectRow: function () {
		var model = this.props.model
		var view = this.props.view
		var sel = this.state.selection;
		for (let i = sel.top; i <= sel.bottom; i++) {
			var rec = this.getValueAt(i)
			modelActionCreators.selectRecord(view, rec.cid || rec[model._pk]);
		}
	},

	getRCCoords: function (e) {
		var lhs = ReactDOM.findDOMNode(this.refs.tableWrapper.refs.lhs)
		var view = this.props.view
		var geo = view.data.geometry
		var visibleCols = view.data.visibleCols
		var scrolledCols = this.state.columnOffset
		var numFixed = view.data.fixedCols.length
		var offset = $(lhs).offset()
		var y = e.pageY - offset.top
		var x = e.pageX - offset.left
		var xx = x - geo.labelWidth
		var r = Math.floor((y) / geo.rowHeight, 1)
		var c = 0

		if (x < geo.labelWidth) return {top: r, left: -1}
		
		visibleCols.some(function (col, idx) {
			if (idx < numFixed || idx - numFixed >= scrolledCols) xx -= col.width
			if (xx > 0) c++
			else return true
		})
		c = Math.min(visibleCols.length - 1, c)
		c = Math.max(0, c)
		r = Math.max(0, r)
		r = Math.min(r, this.store.getRecordCount() - 1)

		return {top: r, left: c}
	},

	editCell: function (clobber) {
		var pos = this.state.pointer
		var field = this.refs.cursors.refs.pointerCell

		if (field.handleEdit) {
			this.clearCopy()
			this.setState({editing: true})
			field.handleEdit(clobber)
		}
	},

	addRecord: function () {
		var cid = this.store.getClientId();
		var obj = {cid: cid};
		this.blurPointer();
		modelActionCreators.insertRecord(this.props.model, obj, this.store.getRecordCount())
		this.clearCopy();
		this.setState({copyarea: null});
	},

	insertRecord: function () {
		var cid = this.store.getClientId();
		var obj = {cid: cid};
		var pos = pos || this.state.pointer.top;
		var sel = this.state.selection;
		var model = this.props.model;
		this.blurPointer();
		if (pos >= sel.top && pos <= sel.bottom) {
			sel = _.clone(sel);
			sel.bottom++;
		}
		modelActionCreators.insertRecord(this.props.model, obj, pos)
		this.setState({copyarea: null, selection: sel})
	},

	clearSelection: function () {
		this.putSelection([[null]], 'clearing selection');
	},

	getSelectedRecords: function () {
		return this.store.getSelectedRecords();
	},

	deleteRecords: function () {
		var ptr = _.clone(this.state.pointer)
		var sel = _.clone(this.state.selection)
		var model = this.props.model
		var records = this.store.getSelectedRecords();
		var numRows = this.getNumberRows();
		this.blurPointer();

		if (records.length === 0) {
			this.selectRow()
			records = this.store.getSelectedRecords();
		}

		modelActionCreators.deleteMultiRecords(model, records);

		ptr.top = ptr.bottom = Math.min(ptr.top, numRows - records.length - 1);
		sel.bottom = sel.top = Math.min(sel.top, numRows - records.length );
		this.setState({copyarea: null, selection: sel, pointer: ptr});
	},

	copySelection: function (format) {
		var _this = this;
		var data = this.getSelectionData();
		csv.stringify(data, {delimiter: '\t'}, function (err, text) {
			copyTextToClipboard(text);
			_this.setState({
				copytext: text,
				copyarea: _this.state.selection,
				copydata: data
			});
			modelActionCreators.createNotification({
	        	copy: 'Selection copied to clipboard', 
	        	type: 'info',
	        	icon: ' icon-clipboard-text ',
				notification_key: 'copySuccess',
	        })
		});
	},

	clearCopy: function () {
		this.setState({
			copytext: null,
			copyarea: null,
			copydata: null
		});
		modelActionCreators.clearNotification({
			notification_key: 'copySuccess'
        });
	},

	copySelectionAsJSON: function (format) {
		var json = this.getSelectionObjects(true);
		var data = this.getSelectionObjects(false);

		copyTextToClipboard(JSON.stringify(json));

		this.setState({
			copyarea: this.state.selection,
			copydata: data
		});
	},

	getSelectionObjects: function (usePrettyNames) {
		var sel = this.state.selection;
		var json = [];
		var view = this.props.view;

		var model = this.props.model
		var view = this.props.view
		var viewconfig = ViewConfigStore.get(view.view_id);
		var sel = _.clone(this.state.selection)
		var ptr = _.clone(this.state.pointer)
		var pk = model._pk
		var selectors = []
		var numRows = this.getNumberRows()
		var numRowsDeleted 
		var records

		var records = this.getSelectionObjects()
		
		if (viewconfig.selectedRecords)
			records = Object.keys(viewconfig.selectedRecords)
				.map(function(k){return {[model._pk]: k};});
		
		else
			records = Array(sel.bottom - sel.top)
				.map((e, i) => this.getValueAt(i))
				.map(function(r){return {[model._pk]: r[model._pk]};});



		for (var r = sel.top; r <= sel.bottom; r++) {
			var obj = this.store.getObject(r);
			var jsonRow = {};
			for (var c = sel.left; c <= sel.right; c++) {
				var column = view.data.visibleCols[c]
				var type = fieldTypes[column.type]
				var value = (type.stringify ? type.stringify : _.identity)(obj[column.column_id])

				if (usePrettyNames)
					jsonRow[column.name] = value;
				else
					jsonRow[column.column_id] = value;
			}
			json.push(jsonRow);
		}
		return json;
	},

	getSelectionData: function () {
		var sel = this.state.selection;
		var data = []
		var view = this.props.view;

		for (var r = sel.top; r <= sel.bottom; r++) {
			var obj = this.store.getObject(r);
			var dataRow = [];
			for (var c = sel.left; c <= sel.right; c++) {
				var column = view.data.visibleCols[c]
				var type = fieldTypes[column.type]
				var value = (type.stringify ? type.stringify : _.identity)(obj[column.column_id])

				dataRow.push(value)
			}
			data.push(dataRow);
		}
		return data;
	},
	
	getRangeStyle: function (pos, fudge, showHiddenHack) {
		var view = this.props.view
	    var columnOffset = this.state.columnOffset
	    var visibleCols = view.data.visibleCols
	    var fixedCols = view.data.fixedCols
	    var numFixed = fixedCols.length
	    var geo = view.data.geometry
	    var width = 0
	    var left = geo.leftGutter + geo.labelWidth + 1
	    var style = this.props.style || {}
	    pos = pos || {}
	    fudge = fudge || {}

		visibleCols.forEach(function (col, idx) {
	      if (idx >= numFixed && idx < numFixed + columnOffset) return
	      if (idx < pos.left)
	        left += col.width
	      else if (idx <= (pos.right || pos.left))
	        width += col.width
	    })
		
	    style.top = (pos.top * geo.rowHeight + (fudge.top || 0)) + 'px'
	    style.left = (left + (fudge.left || 0)) + 'px'
	    style.height = (geo.rowHeight * ((pos.bottom || pos.top) - pos.top + 1) + (fudge.height || 0)) + 'px'
	    style.width = (width + (fudge.width || 0)) + 'px'

	    if (!showHiddenHack && pos.left >= numFixed && (pos.right || pos.left) < numFixed + columnOffset)
	      style.display = 'none'

	  	return style
	},

	putSelection: function (data, method) {
		var model = this.props.model
		var sel = this.state.selection;
		var patches = [];
		var view = this.props.view;

		for (var r = sel.top; r <= sel.bottom; r++) {
			var cbr = (r - sel.top) % data.length
			var row = data[cbr]
			var obj = this.store.getObject(r)
			var patch = {[model._pk]: obj[model._pk]}

			for (var c = sel.left; c <= sel.right; c++) {
				var cbc = (c - sel.left) % data[cbr].length
				var column = view.data.visibleCols[c]
				var type = fieldTypes[column.type]
				var validator = type.element.prototype.validator || _.identity
				var value = validator(data[cbr][cbc]);
				if (!type.uneditable) {
					patch[column.column_id] = value
				}
			}
			patches.push(patch)
		}
		modelActionCreators.multiPatchRecords(model, patches, {method: method})
	},

	pasteSelection: function (e) {
		const _this = this;
		const text = e.clipboardData.getData('text') || "";
		const isJsonValid = (text === this.state.copytext);

		// if the copy data is the same as the data we saved when the 
		// last copy action occured, then we have a clean copy.  Otherwise,
		// the data was likely copied from somewhere else

		if (isJsonValid) {
			this.putSelection(this.state.copydata, 'copy/paste')
		} else {
			csv.parse(text, {delimiter: '\t'}, function (err, output) {
				if (err) modelActionCreators.createNotification({
		        	narrative: 'Error parsing clipboard contents', 
		        	type: 'error-item',
		        	icon: ' icon-warning ',
					notification_key: 'paste',
					notifyTime: 3000
		        }); else _this.putSelection (output, 'copy/paste')
			});
		}
	},

	updatePointer: function (pos) {
		var oldPos = this.state.pointer
		var view = this.props.view
		var numCols = this.getNumberCols()
		var numRows = this.getNumberRows()
		
		pos.left = Math.max(Math.min(pos.left, numCols), 0)
		pos.top = Math.max(Math.min(pos.top, numRows), 0)
		
		if (pos.left !== oldPos.left ||pos.top !== oldPos.top)
			this.blurPointer()
		// save the new values to state
		
		this.setState({
			pointer: pos,
			expanded: false,
			contextOpen: false
		});
		
		// focus the paste area just in case
		document.getElementById("copy-paste-dummy").focus();

		// commit the pointer position to the view object, but debounce
		// view.data.pointer = pos
		this._debounceCreateViewconfig({
			view_id: view.view_id,
			pointer: pos
		});
	},

	updateSelect: function (pos, shift) {
		var model = this.props.model;
		var sel = this.state.selection;
		var ptr = this.state.pointer;
		var view = this.props.view;
		var numCols = this.getNumberCols();
		var numRows = this.getNumberRows();

		if (shift) {
			sel = {
				left: Math.max(Math.min(ptr.left, pos.left, numCols), 0),
				right: Math.min(Math.max(ptr.left, pos.left, 0), numCols),
				top: Math.max(Math.min(ptr.top, pos.top, numRows), 0),
				bottom: Math.min(Math.max(ptr.top, pos.top, 0), numRows)
			}
		} else {
			ptr = pos
			sel = {
				left: pos.left,
				right: pos.left,
				top: pos.top,
				bottom: pos.top
			}
			this.updatePointer(ptr)
		}
		
		this.setState({
			selection: sel,
			contextOpen: false
		})
	},

	handleClick: function (e) {
		var lhs = ReactDOM.findDOMNode(this.refs.tableWrapper.refs.lhs)
		var view = this.props.view
		var geo = view.data.geometry
		var offset = $(lhs).offset()
		var y = e.pageY - offset.top
		var x = e.pageX - offset.left
		var target = e.target
		var id = target.id
		var rx = (/lhs-tr-(c?\d+)-rowcheck/).exec(id);
		
		if (rx) modelActionCreators.selectRecord(view, rx[1]);
		if (x < geo.labelWidth) {
			e.preventDefault()
			return;
		}

		modelActionCreators.unselectRecords(view);

		this.onMouseDown(e);
	},
	

	scrollTo: function (pos) {
		var rowOffset = this.state.rowOffset
		var view = this.props.view
		var geo = view.data.geometry
		var visibleRows = this.state.visibleRows

		if (pos.top < rowOffset) 
			this.refs.verticalScrollBar.scroll(pos.top * geo.rowHeight)
		if (pos.top > (rowOffset + visibleRows - 1)) 
			this.refs.verticalScrollBar.scroll((pos.top - visibleRows) * geo.rowHeight)
	},

	setHorizontalScrollOffset: function (hOffset) {
		var _this = this;
		var view = this.props.view;
		var columns = view.data.columnList;
		var floatCols = view.data.floatCols;
		var hiddenColWidth = 0;
		var columnOffset = 0;
		var rhsHorizontalOffsetter = this.refs.tableWrapper.refs.rhsHorizontalOffsetter;
		var pointer = this.refs.cursors.refs.pointer

		floatCols.some(function (col) {
			if (hOffset > col.width + hiddenColWidth) {
				hiddenColWidth += col.width;
				columnOffset ++;
			}
			// break when we exceed hOffset
			return (col.width + hiddenColWidth > hOffset)
		});

		this.setState({
			columnOffset: columnOffset,
			hiddenColWidth: hiddenColWidth
		});
		
		
		if (hiddenColWidth !== this.state.hiddenColWidth) {
			if (this.pointerTimer) clearTimeout(this.pointerTimer)
			const pointer = ReactDOM.findDOMNode(pointer)
			if (pointer) pointer.classList.add('pointer-transitioned')
			ReactDOM.findDOMNode(rhsHorizontalOffsetter).style.marginLeft = 
				(-1 * hiddenColWidth - 1) + 'px';
			this.pointerTimer = setTimeout(function () {
				const pointer = ReactDOM.findDOMNode(pointer)
				if (pointer) pointer.classList.remove('pointer-transitioned')
				_this.pointerTimer = null
			}, 100);
		}
	},

	setVerticalScrollOffset: function (vOffset) {
		var view = this.props.view;
		var geo = view.data.geometry;
		var rowOffset = Math.floor(vOffset / geo.rowHeight);

		if (rowOffset === this.state.rowOffset) return;

		this.setState({rowOffset: rowOffset});
		
		if (!this._timer) this._timer = getFrame(this.refreshTable, CYCLE);
		this._debounceCreateViewconfig({view_id: view.view_id, rowOffset: rowOffset});
	},

	updateVerticalOffset: function () {
		var rowOffset = this.state.rowOffset;
		var view = this.props.view;
		var geo = view.data.geometry;
		
		var lhsOffsetter = this.refs.tableWrapper.refs.lhsOffsetter;
		var rhsOffsetter = this.refs.tableWrapper.refs.rhsOffsetter;
		var overlay = this.refs.cursors.refs.overlayInner;

		ReactDOM.findDOMNode(lhsOffsetter).style.transform = "translate3d(0, " + (-1 * rowOffset * geo.rowHeight ) + "px, 1px)"
		ReactDOM.findDOMNode(rhsOffsetter).style.transform = "translate3d(0, " + (-1 * rowOffset * geo.rowHeight ) + "px, 1px)"
		ReactDOM.findDOMNode(overlay).style.transform = "translate3d(0, " + ( -1 * rowOffset * geo.rowHeight + 2 ) + "px, 20px)"
	},

	refreshTable: function () {
		var now = Date.now()
		var side = this.state.renderSide
		var body = this.refs.tableWrapper.refs[side]
		var alt = this.refs.tableWrapper.refs[side === 'lhs' ? 'rhs' : 'lhs'];
		var delta = this.state.rowOffset - this.state.previousOffset
		var direction = delta > 0 ? 1 : delta < 0 ? -1 : 0;
		var isUnpainted = body.updateOffset(this.state.rowOffset, direction) || alt.isUnpainted()

		this.updateVerticalOffset();
		this._lastUpdate = now;

		if (isUnpainted || this.state.isUnpainted) 
			this._timer = getFrame(this.refreshTable, CYCLE)
		else 
			this._timer = null

		this.setState({
			previousOffset: this.state.rowOffset,
			direction: direction,
			renderSide: (side === 'lhs' ? 'rhs' : 'lhs'),
			isUnpainted: isUnpainted
		})
	},

	render: function () {
		var _this = this
		var model = this.props.model
		var view = this.props.view
		var rowCount = this.getNumberRows()
		var focused = this.props.focused
		var totalWidth = this.getTotalWidth()
		var geo = view.data.geometry

		var childProps = {
			_handleBlur: this.handleBlur,
			_handleClick: this.handleClick,
			_handlePaste: this.pasteSelection,
			_copySelection: this.copySelection,
			_copySelectionAsJSON: this.copySelectionAsJSON,
			_addRecord: this.addRecord,
			_deleteRecords: this.deleteRecords,
			_insertRecord: this.insertRecord,
			_handleContextMenu: this.showContext,
			_hideContextMenu: this.hideContext,
			_handleWheel: this.handleMouseWheel,
			_handleEdit: this.editCell,
			_updatePointer: this.updatePointer,
			_getRCCoords: this.getRCCoords,
			_getRangeStyle: this.getRangeStyle,
			_handleDrop: this.handleDrop,
			_handleDragOver: this.handleDragOver,
			// _handleStartDrag: this.handleStartDrag,

			_setVericalScrollOffset: this._throttleSetVerticalScrollOffset,
			_setHorizontalScrollOffset: this._throttleSetHorizontalScrollOffset,

			_setScrollOffset: this.setHorizontalScrollOffset,

			hiddenColWidth: this.state.hiddenColWidth,
			columnOffset: this.state.columnOffset,
			rowOffset: this.state.rowOffset,
			visibleRows: this.state.visibleRows,
			visibleHeight: this.state.visibleHeight,

			spaceTop: this.state.pointer.top - this.state.rowOffset,
    		spaceBottom: this.state.visibleRows + this.state.rowOffset - this.state.pointer.top,

			model: model,
			view: view,
			pointer: this.state.pointer,
			selection: this.state.selection,
			copyarea: this.state.copyarea,
			store: this.store,
			sorting: view.data.sorting,
			focused: this.props.focused,
			expanded: this.state.expanded
		}

		/*
		 * Scrolling and the render cycle are handled in this element by the update*Offset and refreshTable methods
		 * Fetching and rendering of the actual table is handled by the TabularBodyWrapper element
		 * Curors is an overlay containing the selection, the highlighted cell and a few other items
		 * Scrollbars are... scrollbars
		 */
		
		return <div ref="wrapper"
			className = {`wrapper table-top-wrapper`}
			beforePaste = {this.beforePaste}>

			<TabularBodyWrapper {...childProps}
				designMode = {true}
				ref = "tableWrapper"/>
			
			<Cursors {...childProps}
				ref = "cursors"/>

			<ScrollBar {...childProps}
				innerDimension = {(rowCount + 4) * geo.rowHeight + geo.headerHeight}	
				rowCount = {rowCount}
				offset = {geo.headerHeight}
				ref = "verticalScrollBar"
				axis = "vertical"
				_setScrollOffset = {this.setVerticalScrollOffset}/>
			
			<ScrollBar {...childProps}
				innerDimension = {view.data.floatWidth + view.data.fixedWidth + geo.labelWidth + 200}
				rowCount = {rowCount}
				offset = {0}
				ref = "horizontalScrollBar"
				axis = "horizontal"
				_setScrollOffset = {this.setHorizontalScrollOffset}/>

			{this.state.contextPos ? 
				<ContextMenu {...childProps} 
					position={this.state.contextPos}/> 
				: null}

		</div>
	}
})

export default TabularPane
