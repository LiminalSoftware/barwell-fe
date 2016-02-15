import React from "react"
import fieldTypes from "../../fields"
import _ from "underscore"

import constants from '../../../../constants/MetasheetConstants'

import modelActionCreators from "../../../../actions/modelActionCreators"
import ViewStore from "../../../../stores/ViewStore"

import PureRenderMixin from 'react-addons-pure-render-mixin';

import defaultCellStyle from '../../Fields/defaultCellStyle';


var TabularTR = React.createClass({

	shouldComponentUpdate: function (newProps) {
		var oldProps = this.props
		if (newProps.isScrolling) {
			// console.log('TabualrTR.shouldComponentUpdate: scrolling')
			return false;
		}
		if (oldProps.view !== newProps.view) {
			// console.log('TabualrTR.shouldComponentUpdate: oldProps.view !== newProps.view')
			return true
		}
		if (oldProps.row !== newProps.row) return true
		return this.props.columns.some(function (col) {
			return newProps.obj[col.column_id] !== oldProps.obj[col.column_id]
		})
	},

	prepareColumn: function () {

	},

	componentDidMount: function () {
		var ptr = this.props.pointer || {}
		if (this.props.row === ptr.top)
			this.props._updatePointer(ptr)
	},

	render: function () {
		var _this = this
		var model = this.props.model
		var view = this.props.view
		var rowKey = this.props.rowKey
		var offsetCols = this.props.offsetCols
		var row = this.props.row
		var obj = this.props.obj
		var geo = view.data.geometry
		var ptr = this.props.pointer
		var selector = {}
		var rowStyle = {
			left: 0,
			right: '1px',
			height: (geo.rowHeight) + 'px',
			top: (geo.rowHeight * (row)) + 'px',
		}
		
		var left = _this.props.hasRowLabel ? geo.labelWidth : 0;

		selector[model._pk] = obj[model._pk]

		return <div id={rowKey}
			className = {"table-row " +  (obj._dirty ? "dirty" : "")}
			style = {rowStyle}>
			{_this.props.hasRowLabel ?
				<span className = "table-cell" 
					style = {{ 
						left: geo.leftGutter + 'px', 
						width: geo.labelWidth + 'px', 
					}}>
					
				</span> : null
			}

			{_this.props.columns.map(function (col, j) {
				var element = (fieldTypes[col.type] || fieldTypes.TEXT).element
				var cellKey = rowKey + '-' + col.column_id
				

				var el = React.createElement(element, {
					config: col,
					model: _this.props.model,
					view: _this.props.view,

					selector: selector,
					object: obj,
					pointer: ptr,
					rowHeight: geo.rowHeight,

					value: obj[col.column_id],
					column_id: col.column_id,

					_handleBlur: _this.props._handleBlur,
					_handleDetail: _this.props._handleDetail,
					_handleClick: _this.props._handleClick,
					_handleEdit: _this.props._handleEdit,
					_handleWheel: _this.props._handleWheel,
					_handlePaste: _this.props._handlePaste,

					key: cellKey,
					cellKey: cellKey,
					ref: cellKey,
					className: 'table-cell',
					sorted: (col.attribute_id && (col.attribute_id in view.data.sortIndex)),
					style: {
						left: (left) + 'px',
						width: (col.width) + 'px'
					}
				})
				left += col.width
				return el
			})}
		</div>
	}
})

export default TabularTR;
