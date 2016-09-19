import React from "react"
import $ from "jquery"
import styles from "./style.less"

import _ from 'underscore'
import fieldTypes from "../../../fields"
import modelActionCreators from "../../../../actions/modelActionCreators"
import FocusStore from "../../../../stores/FocusStore"

import util from "../../../../util/util"
import constants from "../../../../constants/MetasheetConstants"

import FooterCell from "./FooterCell"

const HAS_3D = util.has3d()

var TableFooter = React.createClass ({

	shouldComponentUpdate: function (nextProps) {
		return nextProps.leftOffset !== this.props.leftOffset ||
				nextProps.view !== this.props.view || 
				nextProps.focused !== this.props.focused
	},

	render: function () {
		const _this = this
		const {view, model, side} = this.props
		const geo = view.data.geometry
		let left = (this.props.hasRowLabel ? geo.labelWidth : 0) + this.props.leftOffset
		
		const style = {
			borderRight:  "1px solid " + (this.props.side==='lhs' ? constants.colors.TABLE_EDGE : constants.colors.TABLE_BORDER),
			borderTop: `1px solid ${constants.colors.TABLE_EDGE}`,
			height: (this.props.height || (geo.footerHeight + 1)) + 'px',
			bottom: 0,
			top: 'auto',
			width: this.props.totalWidth ? (this.props.totalWidth) : null,
			right: this.props.totalWidth ? null : 0,
			transform: HAS_3D ? side === 'lhs' ? 'translateZ(5px)' : 'translateZ(4px)' : '',
			zIndex: side === 'lhs' ? 5 : 4,
			background: constants.colors.VIEW_BACKING
		}

		const classes = `tabular-view-header wrapper 
			${this.props.side}-header--focused 
			tabular-view-header--focused`

		return <div
			className={classes} style={style}
			ref = {this.props.side + "-thead"}>
			{
			this.props.hasRowLabel ?
			<span style = {{left: 0, width: geo.labelWidth + 'px', top: 0, bottom: 0, background: constants.colors.TABLE_BACKING}}
				className = "table-row-label table-cell" >
				<span className = "table-cell-inner">
				<span style = {{marginLeft: "2px"}} className = "checkbox-surround "></span>
				</span>
			</span>
			: null 
			}

			{
			_this.props.columns.map(function (col, idx) {
				var sortIndex = view.data.sortIndex || {};
				var sorting = (('a' + col.attribute_id) in sortIndex) ? sortIndex['a' + col.attribute_id] : null;

				var el = <FooterCell {..._this.props}
					key={col.column_id}
					ref={"head-" + col.column_id}
					column = {col}
					sorting = {sorting}
					idx = {idx}
					left = {left}
					width = {col.width - 1}/>;
				left += col.width
				return el
			})
			}

		</div>
	}
})

export default TableFooter