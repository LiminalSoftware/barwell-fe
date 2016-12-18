import React from "react"
import update from 'react/lib/update'
import ReactDOM from "react-dom"
import { RouteHandler } from "react-router"

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
import ScrollBar from "../../../components/ScrollBar"
import Cursors from "./Cursors"

import constants from "../../../constants/MetasheetConstants"

import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
import PureRenderMixin from 'react-addons-pure-render-mixin'

import ViewConfigBar from "../ViewConfigBar"

const THROTTLE_DELAY = 14;
const MIN_CYCLE = 5;
const CYCLE = 0;


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
		this._debounceCalibrate = _.debounce(this.calibrate, 100)

		document.body.addEventListener('keydown', this.onKey);
		document.body.addEventListener('keyup', this.onKeyUp);
		window.addEventListener('resize', this._debounceCalibrate)
		copyPasteDummy.addEventListener('paste', this.pasteSelection);

		this.store = createTabularStore(this.props.view);
		this.store.addChangeListener(this._onStoreChange);
		

	},

	componentWillUnmount: function () {
		const copyPasteDummy = document.getElementById('copy-paste-dummy');

		document.body.removeEventListener('keydown', this.onKey);
		document.body.removeEventListener('keyup', this.onKeyUp);
		window.removeEventListener('resize', this._debounceCalibrate)
		copyPasteDummy.removeEventListener('paste', this.pasteSelection);
		
		if (this._frameTimer) util.cancelFrame(this._frameTimer)

		this.store.removeChangeListener(this._onStoreChange);
		this.store.unregister();
	},

	componentDidMount: function () {
		var viewconfig = this.props.viewconfig;
		var copyPasteDummy = document.getElementById('copy-paste-dummy')
		copyPasteDummy.addEventListener('paste', this.pasteSelection)
		copyPasteDummy.focus();

		this.calibrate()
		
		// this.scrollTo(viewconfig.rowOffset || 0);
	},

	componentWillReceiveProps: function (nextProps) {
		if (!nextProps.focused && this.props.focused) {
			this.hideContext()
			this.blurPointer()
		}
	},

	shouldComponentUpdate: function (nextProps, nextState) {
		var props = this.props
		var state = this.state

		return props.view !== nextProps.view ||
			!_.isEqual(state.selection, nextState.selection) ||
			!_.isEqual(state.pointer, nextState.pointer) ||
			props.focused !== nextProps.focused ||
			state.contextRc !== nextState.contextRc || 
			state.contextSubject !== nextState.contextSubject || 
			state.isMouseDown !== nextState.isMouseDown ||
			state.copyarea !== nextState.copyarea ||
			state.contextOpen !== nextState.contextOpen ||
			state.contextPosition !== nextState.contextPosition ||
			state.hiddenColWidth !== nextState.hiddenColWidth ||
			state.clientWidth !== nextState.clientWidth || 
			state.clientHeight !== nextState.clientHeight ||
			state.resizeColumn !== nextState.resizeColumn
	},

	_onStoreChange: function () {
		const tableWrapper = this.refs.tableWrapper
		const cursors = this.refs.cursors
		const lhs = tableWrapper ? tableWrapper.refs.lhs : null
		const rhs = tableWrapper ? tableWrapper.refs.rhs : null
		
		this.forceUpdate()
		if (tableWrapper) tableWrapper.forceUpdate()
		if (cursors) cursors.forceUpdate()
		if (lhs) lhs.forceUpdate()
		if (rhs) rhs.forceUpdate()	
	},

	getTotalWidth: function () {
    	var view = this.props.view
		return util.sum(view.data._visibleCols, 'width');
	},

	getNumberCols: function () {
		return this.props.view.data._visibleCols.length - 1;
	},

	getNumberRows: function () {
		return this.store.getRecordCount() - 1;
	},

	getValueAt: function (idx) {
		return this.store.getObject(idx);
	},

	getColumnAt: function (pos) {
		var left = pos.left || 0;
		return this.props.view.data._visibleCols[left];
	},

	getColumnRefAt: function (pos) {
		const data = this.props.view.data
		const col = this.getColumnAt(pos)
		const isPinned = (pos.left < data._fixedCols.length)
		const header = this.refs.tableWrapper.refs[isPinned ? "lhsHead":"rhsHead"]
		
		return header.refs['head-' + col.column_id]	
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

	boundRCCoords: function (rc) {
		rc = rc || {}
		var visibleCols = this.props.view.data._visibleCols
		rc.left = Math.min(visibleCols.length - 1, rc.left)
		rc.left = Math.max(0, rc.left)
		rc.top = Math.max(0, rc.top)
		rc.top = Math.min(rc.top, this.store.getRecordCount() - 1)
		return rc
	},

	getBoundedRCCoords: function (e) {
		return this.boundRCCoords(this.getRCCoords(e))
	},

	getRCCoords: function (e) {
		const lhs = ReactDOM.findDOMNode(this.refs.tableWrapper.refs.lhs)
		const offset = $(lhs).offset()
		const {view} = this.props
		const {geometry: geo, _visibleCols: visibleCols} = view.data
		
		const scrolledCols = this.state.columnOffset
		const numFixed = view.data._fixedCols.length
		
		const y = e.pageY - offset.top
		const x = e.pageX - offset.left
		let xx = x - geo.labelWidth
		const r = Math.floor((y) / geo.rowHeight, 1)
		var c = 0

		if (x < geo.labelWidth) return {top: r, left: -1}
		
		visibleCols.some(function (col, idx) {
			if (idx < numFixed || idx - numFixed >= scrolledCols) xx -= col.width
			if (xx > 0) c++
			else return true
		})
		if (xx > geo.colAddWidth) c = null

		return {top: r, left: c}
	},

	setResizeColumn: function (resizeColumn) {
		if (resizeColumn === null) this.setState({resizeColumn: resizeColumn, dragOffset: 0})
		else this.setState({resizeColumn: resizeColumn})
	},

	setColumnSize: function (offset) {
		this.setState({dragOffset: offset})
		this.refs.cursors.setState({dragOffset: offset})
		this.refs.tableWrapper.setState({dragOffset: offset})
	},
	// ========================================================================
	// data operations (edit, add new, delete, copy/paste)
	// ========================================================================

	editCell: function (clobber) {
		const refPath = ['cursors','pointer','pointerCell']
		const field = refPath.reduce(
			(head, ref) => head ? head.refs[ref] : null, this)
		
		if (field && field.handleEdit) {
			this.clearCopy()
			this.setState({editing: true})
			field.handleEdit(clobber)
		} else {
			console.log('couldnt find path')
		}
	},

	addRecord: function (e) {
		this.blurPointer();
		modelActionCreators.insertRecord(
			this.props.model, 
			this.props.view,
			null,
			this.store.getRecordCount()
		)
		this.clearCopy();
		this.setState({copyarea: null});
		if (e) e.preventDefault() && util.clickTrap(e)
	},

	insertRecord: function () {
		const {model, view} = this.props
		let {selection: sel, pointer} = this.state
		let pos = pos || pointer.top;
		
		this.blurPointer();
		
		if (pos >= sel.top && pos <= sel.bottom)
			sel = update(sel, {bottom: {$apply: (b=>b++)}})
		
		modelActionCreators.insertRecord(
			this.props.model, 
			this.props.view,
			null,
			pos
		)
		this.setState({copyarea: null, selection: sel})
	},

	clearSelection: function () {
		this.putSelection([[null]], 'clearing selection');
	},

	getSelectedRecords: function () {
		return this.store.getSelectedRecords();
	},

	deleteRecords: function () {
		const {view, model} = this.props
		const {pointer: ptr, selection: sel} = this.state
		var records = this.store.getSelectedRecords();
		var numRows = this.getNumberRows();
		const top = Math.min(ptr.top, numRows - records.length - 2);
		const bottom = top
		
		this.blurPointer();

		if (records.length === 0) {
			this.selectRow(view)
			records = this.store.getSelectedRecords();
		}

		modelActionCreators.deleteMultiRecords(model, records);

		this.setState({
			copyarea: null, 
			selection: update(sel, {
				top: {$set: top},
				bottom: {$set: bottom}
			}), 
			pointer: update(ptr, {
				top: {$set: top}
			})
		});

		modelActionCreators.unselectRecords(view)
		this.refreshTable()
	},

	copySelection: function (format) {
		var _this = this;
		var data = this.getSelectionData();
		csv.stringify(data, {delimiter: '\t'}, function (err, text) {
			copyTextToClipboard(text);
			_this.setState({
				copytext: text.trim(),
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
		
		var json = [];
		var view = this.props.view;
		var model = this.props.model
		
		var sel = this.state.selection
		var pk = model._pk

		var records = this.store.getSelectionObjects()

		for (var r = sel.top; r <= sel.bottom; r++) {
			var obj = this.store.getObject(r)
			var jsonRow = {}
			for (var c = sel.left; c <= sel.right; c++) {
				var column = view.data._visibleCols[c]
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
				var column = view.data._visibleCols[c]
				var type = fieldTypes[column.type]
				var value = (type.stringify ? type.stringify : _.identity)(obj[column.column_id])

				dataRow.push(value)
			}
			data.push(dataRow);
		}
		return data;
	},

	calibrate: function () {
		const el = ReactDOM.findDOMNode(this)
		this.setState({
			clientWidth: el.clientWidth,
			clientHeight: el.clientHeight
		})
	},

	calculateRhsSpace: function () {
		var el = ReactDOM.findDOMNode(this)
		return $('#application').outerWidth() - 
			$(el).offset().left - 
			$(el).outerWidth()
	},

	showAddAttribute: function (e) {
		const {view, model} = this.props
		const numVisCols = view.data._visibleCols.length
		rc = {
			left: numVisCols,
			top: 0
		}

		this.getFocus('-context')
		this.setState({
			contextPos: {x: 0, y: 0}, 
			contextColumn: this.getColumnAt(rc),
			contextType: 'newAttribute',
			contextElement: this.getColumnRefAt(rc),
			contextOpen: true,
			contextRc: rc
		})
		
	},

	showContext: function (e) {
		const {view, model} = this.props
		const offset = $(this.refs.wrapper).offset()
		const y = e.pageY - offset.top
		const x = e.pageX - offset.left
		const rc = this.getRCCoords(e)
		const sel = this.state.selection
		const geo = view.data.geometry
		const numVisCols = view.data._visibleCols.length
		
		if (y < geo.headerHeight && rc.left <= numVisCols) {
			this.getFocus('-context')
			this.setState({
				contextPos: {x: x, y: y}, 
				contextColumn: this.getColumnAt(rc),
				contextType: 'header',
				contextElement: this.getColumnRefAt(rc),
				contextOpen: true,
				contextRc: rc
			})
		} else if (rc.left < numVisCols) {
			this.getFocus('-context')
			
			if (rc.left < sel.left ||
			rc.left > sel.right || 
			rc.top < sel.top || 
			rc.top > sel.bottom) {
				this.updateSelect(rc, false)
			}

			this.setState({
				contextPos: {x: x, y: y}, 
				contextElement: null,
				contextOpen: true,
				contextRc: rc
			})
		}

		e.preventDefault();
	},
	
	getRangeStyle: function (pos = {}, showHiddenHack = false) {
		const {view} = this.props
		const {resizeColumn, dragOffset, columnOffset} = this.state
		const {_visibleCols: visibleCols, _fixedCols: fixedCols} = view.data
	    const numFixed = fixedCols.length
	    const geo = view.data.geometry
	    const isHidden = (
			!showHiddenHack && 
			pos.left >= numFixed && 
			(pos.right || pos.left) < numFixed + columnOffset
		)
	    let width = 0
	    let left = geo.leftGutter + geo.labelWidth + 1
	    
		visibleCols.forEach(function (col, idx) {
			const colWidth = col.width + (resizeColumn === col.column_id ? (dragOffset || 0) : 0)

	    	if (idx >= numFixed && idx < numFixed + columnOffset) return
	    	
	    	if (idx < pos.left)
	        	left += colWidth
	    	else if (idx <= (pos.right || pos.left))
	    		width += colWidth
	    })
		
	  	return {
	  		top: pos.top * geo.rowHeight,
		    left: left,
		    height: geo.rowHeight * ((pos.bottom || pos.top) - pos.top + 1),
		    width: width,
		    maxWidth: isHidden ? 0 : width,
		    opacity: isHidden ? 0 : 1
	  	}
	},

	putSelection: function (data, method, isValidated) {
		const model = this.props.model
		const sel = this.state.selection
		const view = this.props.view
		let patches = []

		for (let r = sel.top; r <= sel.bottom; r++) {
			const cbr = (r - sel.top) % data.length
			const row = data[cbr]
			const obj = this.store.getObject(r)
			let patch = {[model._pk]: obj[model._pk]}

			for (let c = sel.left; c <= sel.right; c++) {
				const cbc = (c - sel.left) % data[cbr].length
				const column = view.data._visibleCols[c]
				const type = fieldTypes[column.type]
				const parser = type.parser
				const value = (isValidated || !parser) ? 
					data[cbr][cbc] : 
					parser(data[cbr][cbc], column)
				
				if (!type.uneditable) {
					patch[column.column_id] = value
				}
			}
			patches.push(patch)
		}
		modelActionCreators.multiPatchRecords(model, patches, {method: method})
	},

	pasteSelection: function (e) {
		if (!this.props.focused) return;
		const _this = this;
		const text = (e ? e.clipboardData.getData('text').trim() 
				: window.clipboardData.getData('Text'))
		 || "";
		const isJsonValid = (text === this.state.copytext);

		// if the copy data is the same as the data we saved when the 
		// last copy action occured, then we have a clean copy.  Otherwise,
		// the data was likely copied from somewhere else

		if (isJsonValid) {
			this.putSelection(this.state.copydata, 'copy/paste', true)
		} else {
			csv.parse(text, {delimiter: '\t'}, function (err, output) {
				if (err) modelActionCreators.createNotification({
		        	narrative: 'Error parsing clipboard contents', 
		        	type: 'error-item',
		        	icon: ' icon-warning ',
					notification_key: 'paste',
					notifyTime: 3000
		        }); else _this.putSelection (output, 'copy/paste', false)
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
			contextOpen: false
		});
		
		// focus the paste area just in case
		document.getElementById("copy-paste-dummy").focus();
	},

	updateSelect: function (_pos, shift) {
		const {model, view} = this.props
		const geo = view.data.geometry
		let {selection: sel, pointer: ptr, visibleRows, rowOffset} = this.state
		const pos = this.boundRCCoords(_pos)
		
		var numCols = this.getNumberCols();
		var numRows = this.getNumberRows();

		var rowHeight = view.data.geometry.rowHeight
		

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
		
		if (pos.top < rowOffset)
			this.refs.verticalScrollBar.scrollTo(pos.top * geo.rowHeight)
		else if (pos.top > rowOffset + visibleRows) 
			this.refs.verticalScrollBar.scrollTo((pos.top + 1 - visibleRows) * geo.rowHeight)
		
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
			this.refs.verticalScrollBar.doScroll(pos.top * geo.rowHeight)
		if (pos.top > (rowOffset + visibleRows - 1)) 
			this.refs.verticalScrollBar.doScroll((pos.top - visibleRows) * geo.rowHeight)
	},

	setHorizontalScrollOffset: function (hOffset) {
		var _this = this;
		var view = this.props.view;
		var columns = view.data._columnList;
		var floatCols = view.data._floatCols;
		var hiddenColWidth = 0;
		var columnOffset = 0;
		var rhsHorizontalOffsetter = this.refs.tableWrapper.refs.rhsHorizontalOffsetter;


		floatCols.some(function (col) {
			if (hOffset > col.width + hiddenColWidth) {
				hiddenColWidth += col.width;
				columnOffset ++;
			}
			// break when we exceed hOffset
			return (col.width + hiddenColWidth > hOffset)
		});

		if (hiddenColWidth !== this.state.hiddenColWidth) {
			ReactDOM.findDOMNode(rhsHorizontalOffsetter).style.marginLeft = 
				(-1 * hiddenColWidth) + 'px';
		}

		this.setState({
			columnOffset: columnOffset,
			hiddenColWidth: hiddenColWidth
		});

		this.enqueueRefresh()
	},

	setVerticalScrollOffset: function (vOffset) {
		var view = this.props.view;
		var geo = view.data.geometry;
		var rowOffset = Math.floor(vOffset / geo.rowHeight);

		if (rowOffset === this.state.rowOffset) return;

		this.setState({rowOffset: rowOffset});
		
		this.enqueueRefresh()
	},

	updateVerticalOffset: function () {
		var rowOffset = this.state.rowOffset;
		var view = this.props.view;
		var geo = view.data.geometry;
		
		var lhsOffsetter = ReactDOM.findDOMNode(this.refs.tableWrapper.refs.lhsOffsetter)
		var rhsOffsetter = ReactDOM.findDOMNode(this.refs.tableWrapper.refs.rhsOffsetter)
		var overlay = this.refs.cursors ? 
			ReactDOM.findDOMNode(this.refs.cursors.refs.overlayInner)
			: null

		lhsOffsetter.style.transform = 
			"translate3d(0, " + Math.floor(-1 * rowOffset * geo.rowHeight) + "px, 0)"
		rhsOffsetter.style.transform = 
			"translate3d(0, " + Math.floor(-1 * rowOffset * geo.rowHeight ) + "px, 0)"
		if (overlay) overlay.style.transform = 
			"translate3d(0, " + Math.floor( -1 * rowOffset * geo.rowHeight + 2 ) + "px, 0)"
	},

	enqueueRefresh: function () {
		if (!this._frameTimer) this._frameTimer = util.getFrame(this.refreshTable, CYCLE);
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
		
		
		if (isUnpainted)
			this._frameTimer = util.getFrame(this.refreshTable, CYCLE)
		else 
			this._frameTimer = null

		this.setState({
			previousOffset: this.state.rowOffset,
			direction: direction,
			renderSide: (side === 'lhs' ? 'rhs' : 'lhs'),
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
		const firstColWidth = view.data._floatCols.length > 0 ? view.data._floatCols[0].width : 0

		var childProps = {
			_handleClick: this.handleClick,
			_handlePaste: this.pasteSelection,
			_copySelection: this.copySelection,
			_copySelectionAsJSON: this.copySelectionAsJSON,
			_addRecord: this.addRecord,
			_deleteRecords: this.deleteRecords,
			_insertRecord: this.insertRecord,
			_handleContextMenu: this.showContext,
			_handleAddAttribute: this.showAddAttribute,
			blurContextMenu: this.hideContext,
			showAttributeAdder: this.showAttributeAdder,
			_handleWheel: this.handleMouseWheel,
			_handleEdit: this.editCell,
			_updatePointer: this.updatePointer,
			_getRCCoords: this.getRCCoords,
			_getRangeStyle: this.getRangeStyle,
			_handleDrop: this.handleDrop,
			_handleDragOver: this.handleDragOver,
			_selectRow: this.selectRow,
			_setResizeColumn: this.setResizeColumn,
			_setColumnSize: this.setColumnSize,
			// _handleStartDrag: this.handleStartDrag,

			_setScrollOffset: this.setHorizontalScrollOffset,

			hiddenColWidth: this.state.hiddenColWidth,
			columnOffset: this.state.columnOffset,
			rowOffset: this.state.rowOffset,
			visibleRows: this.state.visibleRows,
			visibleHeight: this.state.visibleHeight,
			columnContext: this.state.columnContext,

			spaceTop: this.state.pointer.top - this.state.rowOffset,
    		spaceBottom: this.state.visibleRows + this.state.rowOffset - this.state.pointer.top,

			model: model,
			view: view,
			pointer: this.state.pointer,
			selection: this.state.selection,
			copyarea: this.state.copyarea,
			isMouseDown: this.state.isMouseDown,
			store: this.store,
			sorting: view.data.sorting,
			focused: this.props.focused,
			expanded: this.state.expanded,
			resizeColumn: this.state.resizeColumn
		}

		/*
		 * Scrolling and the render cycle are handled in this element by the update*Offset and refreshTable methods
		 * Fetching and rendering of the actual table is handled by the TabularBodyWrapper element
		 * Curors is an overlay containing the selection, the highlighted cell and a few other items
		 * Scrollbars are... scrollbars
		 * table-clip-wrapper
		 */

		
		return <div ref="wrapper"
			className = {`wrapper table-outermost-wrapper`}
			beforePaste = {this.beforePaste}>

			<ReactCSSTransitionGroup className=" wrapper" style={{overflow: "hidden"}} {...constants.transitions.zoomin}>
				<TabularBodyWrapper {...childProps}
					key="tableWrapper"
					ref="tableWrapper"/>
				
				<Cursors {...childProps}
					key="cursors"
					ref="cursors"/>
			</ReactCSSTransitionGroup>

			<ScrollBar {...childProps}
				totalDim = {(rowCount) * geo.rowHeight + geo.headerHeight + 200}	
				visibleDim = {this.state.clientHeight}
				rowCount = {rowCount}
				startOffset = {geo.headerHeight}
				endOffset = {geo.footerHeight}
				ref = "verticalScrollBar"
				axis = "vertical"
				_setScrollOffset = {this.setVerticalScrollOffset}/>
			
			<ScrollBar {...childProps}
				totalDim = {view.data._floatWidth + view.data._fixedWidth + geo.labelWidth + firstColWidth + 250}
				visibleDim = {this.state.clientWidth}
				rowCount = {rowCount}
				startOffset = {0}
				endOffset = {15}
				ref = "horizontalScrollBar"
				axis = "horizontal"
				_setScrollOffset = {this.setHorizontalScrollOffset}/>

			
			{this.state.contextOpen && focused ? 
			<ContextMenu {...childProps}
				rc={this.state.contextRc}
				column={this.state.contextColumn}
				element={this.state.contextElement}
				position={this.state.contextPos}/> 
			: null}
			
		</div>
	}
})

export default TabularPane
