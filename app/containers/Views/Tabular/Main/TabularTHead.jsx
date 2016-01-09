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
		return (nextProps.leftOffset !== this.props.leftOffset)
	},

	render: function () {
		var _this = this
		var view = this.props.view
		var geo = view.data.geometry
		var focused = this.props.focused
		var left = 0

		var style = {
			top: 0,
			left: 0,
			marginLeft: this.props.leftOffset + 'px',
			height: (geo.headerHeight + 1) + 'px',
			width: (this.props.totalWidth) + 'px'
		}

		return <div
			className = {"tabular-view-header " + this.props.side + '-header'}
			style = {style}
			ref = {this.props.side + "-thead"}>
			{this.props.hasRowLabel ?
			<span style = {{left: 0, right: (left += geo.labelWidth), top: 0, bottom: 0}}
				className = "table-cell header-table-cell">
				<span className = "table-cell-inner ">
				</span>
			</span>
			: null }

			{
			_this.props.columns.map(function (col, idx) {
				var el = <TabularTH key={"th-" + col.attribute_id}
					scrollTop = {_this.props.scrollTop}
					column = {col}
					view = {view}
					idx = {idx}
					left = {left}/>;
				left += col.width
				return el
			})
			}
			{
				this.props.side === 'rhs' ?
				<span style={{left: (left) + 'px',
					width: 100 + 'px',
					height: geo.headerHeight}}
					className= "table-cell table-header-cell columnAdder ">
					<span className="table-cell-inner"> + </span>
				</span>
				:
				null
			}
		</div>
	}
})

export default TabularTHead
