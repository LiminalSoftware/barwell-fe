import React from "react"
import fieldTypes from "../../fields"
import _ from "underscore"

import modelActionCreators from "../../../../actions/modelActionCreators.js"

import ModelStore from "../../../../stores/ModelStore"
import KeyStore from "../../../../stores/KeyStore"
import KeycompStore from "../../../../stores/KeycompStore"
import AttributeStore from "../../../../stores/AttributeStore"

import ViewDataStores from "../../../../stores/ViewDataStores"
import storeFactory from 'flux-store-factory';
import dispatcher from '../../../../dispatcher/MetasheetDispatcher'


var HEADER_HEIGHT = 35
var ROW_HEIGHT = 22
var CURSOR_LIMIT = 60
var WINDOW_SIZE = 40
var OFFSET_TOLERANCE = 5

var limit = function (min, max, value) {
	if (value < min) return min
	if (value > max) return max
	else return value
}


var createTabularStore = function (model) {
	var primaryAttrId = AttributeStore.query(
		{model_id: model.model_id, type: 'PRIMARY_KEY'}
	)[0].attribute_id;

	return storeFactory({
		identifier: ('a' + primaryAttrId),
  		dispatcher: dispatcher,
  		pivot: function(payload) {
	    	var type = payload.actionType
	    	var label = 'm' + model.model_id
	    	var upperLabel = label.toUpperCase()

    		if (type === (upperLabel + '_CREATE')) {
    			this.create(payload[label])
    			this.emitChange()
    		}

    		if (type === (upperLabel + '_DESTROY')) {
    			this.destroy(payload[label])
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
		this.forceUpdate()
	},

	componentWillMount: function () {
		var view = this.props.view
		var model = ModelStore.get(view.model_id)
		
		if (!this.store) {
			this.store = ViewDataStores[view.view_id] = createTabularStore(model)
		} else {
			this.store.register()
		}

		this.store.addChangeListener(this._onChange)
		
	},
	
	componentDidMount: function () {
		var view = this.props.view
		var model = ModelStore.get(view.model_id)

		modelActionCreators.fetchRecords(model, 0, 10)
	},

	componentWillUnmount: function () {
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
		var rowOffset = Math.floor(this.props.scrollTop / ROW_HEIGHT)
		var tgtOffset = Math.floor(rowOffset - (CURSOR_LIMIT / 2) + (WINDOW_SIZE / 2)) 
		var boundedOffset = limit(0, this.props.nRows - CURSOR_LIMIT, tgtOffset)
		var currentOffset = this.state.window.offset
		var mismatch = Math.abs(currentOffset - tgtOffset)

		if (force || (mismatch > OFFSET_TOLERANCE && currentOffset !== boundedOffset)) {
			modelActionCreators.fetchRecords(model, 0, 10)
			this.setState({
				fetching: true,
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

	render: function () {
		var rows = []
		var window = this.state.window
		var model = this.props.model
		var view = this.props.view
		var columns = this.props.columns
		var clicker = this.props.clicker
		var dblClicker = this.props.dblClicker
		//var pk = model.primary_key_attribute_id

		rows = this.store.query({}, 'idx').map(function (obj, i) {
			var rowKey = 'tabular-' +  obj.idx //(!!pk && !!obj ? obj.synget(pk) : i)
			var els = columns.map(function (col, idx) {
				var element = (fieldTypes[col.type] || fieldTypes.Text).element
				var cellKey = rowKey + '-' + col.attribute_id
				var value = (!!obj) ? obj[('a' + col.attribute_id)] : ""

				return React.createElement(element, {
					config: col,
					object: obj,
					value: value,
					key: cellKey,
					style: {minWidth: col.width, maxWidth: col.width}
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