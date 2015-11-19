import React from "react"
import fieldTypes from "../../fields"
import _ from "underscore"
import modelActionCreators from "../../../../actions/modelActionCreators"
import ModelStore from "../../../../stores/ModelStore"
import ViewStore from "../../../../stores/ViewStore"
import AttributeStore from "../../../../stores/AttributeStore"
import FocusStore from "../../../../stores/FocusStore"
import ViewDataStores from "../../../../stores/ViewDataStores"
import storeFactory from 'flux-store-factory';
import dispatcher from '../../../../dispatcher/MetasheetDispatcher'
import createTabularStore from './TabularStore.jsx'
var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;


var TabularTR = React.createClass({

	mixins: [PureRenderMixin],

	render: function () {
		var _this = this
		var model = _this.props.model
		var rowKey = this.props.rowKey
		var row = this.props.row
		var obj = this.props.obj
		var geometry = this.props.geometry
		var selector = {}
		var trStyle = {
			height: (geometry.rowHeight + 2) + 'px',
			top: (geometry.rowHeight * (row)) + 'px',
		}
		selector[model._pk] = obj[model._pk]
		var left = 0;

		return <div id={rowKey}
			className = {"table-row " +  (obj._dirty ? "dirty" : "")}
			style = {trStyle}>
			{_this.props.columns.map(function (col) {
				var element = (fieldTypes[col.type] || fieldTypes.TEXT).element
				var cellKey = rowKey + '-' + col.column_id

				var el = React.createElement(element, {
					config: col,
					model: _this.props.model,
					view: _this.props.view,
					selector: selector,
					object: obj,
					className: 'table-cell',
					value: obj[col.column_id],
					column_id: col.column_id,
					handleBlur: _this.props.handleBlur,
					key: cellKey,
					cellKey: cellKey,
					ref: cellKey,
					style: {
						top: 0,
						bottom: 0,
						left: left + 'px',
						minWidth: (col.width - 1) + 'px',
						maxWidth: (col.width - 1)  + 'px',
						textAlign: col.align
					}
				})
				left += col.width
				return el
			})}
		</div>
	}
})

export default TabularTR;
