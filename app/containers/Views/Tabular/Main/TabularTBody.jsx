import React from "react"
import fieldTypes from "../../fields"
import _ from "underscore"
import $ from 'jquery'

import modelActionCreators from "../../../../actions/modelActionCreators"

import ModelStore from "../../../../stores/ModelStore"
import ViewStore from "../../../../stores/ViewStore"
import KeyStore from "../../../../stores/KeyStore"
import KeycompStore from "../../../../stores/KeycompStore"
import AttributeStore from "../../../../stores/AttributeStore"
import RelationStore from "../../../../stores/RelationStore"
import FocusStore from "../../../../stores/FocusStore"

import ViewDataStores from "../../../../stores/ViewDataStores"
import storeFactory from 'flux-store-factory';
import dispatcher from '../../../../dispatcher/MetasheetDispatcher'

import TableMixin from '../../TableMixin.jsx'

global.$$ = $

var limit = function (min, max, value) {
	if (value < min) return min
	if (value > max) return max
	else return value
}

var createTabularStore = function (view) {
	var model = ModelStore.get(view.model_id)
	var store = storeFactory({
		identifier: (model._pk),
  		dispatcher: dispatcher,
  		pivot: function(payload) {
	    	var type = payload.actionType
	    	var label = 'm' + view.model_id
	    	var upperLabel = label.toUpperCase()

    		if (type === (upperLabel + '_CREATE')) {
    			var obj = payload[label]
    			this.create(obj)
    			this.emitChange()
    		}

    		// if (type === (upperLabel + '_INSERT')) {
    		// 	var obj = payload[label]
    		// 	this.create(obj)
    		// }

    		if (type === (upperLabel + '_DESTROY')) {
    			this.destroy(payload[label])
    			this.emitChange()
    		}

    		if (type === (upperLabel + '_RECEIVEUPDATE')) {
    			var update = payload[label][0]
    			var existing = store.get(update.cid || update[model._pk])
    			var clean = {_dirty: false}

    			existing = _.extend(existing, update, clean)
    			this.create(existing)
    			this.emitChange()
    		}

    		if (type === (upperLabel + '_UPDATE')) {
    			var _this = this
    			var update = payload[label]	
    			var selector = payload.selector
    			var existing = store.get(update[model._pk]  || update.cid)
    			var dirty = {_dirty: true}

    			store.query(selector).forEach(function (obj) {
    				obj = _.extend(obj, update, dirty)
    				_this.create(obj)
    			})
    			this.emitChange()
    		}
	        
	      if (type === (upperLabel + '_RECEIVE')) {
	      	var _this = this
	      	var objects = payload[label]
	      	var startIndex = payload.startIndex
	        	var endIndex = payload.endIndex

	        	if (!_.isArray(objects)) objects = [objects]
	      	objects.forEach(function (obj, idx) {
	      		obj._idx = startIndex + idx;
	      		_this.create(obj)
	      	});
    			this.emitChange()
    		}
  		}
	})

	return store;
}

var TabularTBody = React.createClass ({

	mixins: [TableMixin],

	getInitialState: function () {
		return {
			scrollTop: 0,
			window: {
				offset: 0,
				limit: 100,
				windowSize: 40
			},
			geometry: {
				headerHeight: 29,
				rowHeight: 25,
				rowPadding: 1,
				topOffset: 13,
				leftOffset: 3,
				widthPadding: 9
			}
		}
	},

	_onChange: function () {
		var view = ViewStore.get(this.props.view.view_id || this.props.view.cid)
		this.forceUpdate()
	},

	componentWillMount: function () {
		var view = this.props.view
		var model = ModelStore.get(view.model_id)
		
		if (view.view_id && !this.store) {
			this.initStore()
		}
		if (this.store) {
			global.tbodystore = this.store
			this.store.register()
			this.store.addChangeListener(this._onChange)
			this.fetch(true)
		}
	},

	initStore: function () {
		var view = this.props.view
		this.store = ViewDataStores[view.view_id] = createTabularStore(view)
	},

	componentWillReceiveProps: function (newProps) {
		var oldProps = this.props;
		if (!oldProps.view_id && newProps.view_id) {
			this.initStore()
			this.store.register()
			this.store.addChangeListener(this._onChange)
			this.fetch(true)
		}
		if (!_.isEqual(oldProps.sorting, newProps.sorting)) {
			this.fetch(true)
		}
	},
	
	componentDidMount: function () {
		$(this.refs.tbody)
	},

	componentWillUnmount: function () {
		if (!this.store) return;
		this.store.removeChangeListener(this._onChange)
		this.store.unregister()
	},

	// shouldComponentUpdate: function (next) {
	// 	var old = this.props
	// 	return !(
	// 		next.scrollTop === old.scrollTop && 
	// 		_.isEqual(old.columns, next.columns) &&
	// 		_.isEqual(old.sorting, next.sorting)
	// 	)
	// },
	
	fetch: function (force) {
		var window = this.state.window
		var geometry = this.state.geometry
		var rowOffset = Math.floor(this.props.scrollTop / geometry.rowHeight)
		var tgtOffset = Math.floor(rowOffset - (window.cursorLimit / 2) + (window.windowSize / 2)) 
		var boundedOffset = limit(0, this.props.nRows - window.cursorLimit, tgtOffset)
		var currentOffset = this.state.window.offset
		var mismatch = Math.abs(currentOffset - tgtOffset)
		var view = this.props.view


		if (!view.view_id) {
			return;
		}

		if (force || (mismatch > OFFSET_TOLERANCE && currentOffset !== boundedOffset)
			|| !_.isEqual(oldSort, view.data.sorting)) {

			modelActionCreators.fetchRecords(view, 0, 100, view.data.sorting)
			
			this.setState({
				fetching: true,
				sortSpec: view.data.sorting,
				window: {
					offset: boundedOffset,
					limit: this.state.window.limit
				}
			})	
		}
	},

	getStyle: function () {
		var geometry = this.state.geometry
		return {
			top: (this.state.window.offset * (geometry.rowHeight + geometry.rowPadding) + 
				geometry.headerHeight) + 'px',
			height: ((	(this.props.view.rows || 0) - this.state.window.offset) *
				(geometry.rowHeight + geometry.rowPadding)) + 'px'
		}
	},

	getValueAt: function (idx) {
		return this.store.query(null, '_idx')[idx]
	},

	editCell: function (event, initialValue) {
		var row = this.state.pointer.top
		var col = this.state.pointer.left
		var colId = this.props.columns[col].column_id
		var obj = this.getValueAt(row);
		var model = this.props.model
		var pk = model._pk
		var objId = (obj.cid || obj[pk]);
		var rowKey = 'tr-' + objId
		var cellKey = rowKey + '-' + colId
		
		this.setState({
			editing: true, 
			editObjId: objId, 
			editColId: colId
		})
		var field = this.refs[rowKey].refs[cellKey]
		field.handleEdit(event, initialValue);
	},

	handleBlur: function () {
		this.setState({editing: false})
	},


	render: function () {
		var _this = this
		var model = this.props.model
		var clicker = this.props.clicker
		var dblClicker = this.props.dblClicker
		var handleBlur = this.handleBlur
		var pk = model._pk
		var editObjId = this.state.editObjId
		var rows = _this.store.query(null, '_idx')
		
		var geometry = this.state.geometry
		var height = (rows.length * (geometry.rowHeight + geometry.rowPadding)) + ' px'

		return <tbody ref = "tbody" 
			onClick = {_this.onClick} 
			onDoubleClick = {_this.editCell}>
		{	
			rows.map(function (obj, i) {
				var rowKey = 'tr-' + (obj.cid || obj[pk])
				return <TabularTR  {..._this.props} 
					obj={obj}
					editing = {obj[pk] === editObjId}
					rowKey = {rowKey}
					ref = {rowKey}
					key = {rowKey}
					geometry = {_this.state.geometry}
					handleBlur = {_this.handleBlur} />;
			})	
		}
		<div 
			className={"pointer" + (this.props.focused ? " focused" : "")} 
			ref="anchor" 
			onDoubleClick={this.startEdit}
			style={this.getPointerStyle()}>
		</div>
		<div 
			className={"selection" + (this.props.focused ? " focused" : "")} 
			ref="selection" 
			style={this.getSelectorStyle()}>
		</div>
		</tbody>;
	}
})

var TabularTR = React.createClass({
	shouldComponentUpdate: function (updt) {
		var old = this.props
		return !(
			_.isEqual(updt.obj, old.obj) &&
			updt.view == old.view &&
			updt.editing == old.editing
		)
	},

	render: function () {
		var _this = this
		var rowKey = this.props.rowKey
		var obj = this.props.obj
		var geometry = this.props.geometry
		var style = {
			lineHeight: geometry.rowHeight + 'px',
			height: (geometry.rowHeight) + 'px'
			// lineHeight: '0px'
		}
		
		return <tr id={rowKey} style={style} className = {obj._dirty ? "dirty" : ""}>
			{_this.props.columns.map(function (col) {
				var element = (fieldTypes[col.type] || fieldTypes.TEXT).element
				var cellKey = rowKey + '-' + col.column_id

				return React.createElement(element, {
					config: col,
					model: _this.props.model,
					view: _this.props.view,
					object: obj,
					pk: _this.props.model.pk,
					value: obj[col.column_id],
					handleBlur: _this.props.handleBlur,
					key: cellKey,
					cellKey: cellKey,
					ref: cellKey,
					style: {
						minWidth: col.width, 
						maxWidth: col.width, 
						textAlign: col.align,
						height: (geometry.rowHeight) + 'px',
					}
				})
			})}
		</tr>	
	}
})

export default TabularTBody