import React from "react"
import fieldTypes from "../../fields"
import _ from "underscore"

import modelActionCreators from "../../../../actions/modelActionCreators.js"

import ModelStore from "../../../../stores/ModelStore"
import ViewStore from "../../../../stores/ViewStore"
import KeyStore from "../../../../stores/KeyStore"
import KeycompStore from "../../../../stores/KeycompStore"
import AttributeStore from "../../../../stores/AttributeStore"

import ViewDataStores from "../../../../stores/ViewDataStores"
import storeFactory from 'flux-store-factory';
import dispatcher from '../../../../dispatcher/MetasheetDispatcher'


var HEADER_HEIGHT = 35
var ROW_HEIGHT = 24
var CURSOR_LIMIT = 60
var WINDOW_SIZE = 40
var OFFSET_TOLERANCE = 5

var limit = function (min, max, value) {
	if (value < min) return min
	if (value > max) return max
	else return value
}


var createTabularStore = function (view) {
	var model = ModelStore.get(view.model_id)
	var primaryAttrId = 'a' + AttributeStore.query(
		{model_id: model.model_id, type: 'PRIMARY_KEY'}
	)[0].attribute_id;

	var store = storeFactory({
		identifier: (primaryAttrId),
  		dispatcher: dispatcher,
  		pivot: function(payload) {
	    	var type = payload.actionType
	    	var label = 'v' + view.view_id
	    	var upperLabel = label.toUpperCase()

    		if (type === (upperLabel + '_CREATE')) {
    			this.create(payload[label])
    			this.emitChange()
    		}

    		if (type === (upperLabel + '_DESTROY')) {
    			this.destroy(payload[label])
    			this.emitChange()
    		}

    		if (type === (upperLabel + '_RECEIVEUPDATE')) {
    			var update = payload[label][0]
    			var existing = store.get(update[primaryAttrId])
    			var clean = {_dirty: false}
    			existing = _.extend(existing, update, clean)
    			this.create(existing)
    			this.emitChange()
    		}

    		if (type === (upperLabel + '_UPDATE')) {
    			var _this = this
    			var update = payload[label]
    			var selector = payload.selector
    			var existing = store.get(update[primaryAttrId])
    			var dirty = {_dirty: true}

    			store.query(selector).forEach(function (obj) {
    				obj = _.extend(obj, update)
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
	      		obj.idx = startIndex + idx;
	      		_this.create(obj)
	      	});
    			this.emitChange()
    		}
  		}
	})

	return store;
}

var TabularTBody = React.createClass ({
	getInitialState: function () {
		return {
			scrollTop: 0,
			fetching: false,
			window: {
				offset: 0,
				limit: CURSOR_LIMIT
			}
		}
	},

	_onChange: function () {
		var view = ViewStore.get(this.props.view.view_id || this.props.view.cid)
		this.setState(view.data)
	},

	componentWillMount: function () {
		var view = this.props.view
		var model = ModelStore.get(view.model_id)
		
		if (view.view_id && !this.store) {
			console.log('A')
			this.initStore()
		}
		if (this.store) {
			console.log('B')
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
		var view = this.props.view
	},

	componentWillUnmount: function () {
		if (!this.store) return;
		this.store.removeChangeListener(this._onChange)
		this.store.unregister()
	},

	shouldComponentUpdate: function (next) {
		var old = this.props
		return !(
			next.scrollTop === old.scrollTop && 
			_.isEqual(old.columns, next.columns) &&
			_.isEqual(old.sorting, next.sort)
		)
	},
	
	fetch: function (force) {
		var oldSort = this.state.sortSpec;
		var rowOffset = Math.floor(this.props.scrollTop / ROW_HEIGHT)
		var tgtOffset = Math.floor(rowOffset - (CURSOR_LIMIT / 2) + (WINDOW_SIZE / 2)) 
		var boundedOffset = limit(0, this.props.nRows - CURSOR_LIMIT, tgtOffset)
		var currentOffset = this.state.window.offset
		var mismatch = Math.abs(currentOffset - tgtOffset)
		var view = this.props.view


		if (!view.view_id) {
			console.log('view id not yet assigned')
			return;
		}

		if (force || (mismatch > OFFSET_TOLERANCE && currentOffset !== boundedOffset)
			|| !_.isEqual(oldSort, view.data.sorting)) {

			console.log('fetching')
			modelActionCreators.fetchRecords(view, 0, 10, view.data.sorting)
			
			this.setState({
				fetching: true,
				sortSpec: view.data.sorting,
				window: {
					offset: boundedOffset,
					limit: CURSOR_LIMIT
				}
			})	
		}
	},

	getStyle: function () {
		return {
			top: (this.state.window.offset * (ROW_HEIGHT) + HEADER_HEIGHT) + 'px',
			height: (((	(this.props.view.rows || 0) - this.state.window.offset) * ROW_HEIGHT)) + 'px'
		}
	},

	getValueAt: function (idx) {
		return this.store.query({idx: idx})[0]
	},

	editCell: function (row, col) {
		var col = this.props.columns[col].column_id
		var obj = this.getValueAt(row);
		var view = this.props.view
		var pkColId = 'a' + AttributeStore.query(
			{model_id: view.model_id, type: 'PRIMARY_KEY'}
		)[0].attribute_id;

		var rowKey = 'tabular-' +  obj[pkColId]
		var cellKey = rowKey + '-' + col
		
		var field = this.refs[cellKey]
		field.handleEdit();
	},

	render: function () {
		var rows = []
		var window = this.state.window
		var model = this.props.model
		var view = this.props.view
		var columns = this.props.columns
		var clicker = this.props.clicker
		var dblClicker = this.props.dblClicker
		//var ` = model.primary_key_attribute_id
		var pkColId = 'a' + AttributeStore.query(
			{model_id: model.model_id, type: 'PRIMARY_KEY'}
		)[0].attribute_id;

		if (!this.store) rows = []
		else rows = this.store.query(null, 'idx').map(function (obj, i) {
			var rowKey = 'tabular-' +  obj[pkColId]
			var els = columns.map(function (col, idx) {
				var element = (fieldTypes[col.type] || fieldTypes.TEXT).element
				var cellKey = rowKey + '-' + col.column_id
				var value = (!!obj) ? obj[col.column_id] : ""

				return React.createElement(element, {
					config: col,
					model: model,
					view: view,
					object: obj,
					pk: pkColId,
					value: value,
					key: cellKey,
					ref: cellKey,
					style: {minWidth: col.width, maxWidth: col.width, textAlign: col.align}
				})
			})
			return <tr id={rowKey} key={rowKey}>{els}</tr>
		})
		return <tbody ref="tbody" style={this.getStyle()} onClick={clicker} onDoubleClick={dblClicker}>
			{rows}
		</tbody>
	}
})

export default TabularTBody