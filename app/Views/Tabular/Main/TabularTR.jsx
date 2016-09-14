import React from "react"
import ReactDOM from "react-dom"
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
						// oldProps.row !== newProps.row ||
						oldProps.ooo !== newProps.ooo ||
						!!oldProps.oooFirst !== !!newProps.oooFirst ||
						!!oldProps.oooLast !== !!newProps.oooLast ||
						!!oldProps.oooNext !== !!newProps.oooNext ||
						newProps.obj !== oldProps.obj;
		return response
	}

	componentWillReceiveProps = (newProps) => {
		const geo = this.props.view.data.geometry
		if (newProps.row !== this.props.row) {
			const row = ReactDOM.findDOMNode(this)
			row.style.top = geo.rowHeight * (newProps.row) + 1 + 'px'
		}
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
			height: (geo.rowHeight),
			lineHeight: (geo.rowHeight) + 'px',
			top: (geo.rowHeight * (row) + 1),
			transform: 'translateZ(1px)'
		}

		var left = _this.props.hasRowLabel ? geo.labelWidth : 0;

		var checkbox = this.props.selected ? `<span class="check purple icon icon-check"></span>` : '';
		var oooBottomEdge = this.props.oooLast ? `<span class="ooo-jagged-edge-bottom"></span>` : '';
		var oooTopEdge = this.props.oooFirst ? `<span class="ooo-jagged-edge-top"></span>` : '';

		var html = _this.props.hasRowLabel ?
				`<span class = "table-row-label table-cell" style = "left: ${geo.leftGutter}px; width: ${geo.labelWidth}px">
					<span class="table-cell-inner"><span class="label-grab-handle"></span>
						<span style = "margin-left: 2px;" 
						class = "checkbox-surround " 
						id = "${rowKey}-rowcheck">
						${checkbox}
						</span>
					</span>
					${oooTopEdge}
					${oooBottomEdge}
				</span>`
				: '';

		html = html + _this.props.columns.map(function (col, j) {
			var type = fieldTypes[col.type]
			var element = type.element;
			var cellKey = rowKey + '-' + col.column_id;
			var innerHtml = type.getDisplayHTML ? 
				type.getDisplayHTML(col, obj, {left: left, width: col.width}, row) : 
				element.prototype.getDisplayHTML(col, obj) // deprecated, but have not yet migrated all field types

			left += col.width
			return innerHtml
		}).join(' ');
		
		return <div id = {rowKey} key = {rowKey} dangerouslySetInnerHTML = {{__html: html}}
			className = {"table-row " 
				+ (this.props.ooo ? " table-row-outoforder " : "")
				+ ((this.props.oooNext || this.props.oooLast) ? " table-row-ooo-edge " : "")
				+ (this.props.selected ? " table-row-selected " : "")} 

			style = {rowStyle}/>
	}
}

export default TabularTR;
