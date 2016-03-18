import React from "react"
import ReactDOM from "react-dom"
import _ from 'underscore'

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

	onScroll: function (event) {
		var wrapper = ReactDOM.findDOMNode(this.refs.wrapper)
		this.setState({
			scrollTop: wrapper.scrollTop,
			scrollLeft: wrapper.scrollLeft
		})
	},

	getRCCoords: function (event, isDrag) {
		var tableBody = ReactDOM.findDOMNode(this.refs.tbody)
		var view = this.props.view
		var geo = view.data.geometry
		var columnWidth = geo.columnWidth + geo.widthPadding
		var offset = $(tableBody).offset()
		var y = event.pageY - offset.top
		var x = event.pageX - offset.left
		var r = Math.floor(y / this.state.actRowHt, 1)
		var c = Math.floor(x / columnWidth, 1)

		var coords = {top: r, left: c, x: x, y: y}
		return coords
	},

	getFieldAt: function (pos) {
		var tbody = this.refs.tbody
		var view = this.props.view
		var rowKey = 'cell-' + row
		var cellKey
		var attribute

		if (pos.left >= 0 && pos.top >= 0) {
			cellKey = rowKey + '-' + col
			return this.refs.tbody.refs[rowKey].refs[cellKey]
		} else if (col < 0) {
			attribute = 'a' + view.row_aggregates[view.row_aggregates.length + left]
			cellKey = rowKey + '-' + attribute
			return this.refs.rowhead.refs[cellKey]
		}
	},

	editCell: function (event) {
		var tbody = this.refs.tbody
		this.setState({
			editing: true,
			copyarea: null
		})
		tbody.setState({
			editing: true
		})
		// var field = this.refs.tbody.refs[rowKey].refs[cellKey]
		this.getFieldAt(this.state.pointer).handleEdit(event);
	},

	updateSelect: function (row, col, shift, direction) {
		var numCols = this.getNumberCols()
		var numRows = this.getNumberRows()
		var sel = this.state.selection
		var anc = this.state.anchor
		var ptr = {left: col, top: row}
		var view = this.props.view

		if (shift && anc.left >= 0 && anc.top >= 0 && row >= 0 && col >= 0) {
			col = Math.min(col, numCols)
			row = Math.min(row, numRows)
			if (!anc) anc = {left: col, top: row}
			sel = {
				left: Math.max(Math.min(anc.left, ptr.left, numCols), 0),
				right: Math.min(Math.max(anc.left, ptr.left, 0), numCols),
				top: Math.max(Math.min(anc.top, ptr.top, numRows), 0),
				bottom: Math.min(Math.max(anc.top, ptr.top, 0), numRows)
			}
			ptr.left = col
			ptr.top = row
		} else if (ptr.left < 0) {
			ptr.left = Math.max(-1 * view.row_aggregates.length, ptr.left)
			// TODO: functionalize this and harmonize rows/cols
			var attribute = 'a' + view.row_aggregates[view.row_aggregates.length + ptr.left]
			var row
			for(; ptr.top >= 0 && ptr.top < numRows; ptr.top += (direction === 'down' ? 1 : -1) ) {
				row = this.store.getLevel('rows', ptr.top)
				if (row.spans[attribute] > 0) break;
			}
			ptr.bottom = ptr.top + row.spans[attribute] - 1
			sel = ptr
			sel.right = numCols
		} else if (ptr.top < 0) {
			ptr.top = Math.max(-1 * view.column_aggregates.length, ptr.top)
			var attribute = 'a' + view.column_aggregates[view.column_aggregates.length + ptr.top]
			var col
			for(; ptr.left >= 0 && ptr.right < numCols; ptr.left += (direction === 'right' ? 1 : -1) ) {
				col = this.store.getLevel('columns', ptr.left)
				if (col.spans[attribute] > 0) break;
			}
			ptr.right = ptr.left + col.spans[attribute] - 1
			sel = ptr
			sel.bottom = numRows
		} else {
			col = Math.min(col, numCols)
			row = Math.min(row, numRows)

			ptr = anc = {
				left: col,
				top: row
			}
			sel = {
				left: col,
				right: col,
				top: row,
				bottom: row
			}
		}

		this.setState({
			pointer: ptr,
			selection: sel,
			anchor: anc
		})
	},

	selectRow: function () {
		var view = this.props.view
		var numGroupCols = view.row_aggregates.length
		var ptr = this.state.pointer
		ptr.left = ((Math.min(ptr.left, 0)) % numGroupCols) - 1
		this.updateSelect(ptr.top, ptr.left)
	},

	insertRecord: function () {
		var obj = {}
		var model = this.props.model
		var rowLevel = this.store.getLevel('rows', this.state.pointer.top)
		var colLevel = this.store.getLevel('columns', this.state.pointer.left)

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

	onMouseDown: function (e) {
		// if right click then dont bother
		if (("which" in e && e.which === 3) || 
    		("button" in e && e.button === 2)) {
        	e.preventDefault()
        	return;
        }

		if (FocusStore.getFocus() !== 'view')
			modelActionCreators.setFocus('view')
		this.updateSelect(this.getRCCoords(e), e.shiftKey)
		addEventListener('selectstart', util.returnFalse)
		addEventListener('mousemove', this.onSelectMouseMove)
		addEventListener('mouseup', this.onMouseUp)
	},

	onSelectMouseMove: function (e) {
		this.updateSelect(this.getRCCoords(e), true)
	},

	onMouseUp: function (e) {
		removeEventListener('selectstart', util.returnFalse);
		removeEventListener('mousemove', this.onSelectMouseMove);
		removeEventListener('mouseup', this.onMouseUp);
		document.getElementById("copy-paste-dummy").focus();
	},


	getRCCoords: function (e) {
		var store = this.store;
		var wrapper = ReactDOM.findDOMNode(this.refs.wrapper)
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
		var x = e.pageX - offset.left - geo.labelWidth
		var xx = x
		var r = Math.floor((y) / geo.rowHeight, 1)
		var c

		if (x > 0) {
			c = Math.floor((x - rowHeaderWidth) / geo.rowHeight, 1)
			c = Math.min(numColumns - 1, c)
		} 
		if (y > 0) {
			r = Math.floor((y - columnHeaderHeight) / geo.columnWidth, 1)
			r = Math.min(numRows - 1, r)
		}

		if (r < 0 && c < 0) r = 0

		return {top: r, left: c}
	},

	getRangeStyle: function (pos, fudge) {
		var store = this.store;
		var view = this.props.view;
	    var geo = view.data.geometry;
	    
	    // repetitive, not sure what to do
	    var numColumns = store.getCount('column');
		var numRows = store.getCount('row');

		var getColumns = (c => view.data.columns['a' + c]);
		
		var columnHeaders = view.column_aggregates.map(getColumns);
		var columnHeaderHeight = columnHeaders.length * geo.rowHeight;

		var rowHeaders = view.row_aggregates.map(getColumns);
		var rowHeaderWidth = util.sum(rowHeaders, 'width');
		
	    var style = this.props.style || {}

	    pos = pos || {}
	    fudge = fudge || {}
	    if (pos.top >= 0) {
	    	style.top = (columnHeaderHeight + pos.top * geo.rowHeight + (fudge.top || 0)) + 'px'
	    	style.height = (geo.rowHeight * ((pos.bottom || pos.top) - pos.top + 1) + (fudge.height || 0)) + 'px'
	    } 
	    if (pos.left >= 0) {
	    	style.left = (rowHeaderWidth + pos.left * geo.columnWidth + (fudge.left || 0)) + 'px'
	    	style.width = (geo.columnWidth + (fudge.width || 0)) + 'px'
	    }
	    

	  //   if (pos.left >= 0 && (pos.right || pos.left) < this.state.hOffset)
	  //     style.display = 'none'
	 	// if (pos.top >= 0 && (pos.top || pos.bottom) < this.state.vOffset)
	  //     style.display = 'none'

	  	return style
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

		Object.assign(childProps, {
			_getRangeStyle: this.getRangeStyle,
			_handleClick: this.onMouseDown,
			
			store: this.store,

			hOffset: this.state.hOffset,
			vOffset: this.state.vOffset,
			scrollTop: scrollTop,
			scrollLeft: scrollLeft,

			rowHeaders: rowHeaders,
			rowHeaderWidth: util.sum(rowHeaders, 'width'),
			columnHeaders: columnHeaders,
			columnHeaderHeight: columnHeaders.length * geo.rowHeight,

			numColumns: numColumns,
			numRows: numRows,

			rowHeaderWidth: rowHeaderWidth,
			bodyWidth: bodyWidth,
			adjustedWidth: rowHeaderWidth + bodyWidth,

			pointer: this.state.pointer,
			selection: this.state.selection,
			copyarea: this.state.copyarea
		});

		return <div className = "model-panes">
			<div className="view-body-wrapper" ref="wrapper">
				<CubeBodyWrapper {...childProps} store = {this.store}/>
				<Cursors {...childProps} ref = "cursors"/>
			</div>
		</div>
	}
})

export default CubePane
