import React, { Component, PropTypes } from 'react';
import ReactDOM from "react-dom"
import $ from "jquery"

import constant from "../../../../constants/MetasheetConstants"
import fieldTypes from "../../../fields"
import FocusStore from "../../../../stores/FocusStore"

import modelActionCreators from "../../../../actions/modelActionCreators"

import AttributeContext from "./AttributeContext"

const COLUMN_MIN_WIDTH = 50

export default class HeaderCell extends Component {

	constructor (props) {
		super(props)
		this.state = {
			dragging: false,
			rel: null,
			pos: 0,
      		open: false,
      		mouseover: false
		}
	}

	_onChange = () => {this.forceUpdate()}

	/*
	 * 
	 */

	componentWillUpdate = (newProps, newState) => {

		if (!this.state.open && newState.open) {
			FocusStore.addChangeListener(this._onChange)
		} else if (this.state.open && !newState.open) {
			FocusStore.removeChangeListener(this._onChange)
		}
	}

	/*
	 * add global mousemove and mouseup listeners when the drag begins and 
	 * clean them up when it ends
	 */

	componentDidUpdate = (newProps, newState) => {
		const focus = FocusStore.getFocus()
		const column = this.props.column

		if (focus !== column.column_id && this.state.open) this.setState({open: false})

		if (this.state.dragging && !newState.dragging) {
			addEventListener('mousemove', this.onMouseMove)
			addEventListener('mouseup', this.onMouseUp)
		} else if (!this.state.dragging && newState.dragging) {
		   removeEventListener('mousemove', this.onMouseMove)
		   removeEventListener('mouseup', this.onMouseUp)
		}
	}

	/*
	 * 
	 */

	renderIcons = () => {
		const type = fieldTypes[this.props.column.type];
		const blurFocus = this.props.focused ? "focused" : "blurred"
		const sortDir = this.props.sortDirection ? 'desc' : 'asc'

		if (this.state.mouseover && !this.state.open) 
			return <span onClick = {this.handleContextMenu} 
			className={`sort-th-label-${blurFocus} icon icon-cog`}/>

		else if (this.props.sorting && !this.state.open)
			return <span onClick={this.switch}
			className={`sort-th-label-${blurFocus} ` + 
			`icon icon-${type.sortIcon}${sortDir}`}/>
	}

	/*
	 * 
	 */

	getCellStyle = () => {
		return {
			width: this.props.column.width + 'px',
			left: this.props.left + 'px'
		}
	}

	/*
	 * 
	 */

	renderContextMenu = () => {
		if (this.state.open) 
			return <AttributeContext {...this.props}
        		handleBlur = {this.handleBlur}/>
	}

	/*
	 * 
	 */

	renderResizer = () => {
		const style = {
			right: (-1 * this.state.pos) + 'px',
			top: "0",
			height: this.state.dragging ? "1000px" : "100%",
			width: this.state.dragging ? "2px" : "10px"
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

	isFocused = () => {
		const view = this.props.view
		const column = this.props.column
		const focus = FocusStore.getFocus()
		return (focus === column.column_id || focus === 'v' + view.view_id)
	}

	/*
	 * 
	 */

	render = () => {
		const _this = this
		const col = this.props.column
		const type = fieldTypes[col.type];
		const innerStyle = {
			paddingRight: this.props.sorting || this.state.mouseover ? '25px' : null,
			border: this.state.open ? "1px solid steelblue" : null,
			borderBottom: this.state.open ? "1px solid white" : null,
			margin: this.state.open ? "-1px" : null
		}
		const blurFocus = this.props.focused ? "focused" : "blurred"	

		return <span style = {this.getCellStyle()}
			onContextMenu = {this.handleContextMenu}
			onMouseEnter = {e => this.setState({mouseover: true})}
			onMouseLeave = {e => this.setState({mouseover: false})}
			className = {`table-header-cell ${this.isFocused() ? '' : " gray-out "}`}>
			<span className = "table-cell-inner header-cell-inner " 
			style = {innerStyle}>
				<span className = {`type-th-label-${blurFocus} icon icon-${type.icon}`}/>
				{col.name}
				{this.renderIcons()}
			</span>
			{this.renderContextMenu()}
	        {this.renderResizer()}
		</span>
	}

	/*
	 * 
	 */


	/*
	 * 
	 */

	onResizerMouseDown = (e) => {
		var pos = $(ReactDOM.findDOMNode(this)).offset()
		this.setState({
			dragging: true,
			rel: e.pageX
		})
		e.stopPropagation()
		e.preventDefault()
	}

	/*
	 * set column width
	 */

	setColumnWidth = (width, commit) => {
		const view = this.props.view
		const col = this.props.column
   		view.data.columns[col.column_id].width = width
		modelActionCreators.createView(view, !!commit, false)
	}

	/*
	 * if mouseup occurs during drag, cancel drag and commit view changes
	 */

	onMouseUp = (e) => {
   		const view = this.props.view
		const col = this.props.column

   		view.data.columns[col.column_id].width = (col.width + this.state.pos)
		modelActionCreators.createView(view, true, false)
		this.setState({
			dragging: false,
			pos: 0
		})
		e.stopPropagation()
		e.preventDefault()
	}

	/*
	 * while drag is active, update the width of the column
	 */

	onMouseMove = (e) => {
		if (!this.state.dragging) {
			throw new Error('onMouseMove event when no drag in place')
		}
		this.setState({
	      pos: Math.max(
	      	e.pageX - this.state.rel,
	      	COLUMN_MIN_WIDTH - this.state.rel - this.props.column.width
	      )
	   })
	   e.stopPropagation()
	   e.preventDefault()
	}

	

	/*
	 * 
	 */


	handleContextMenu = (e) => {
	  	modelActionCreators.setFocus(this.props.column.column_id)
	  	this.setState({open: true})
	  	// e.preventDefault()
	}

	/*
	 * 
	 */


	handleBlur = () => {
  		this.setState({open: false})
	}

	/*
	 * 
	 */

	handleKeyPress = (e) => {
		if (event.keyCode === constant.keycodes.ESC)
			this.handleBlur()
	}

}