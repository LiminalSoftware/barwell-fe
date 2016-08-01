import React, { Component, PropTypes } from 'react';
import ReactDOM from "react-dom"
import $ from "jquery"


import _ from 'underscore'

import fieldTypes from "../../../fields"
import modelActionCreators from "../../../../actions/modelActionCreators"
import FocusStore from "../../../../stores/FocusStore"
import AttributeStore from "../../../../stores/AttributeStore"

const COLUMN_MIN_WIDTH = 50

export default class HeaderCell extends Component {

	constructor (props) {
		super(props)
		this.state = {
			dragging: false,
			rel: null,
			pos: 0,
      		context: false,
      		open: false,
      		mouseover: false
		}
	}

	renderIcons = () => {
		const type = fieldTypes[this.props.column.type];
		const blurFocus = this.props.focused ? "focused" : "blurred"
		const sortDir = this.props.sortDirection ? 'desc' : 'asc'

		if (this.state.mouseover) 
			return <span onClick = {e => this.setState({open: true})} 
			className={`sort-th-label-${blurFocus} icon icon-cog`}/>

		else if (this.props.sorting)
			return <span onClick={this.switch}
			className={`sort-th-label-${blurFocus} ` + 
			`icon icon-${type.sortIcon}${sortDir}`}/>
	}

	render = () => {
		const _this = this
		const geo = this.props.view.data.geometry
		const col = this.props.column
		const cellStyle = {
			width: col.width + (this.state.open ? 1 : 0) + 'px',
			left: this.props.left + 'px',
			height: this.state.open ? '300px' : '100%',
			maxHeight: this.state.open ? '300px' : (geo.headerHeight + 'px'),
			transition: 'max-height cubic-bezier(.1,.85,.5,1) 100ms'
		}
		const type = fieldTypes[col.type];
		const innerStyle = {paddingRight: this.props.sorting || this.state.mouseover ? '25px' : null}
		const blurFocus = this.props.focused ? "focused" : "blurred"	

		return <span style = {cellStyle}
			onContextMenu = {this.onContextMenu}
			onMouseOver = {e => this.setState({mouseover: true})}
			onMouseLeave = {e => this.setState({mouseover: false})}
			className = 'table-header-cell '>
			<span className = "table-cell-inner header-cell-inner " 
			style = {innerStyle}>
				<span className = {`type-th-label-${blurFocus} icon icon-${type.icon}`}/>
				{col.name}
				{this.renderIcons()}
			</span>
			{
			this.state.context ?
			<TabularTHContext
        		headerHeight = {geo.headerHeight}
        		config = {col}
        		handleBlur = {this.handleBlur}/>
        	: null
	        }
	        {
	        this.state.open ? null :
			<span ref = "resizer"
				className = {"table-resizer col-resizer " + (this.state.dragging ? "dragging" : "")}
				onMouseDown = {this.onResizerMouseDown}
				style = {{
					right: (-1 * this.state.pos) + 'px',
					top: "0",
					height: this.state.dragging ? "1000px" : "100%",
					width: this.state.dragging ? "2px" : "10px"
				}}>
			</span>
			}
		</span>
	}

	/*
	 * 
	 */

	componentDidMount = () => {
		var col = this.props.column
		this.setState(col)
	}

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
	 * add global mousemove and mouseup listeners when the drag begins and 
	 * clean them up when it ends
	 */

	componentDidUpdate = (props, state) => {
		if (this.state.dragging && !state.dragging) {
			addEventListener('mousemove', this.onMouseMove)
			addEventListener('mouseup', this.onMouseUp)
		} else if (!this.state.dragging && state.dragging) {
		   removeEventListener('mousemove', this.onMouseMove)
		   removeEventListener('mouseup', this.onMouseUp)
		}
	}

	/*
	 * 
	 */


	onContextMenu = (e) => {
		// disable column context menus for now
	  	// modelActionCreators.setFocus('view-config')
	  	// this.setState({context: true})
	  	e.stopPropagation()
		e.preventDefault()
	}

	/*
	 * 
	 */


	handleBlur = () => {
  		modelActionCreators.setFocus('view')
  		this.setState({context: false})
	}

	/*
	 * 
	 */

	handleKeyPress = (e) => {
		if (event.keyCode === constant.keycodes.ESC)
			this.handleBlur()
	}

}