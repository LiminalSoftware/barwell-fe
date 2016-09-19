import React, { Component, PropTypes } from 'react';
import update from 'react/lib/update'
import ReactDOM from "react-dom"
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

import constants from "../../../../constants/MetasheetConstants"

import FocusStore from "../../../../stores/FocusStore"

import constant from "../../../../constants/MetasheetConstants"
import fieldTypes from "../../../fields"

import ColumnContext from "./ColumnContext"

import modelActionCreators from "../../../../actions/modelActionCreators"
import util from "../../../../util/util"

const COLUMN_MIN_WIDTH = 50

export default class HeaderCell extends Component {

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

	/*
	 * 
	 */

	_onChange = () => {this.forceUpdate()}

	/*
	 * add global mousemove and mouseup listeners when the drag begins and 
	 * clean them up when it ends
	 */

	componentDidUpdate = (newProps, newState) => {
		/* global listener setup and cleanup for drag bar */
		if (this.state.dragging && !newState.dragging) {
			addEventListener('mousemove', this.onMouseMove)
			addEventListener('mouseup', this.onMouseUp)
		} else if (!this.state.dragging && newState.dragging) {
		   removeEventListener('mousemove', this.onMouseMove)
		   removeEventListener('mouseup', this.onMouseUp)
		}

		if (!newState.renaming && this.state.renaming ) {
			addEventListener('keydown', this.handleKeyPress)
			addEventListener('click', this.handleClick)
		}

		/* move cursor to the end of the input upon edit */
		if (newState.renaming && !this.state.renaming) {
			const input = this.refs.input
			if (input) {
				const val = input.value
				this.refs.input.value = ''
				this.refs.input.value = val
			}
			
			removeEventListener('keydown', this.handleKeyPress)
			removeEventListener('click', this.handleClick)
		}
	}

	/*
	 * render sort and filter icons that appear at the right edge of the header
	 */

	renderIcons = () => {
		const type = fieldTypes[this.props.column.type];
		const sortDir = this.props.sortDirection ? 'desc' : 'asc'

		if (this.state.mouseover && !this.state.open && !this.state.renaming) 
			return <span onClick = {this.props._handleContextMenu} 
			key="menu-icon"
			style = {{marginTop: 8, marginRight: 2, marginLeft: 6}}
			className={`flush clickable icon icon--small icon-chevron-down`}/>

		else if (this.props.sorting && !this.state.open && !this.state.renaming)
			return <span onClick={this.switch}
			key="sort-icon"
			className={`sort-th-label-focused flush icon icon-${type.sortIcon}${sortDir}`}/>
	}

	/*
	 * 
	 */

	onResizerMouseDown = (e) => {
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

	// setColumnWidth = (width, commit) => {
	// 	const view = this.props.view
	// 	const col = this.props.column
 	//  	view.data.columns[col.column_id].width = width
	// 	modelActionCreators.createView(view, !!commit, false)
	// }

	/*
	 * if mouseup occurs during drag, cancel drag and commit view changes
	 */

	onMouseUp = (e) => {
   		const {view, column} = this.props
		
		const updated = update(view, {
			data : {
				columns: {
					[column.column_id]: {
						$merge: {
							width: column.width + this.state.pos
						}
					}
				}
			}
		})
		
		modelActionCreators.createView(updated, true)
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

	handleBlurRenamer = (revert) => {
		const {column} = this.props
		if (!revert) {
			modelActionCreators.renameColumn(column, this.state.name)
		}
  		this.setState(update(this.state, {
  			renaming: {$set: false},
  			name: {$set: (revert ? column.name : this.state.name)}
  		}))
	}

	componentDidMount = () => {
		
	}

	componentWillUnmount = () => {
		removeEventListener('keyup', this.handleKeyPress)
		removeEventListener('click', this.handleClick)
		removeEventListener('mousemove', this.onMouseMove)
		removeEventListener('mouseup', this.onMouseUp)
	}

	handleKeyPress = (e) => {
		if (event.keyCode === constant.keycodes.ESC)
			this.handleBlurRenamer(true)
		if (event.keyCode === constant.keycodes.ENTER)
			this.handleBlurRenamer(false)
	}

	handleClick = (e) => {
		this.handleBlurRenamer()
	}

	getFocus = () => {
		modelActionCreators.setFocus('v' + this.props.view.view_id + '-header')
	}

	handleRename = (e) => {
		this.getFocus()
		this.setState({renaming: true})
	}

	handleNameInput = (e) => {
		this.setState(update(this.state, {
			name: {$set: e.target.value}
		}))
	}

	/*
	 * 
	 */

	getCellStyle = () => {
		return {
			width: this.props.column.width + (this.props.sorting ? 1 : 0),
			left: this.props.left,
			borderTop: (this.state.open ? '1px solid ' : this.props.sorting ? `1px solid ${constants.colors.BLUE_1}` : null),
			marginTop: (this.props.sorting ? -1 : 0),
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
				{this.state.renaming ?
					<input className="table-cell-renamer" 
						autofocus
						ref="input"
						value={this.state.name}
						onChange={this.handleNameInput}
						onBlur={this.handleBlur}
						onClick={util.clickTrap}/>
					: <span>{this.state.name}</span>}
				<ReactCSSTransitionGroup
				class="column-context-box"
				style={{position: 'absolute', right: 2, top: this.props.top || 0, bottom: 2, width: 25, padding: 0}}
				{...constants.transitions.fadeinout}>
				{this.renderIcons()}
				</ReactCSSTransitionGroup>
			</span>
	        {this.renderResizer()}
		</span>
	}


}