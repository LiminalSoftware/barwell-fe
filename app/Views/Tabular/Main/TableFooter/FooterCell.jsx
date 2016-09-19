import React, { Component, PropTypes } from 'react';
import update from 'react/lib/update'
import ReactDOM from "react-dom"
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

import constants from "../../../../constants/MetasheetConstants"

import FocusStore from "../../../../stores/FocusStore"

import constant from "../../../../constants/MetasheetConstants"
import fieldTypes from "../../../fields"

import modelActionCreators from "../../../../actions/modelActionCreators"
import util from "../../../../util/util"

const COLUMN_MIN_WIDTH = 50

export default class FooterCell extends Component {

	constructor (props) {
		super(props)
		this.state = {
			dragging: false,
			rel: null,
			pos: 0,
			name: this.props.column.name,
			context: false,
      		renaming: false,
      		mouseover: false
		}
	}

	getCellStyle = () => {
		return {
			width: this.props.column.width + (this.props.sorting ? 1 : 0),
			left: this.props.left,
			borderLeft: (this.props.sorting ? `1px solid ${constants.colors.BLUE_1}` : null),
			borderRight: (this.props.sorting ? `1px solid ${constants.colors.BLUE_1}` : null),
			// background: (this.state.mouseover ? constants.colors.GRAY_4 : constants.colors.GRAY_4 ),
			zIndex: (this.props.sorting ? 12 : null)
		}
	}

	/*
	 * 
	 */

	renderResizer = () => {
		const style = {
			right: (-1 * this.state.pos - 2),
			top: 0,
			height: this.state.dragging ? 1000 : "100%",
			width: this.state.dragging ? 2 : 10
		}

		if (!this.state.open) return <span ref = "resizer"
			className = {`table-resizer col-resizer ${this.state.dragging ? "dragging" : ""}`}
			onMouseDown = {this.onResizerMouseDown}
			style = {style}>
		</span>
	}

	/*
	 * 
	 */
	 
	render = () => {
		const _this = this
		const col = this.props.column
		const type = fieldTypes[col.type]
		const geo = this.props.view.data.geometry
		const innerStyle = {
			paddingRight: this.props.sorting || this.state.mouseover ? '25px' : null,
			lineHeight: geo.headerHeight + 'px'
		}

		return <span style = {this.getCellStyle()}
			onContextMenu = {this.props._handleContextMenu}
			onDoubleClick = {this.handleRename}
			onMouseEnter = {e => this.setState({mouseover: true})}
			onMouseLeave = {e => this.setState({mouseover: false})}
			className = "table-cell">
			<span className = "table-cell-inner header-cell-inner"
			style = {innerStyle}>
				{/*<span className="type-label">{type.description}</span>*/}
				
	        {this.renderResizer()}
	        </span>
		</span>
	}


}