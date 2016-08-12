import React from "react"
import fieldTypes from "../../fields"
import _ from "underscore"

import constants from "../../../constants/MetasheetConstants"

import modelActionCreators from "../../../actions/modelActionCreators"
import ViewStore from "../../../stores/ViewStore"

class TabularTR extends React.Component {

	shouldComponentUpdate (newProps) {
		var oldProps = this.props
		var response =	oldProps.view !== newProps.view ||
						oldProps.selected !== newProps.selected ||
						oldProps.row !== newProps.row ||
						oldProps.outoforder !== newProps.outoforder ||
						newProps.obj !== oldProps.obj;
		return response
	}

	componentWillReceiveProps = (newProps) => {

	}

	render = () => {
		var _this = this
		var model = this.props.model
		var view = this.props.view
		var rowKey = this.props.rowKey
		var row = this.props.row
		var obj = this.props.obj
		var geo = view.data.geometry
		var rowStyle = {
			height: (geo.rowHeight) + 'px',
			lineHeight: (geo.rowHeight) + 'px',
			top: (geo.rowHeight * (row) + 1) + 'px'
		}

		var left = _this.props.hasRowLabel ? geo.labelWidth : 0;

		// selector[model._pk] = obj[model._pk]

		var checkbox = this.props.selected ? `<span class="check purple icon icon-check"></span>` : '';
		var html = _this.props.hasRowLabel ?
				`<span class = "table-row-label table-cell ${obj._dirty ? ' dirty-label ' : ''}" style = "left: ${geo.leftGutter}px; width: ${geo.labelWidth}px"><span class="table-cell-inner"><span class="label-grab-handle"></span><span style = "margin-left: 2px;" class = "checkbox-surround " id = "${rowKey}-rowcheck">${checkbox}</span></span></span>`
				: '';

		html = html + _this.props.columns.map(function (col, j) {
			var type = fieldTypes[col.type]
			var element = type.element;
			var cellKey = rowKey + '-' + col.column_id;
			var innerHtml = type.getDisplayHTML ? type.getDisplayHTML(col, obj, {left: left, width: col.width}) : element.prototype.getDisplayHTML(col, obj)
			// var cellHtml = `<span class = "table-cell ${('_error' in obj && col.column_id in obj._error) ? ' table-cell-error' : ' '}" style = "left: ${left}px; width: ${col.width}px;">${innerHtml}</span>`
			left += col.width
			return innerHtml
		}).join(' ');
		
		return <div id = {rowKey} key = {rowKey} dangerouslySetInnerHTML = {{__html: html}}
			className = {"table-row " 
				+ (this.props.outoforder ? " table-row-outoforder " : "")
				+ (this.props.selected ? " table-row-selected " : "")} 

			style = {rowStyle}/>
	}
}

export default TabularTR;
