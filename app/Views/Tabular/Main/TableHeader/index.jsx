import React, { Component, PropTypes } from 'react';
import styles from "./style.less"

import _ from 'underscore'
import fieldTypes from "../../../fields"
import modelActionCreators from "../../../../actions/modelActionCreators"
import FocusStore from "../../../../stores/FocusStore"

import util from "../../../../util/util"
import constants from "../../../../constants/MetasheetConstants"

import HeaderCell from "./HeaderCell"
import FooterCell from "./FooterCell"

const HAS_3D = util.has3d()

export default class TableHeaderFooter extends Component {

	static propTypes = {
		
		/*
		 * must be either 'header' or 'footer'
		 */
		headerOrFooter: PropTypes.oneOf(['header','footer']),
		
		/*
		 * must be either 'lhs' or 'rhs'
		 */
		serializer: PropTypes.oneOf(['lhs','rhs']),

		/*
		 * 
		 */
		view: PropTypes.object,

		/*
		 * 
		 */
		leftOffset: PropTypes.number

	}


	constructor (props) {
		super(props)
		this.state = {}
	}

	shouldComponentUpdate = (nextProps, nextState) => {
		return nextProps.leftOffset !== this.props.leftOffset ||
				nextProps.view !== this.props.view || 
				// nextProps.focused !== this.props.focused ||
				nextProps.dragOffset !== this.props.dragOffset ||
				nextProps.totalWidth !== this.props.totalWidth ||
				nextProps.resizeColumn !== this.props.resizeColumn
	}

	getStyle = () => {
		const {view, model, side, headerOrFooter, height, totalWidth} = this.props
		const geo = view.data.geometry
		const colors = constants.colors

		return {
			borderRight:  `1px solid ${side==='lhs' ?
				colors.TABLE_EDGE : "transparent"}`,
			borderBottom: headerOrFooter === 'header' ? `1px solid ${colors.TABLE_EDGE}` : 'none',
			borderTop: headerOrFooter === 'footer' ? `1px solid ${colors.TABLE_EDGE}` : 'none',

			height: (height || (geo[headerOrFooter + "Height"] + 1)) + 'px',
			width: totalWidth || "auto",
			right: totalWidth ? "auto" : 0,
			transform: HAS_3D ? 'translateZ(0)' : '',
			zIndex: side === 'lhs' ? 6 : 4,
			background: constants.colors.VIEW_BACKING,
			top: headerOrFooter === 'header' ? 0 : "auto",
			bottom: headerOrFooter === 'footer' ? 0 : "auto"
		}
	}

	render = () => {
		const _this = this
		const {view, model, side, dragOffset, resizeColumn, headerOrFooter, hasRowLabel} = this.props
		const sortIndex = view.data.sortIndex || {};
		const geo = view.data.geometry
		const classes = `tabular-view-${headerOrFooter} wrapper`
		const childType = headerOrFooter === 'footer' ? FooterCell : HeaderCell

		let left = (hasRowLabel ? geo.labelWidth : 0) + this.props.leftOffset
		
		const checkbox = false ? `<span className="check purple icon icon-check"></span>` : '';
		

		return <div
			className={classes} style={this.getStyle()}
			ref = {this.props.side + "-" + headerOrFooter}>
			{
			this.props.hasRowLabel ?
			<span style = {{left: 0, width: geo.labelWidth + 'px', top: 0, bottom: 0, background: constants.colors.TABLE_BACKING}}
				className = "table-row-label table-cell" >
				<span className = "table-cell-inner">
				{this.props.headerOrFooter === 'header' ? <span style = {{marginLeft: 18, marginTop: 5}}
					className = "checkbox-surround-unchecked checkbox-surround-selected">	
					{checkbox}
				</span> : null }
				</span>
			</span>
			: null 
			}
			
			{
			_this.props.columns.map(function (col, idx) {
				const sorting = (('a' + col.attribute_id) in sortIndex) ? sortIndex['a' + col.attribute_id] : null;
				const width = col.width + (col.column_id === resizeColumn ? dragOffset : 0)
				const cellProps = Object.assign({
					key: col.column_id,
					ref: "head-" + col.column_id,
					column: col,
					sorting: sorting,
					idx: idx,
					left: left,
					_setResizeColumn: _this.props._setResizeColumn,
					_setColumnSize: _this.props._setColumnSize,
					width: width,
					view: view,
					_handleContextMenu: _this.props._handleContextMenu
				})
				left += width
				return React.createElement(childType, cellProps)
			})
			}

			{!this.props.hasColumnAdder ? null :
			<span 
				onClick = {this.props._handleAddAttribute}
				style = {{
					left: left + 1,
					top: 0,
					bottom: 0, 
					width: geo.colAddWidth, 
					padding: 0,
					borderTopLeftRadius: 0,
					borderBottomLeftRadius: 0,
					zIndex: 35
				}}
				className = 'table-header-cell new-adder'>
					<span className="icon icon-plus" style={{margin: 0}}/>
			</span>
			}
		</div>
	}
}