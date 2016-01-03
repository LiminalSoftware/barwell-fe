import React from "react"
import fieldTypes from "../../fields"
import _ from "underscore"

import modelActionCreators from "../../../../actions/modelActionCreators"
import ViewStore from "../../../../stores/ViewStore"

import PureRenderMixin from 'react-addons-pure-render-mixin';


var TabularTR = React.createClass({

	shouldComponentUpdate: function (newProps) {
		var oldProps = this.props
		return (!_.isEqual(oldProps.obj, newProps.obj)
		|| this.props.view != newProps.view)
	},

	render: function () {
		var _this = this
		var model = _this.props.model
		var rowKey = this.props.rowKey
		var row = this.props.row
		var obj = this.props.obj
		var geometry = this.props.geometry
		var ptr = this.props.pointer
		var selector = {}
		var rowStyle = {
			height: (geometry.rowHeight + 2) + 'px',
			top: (geometry.rowHeight * (row)) + 'px',
		}
		selector[model._pk] = obj[model._pk]
		var left = 0;
		var prevSort = false;
		var prevFixed = true;

		return <div id={rowKey}
			className = {"table-row " +  (obj._dirty ? "dirty" : "")}
			style = {rowStyle}>
			{_this.props.columns.map(function (col, j) {
				var element = (fieldTypes[col.type] || fieldTypes.TEXT).element
				var cellKey = rowKey + '-' + col.column_id
				var isCurrent = (ptr.left === j && ptr.top === row)
				var classes = []

				classes.push('table-cell')
				if (col.sorting || prevSort) classes.push('sorted')
				if (col.align === 'center') classes.push('align-center')
				if (col.align === 'right') classes.push('align-right')
				else classes.push('align-left')
				if (!col.fixed && prevFixed) classes.push('floating')

				var el = React.createElement(element, {
					config: col,
					model: _this.props.model,
					view: _this.props.view,
					selector: selector,
					object: obj,
					className: classes.join(' '),
					value: obj[col.column_id],
					column_id: col.column_id,
					handleBlur: _this.props.handleBlur,
					handleDetail: _this.props.handleDetail,
					key: cellKey,
					cellKey: cellKey,
					ref: cellKey,
					style: {
						top: 0,
						bottom: 0,
						left: left + 'px',
						minWidth: (col.width - 1) + 'px',
						maxWidth: (col.width - 1)  + 'px'
					}
				})
				prevSort = !!col.sorting
				prevFixed = !!col.fixed
				left += col.width
				return el
			})}
		</div>
	}
})

export default TabularTR;
