import React from "react"
import fieldTypes from "../../fields"
import _ from "underscore"

import constants from '../../../../constants/MetasheetConstants'

import modelActionCreators from "../../../../actions/modelActionCreators"
import ViewStore from "../../../../stores/ViewStore"

import PureRenderMixin from 'react-addons-pure-render-mixin';



// var TabularTR = React.createClass({
class TabularTR extends React.Component {

	shouldComponentUpdate (newProps) {
		var oldProps = this.props
		var response =	oldProps.view !== newProps.view ||
						oldProps.selected !== newProps.selected ||
						oldProps.row !== newProps.row ||
						newProps.obj !== oldProps.obj;
		// if (oldProps.view !== newProps.view) console.log('oldProps.view !== newProps.view')
		// if (oldProps.row !== newProps.row) console.log('oldProps.row !== newProps.row')
		// if (newProps.obj !== oldProps.obj) console.log('newProps.obj !== oldProps.obj')
		// if (response) console.log('render TR: ' + this.props.rowKey)
		return response
	}

	componentDidMount () {
		var ptr = this.props.pointer || {}
		if (this.props.row === ptr.top)
			this.props._updatePointer(ptr)
	}

	render () {
		// console.log('render TR')
		var _this = this
		var model = this.props.model
		var view = this.props.view
		var rowKey = this.props.rowKey
		var row = this.props.row
		var obj = this.props.obj
		var geo = view.data.geometry
		// var selector = {}
		var rowStyle = {
			height: (geo.rowHeight) + 'px',
			lineHeight: (geo.rowHeight) + 'px',
			top: (geo.rowHeight * (row)) + 'px',
		}

		var left = _this.props.hasRowLabel ? geo.labelWidth : 0;

		// selector[model._pk] = obj[model._pk]

		var checkbox = this.props.selected ? `<span class="check purple icon icon-check"></span>` : '';
		var html = _this.props.hasRowLabel ?
				`<span class = "table-cell ${obj._dirty ? ' dirty-label ' : ''}" style = "left: ${geo.leftGutter}px; width: ${geo.labelWidth}px"><span class="table-cell-inner"><span class="label-grab-handle"></span><span style = "margin-left: 2px;" class = "checkbox-surround ">${checkbox}</span></span></span>`
				: '';

		html = html + _this.props.columns.map(function (col, j) {
			var element = (fieldTypes[col.type]).element;
			var cellKey = rowKey + '-' + col.column_id;
			var innerHtml = element.prototype.getDisplayHTML(col, obj);
			var cellHtml = `<span class = "table-cell" style = "left: ${left}px; width: ${col.width}px;">${innerHtml}</span>`
			left += col.width
			return cellHtml
		}).join(' ');

		return <div id = {rowKey} key = {rowKey} dangerouslySetInnerHTML = {{__html: html}}
			className = {"table-row " + (this.props.selected ? " table-row-selected" : "")} style = {rowStyle}/>
	}
}

export default TabularTR;
