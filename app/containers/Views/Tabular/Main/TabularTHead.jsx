import React from "react"
import $ from "jquery"
import styles from "./styles/header.less"

import _ from 'underscore'
import fieldTypes from "../../fields"
import modelActionCreators from "../../../../actions/modelActionCreators"
import FocusStore from "../../../../stores/FocusStore"
import PureRenderMixin from 'react-addons-pure-render-mixin';

import TabularTH from "./TabularTH"
var TabularTHead = React.createClass ({

	shouldComponentUpdate: function (nextProps) {
		return (nextProps.leftOffset !== this.props.leftOffset ||
			nextProps.view !== this.props.view)
	},

	render: function () {
		var _this = this
		var view = this.props.view
		var geo = view.data.geometry
		var focused = this.props.focused
		var left = (this.props.hasRowLabel ? geo.labelWidth : 0) + this.props.leftOffset
		var sortAttrs = _.pluck(view.data.sorting, 'attribute_id').map(parseInt)

		var style = {
			marginLeft: this.props.leftOffset + 'px',
			height: (geo.headerHeight + 1) + 'px',
			width: (this.props.totalWidth ) -1 + 'px',
			transform: 'translateZ(1px)'
		}

		return <div
			className = {"tabular-view-header wrapper " 
				+ this.props.side + '-header--' + (this.props.focused ? 'focused' : 'blurred') 
				+ ' tabular-view-header--' + (this.props.focused ? 'focused' : 'blurred')}
			style = {style}
			ref = {this.props.side + "-thead"}>
			{this.props.hasRowLabel ?
			<span style = {{left: 0, width: geo.labelWidth + 'px', top: 0, bottom: 0}}
				className = "table-header-cell" >
				<span className = "header-cell-inner" style = {{background: 'white'}}>
				</span>
			</span>
			: null }

			{
			_this.props.columns.map(function (col, idx) {
				var el = <TabularTH key={"th-" + col.attribute_id}
					scrollTop = {_this.props.scrollTop}
					column = {col}
					sorted = {col.attribute_id && (col.attribute_id in view.data.sortIndex)}
					view = {view}
					idx = {idx}
					left = {left}/>;
				left += col.width
				return el
			})
			}
		</div>
	}
})

export default TabularTHead
