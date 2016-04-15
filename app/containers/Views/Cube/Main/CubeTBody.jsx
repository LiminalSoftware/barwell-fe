import React from "react"
import _ from "underscore"
import $ from 'jquery'

import constants from '../../../../constants/MetasheetConstants'

import fieldTypes from "../../fields"
import modelActionCreators from "../../../../actions/modelActionCreators"

import ModelStore from "../../../../stores/ModelStore"
import ViewStore from "../../../../stores/ViewStore"
import FocusStore from "../../../../stores/FocusStore"
import AttributeStore from "../../../../stores/AttributeStore"
// import ViewDataStores from "../../../../stores/ViewDataStores"

import dispatcher from '../../../../dispatcher/MetasheetDispatcher'

const VISIBLE_ROWS = 40
const VISIBLE_COLUMNS = 20
const DELIMITER = '#'; //constants.delimiter

var CubeTBody = React.createClass ({

	shouldComponentUpdate: function (newProps) {
		return newProps.view !== this.props.view
		// return false;
	},

	getInitialState: function () {
		var view = this.props.view
		var geo = view.data.geometry
		return {
			
		}
	},

	_onChange: function () {
		this.forceUpdate()
	},

	componentWillMount: function () {
		var view = this.props.view
		var model = ModelStore.get(view.model_id)
		this.props.store.addChangeListener(this._onChange)
	},

	componentWillUnmount: function () {
		this.props.store.removeChangeListener(this._onChange)
	},

	render: function () {
		var _this = this
		var model = this.props.model
		var view = this.props.view
		var store = this.props.store
		var geo = view.data.geometry
		var vOffset = this.props.verticalOffset
		var hOffset = this.props.horizontalOffset
		var rowLevels = store.getLevels('row', 0, 100) || []
		var colLevels = store.getLevels('column', 0, 100) || []
		var column = view.data.columns['a' + view.value]
		var selector = {}
		var element = (fieldTypes[column.type]).element
		var cells = new Array(VISIBLE_ROWS * VISIBLE_COLUMNS)

		console.log('render cube tbody');

		for (var i = 0; i < Math.min(VISIBLE_ROWS, rowLevels.length); i++) {
			Object.assign(selector, rowLevels[i])
			var rowKey = _.values(rowLevels[i])
				.map(v => (v === null || v=== undefined) ? '%&NULL&%' : v).join(DELIMITER) + DELIMITER

			for (var j = 0; j < Math.min(VISIBLE_COLUMNS, colLevels.length); j++) {
				var obj = store.getValue(i,j);
				var value = obj ? obj[column.column_id] : null;
				var style = {
					width: geo.columnWidth + 'px',
					height : geo.rowHeight + 'px',
					left: (geo.columnWidth * j) + 'px',
					top: (geo.rowHeight * i) + 'px'
				};
				var cellKey = rowKey + _.values(colLevels[j])
					.map(v => (v === null || v === undefined) ? '%&NULL&%' : v).join(DELIMITER);
				Object.assign(selector, colLevels[j])
				// console.log('value: ' + store.getValue(i,j))
				cells[i * VISIBLE_COLUMNS + j] = React.createElement(element, {
					config: column,
					model: model,
					view: view,
					selector: _.clone(selector),
					value: value,
					column_id: column.column_id,
					key: cellKey,
					style: style,
					isNull: !obj,
					className: 'table-cell',
					rowHeight: geo.rowHeight,
				})
			}
		}
		
		return <div ref = "cube-tbody"
			className = "wrapper cube-main-tbody"
			onMouseDown = {this.props._handleClick}
			onWheel = {this.props._handleWheel}
			
			onDoubleClick = {this.props._handleEdit}>
			{cells}
		</div>;
	},

})

export default CubeTBody