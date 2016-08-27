import React from "react"
import $ from "jquery"
import styles from "../styles/headers.less"

import _ from 'underscore'
import fieldTypes from "../../../fields"
import modelActionCreators from "../../../../actions/modelActionCreators"
import FocusStore from "../../../../stores/FocusStore"

import util from "../../../../util/util"
import constants from "../../../../constants/MetasheetConstants"

import HeaderCell from "./HeaderCell"

const HAS_3D = util.has3d()

var TableHeader = React.createClass ({

	shouldComponentUpdate: function (nextProps) {
		return nextProps.leftOffset !== this.props.leftOffset ||
				nextProps.view !== this.props.view || 
				nextProps.focused !== this.props.focused
	},

	render: function () {
		const _this = this
		const view = this.props.view
		const model = this.props.model
		const geo = view.data.geometry
		var left = (this.props.hasRowLabel ? geo.labelWidth : -1) + this.props.leftOffset
		var sortAttrs = _.pluck(view.data.sorting, 'attribute_id').map(parseInt)
		
		const style = {
			borderRight: this.props.side==='lhs' ? ("1px solid " + constants.colors.RED_BRIGHT_TRANS) : null,
			marginLeft: this.props.leftOffset + 'px',
			height: (this.props.height || (geo.headerHeight + 1)) + 'px',
			width: (this.props.totalWidth ) -1 + 'px',
			transform: HAS_3D ? 'translateZ(1px)' : ''
		}

		const classes = `tabular-view-header wrapper 
			${this.props.side}-header--focused 
			tabular-view-header--focused`

		return <div
			className={classes} style={style}
			ref = {this.props.side + "-thead"}>
			{
			this.props.hasRowLabel ?
			<span style = {{left: 0, width: geo.labelWidth + 'px', top: 0, bottom: 0}}
				className = "table-row-label table-header-cell" >
				<span className = "header-cell-inner table-cell-inner" style = {{background: 'white'}}>
				<span style = {{marginLeft: "2px"}} className = "checkbox-surround "></span>
				</span>
			</span>
			: null 
			}

			{
			_this.props.columns.map(function (col, idx) {
				var sortIndex = view.data.sortIndex || {};
				var sorting = (col.attribute_id in sortIndex) ? sortIndex[col.attribute_id] : null;

				var el = <HeaderCell {..._this.props}
					key={col.column_id}
					ref={"head-" + col.column_id}
					scrollTop={_this.props.scrollTop}
					column = {col}
					sorting = {sorting}
					view = {view}
					model = {model}
					idx = {idx}
					left = {left}
					width = {col.width - 2}/>;
				left += col.width
				return el
			})
			}

			{this.props.hasRowLabel ? null :
			<span 
				onClick = {this.props.showAttributeAdder}
				style = {{left: left + 10 + 'px', top: "-1px", bottom: "2px", width: "32px", padding: 0}}
				className = 'table-header-cell new-adder'>
					<span className="icon icon-plus" style={{margin: 0}}/>
			</span>
			}
		</div>
	}
})

export default TableHeader
