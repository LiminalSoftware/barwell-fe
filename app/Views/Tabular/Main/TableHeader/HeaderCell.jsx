import React, { Component, PropTypes } from 'react';
import update from 'react/lib/update'
import ReactDOM from "react-dom"

import constants from "../../../../constants/MetasheetConstants"

import FocusStore from "../../../../stores/FocusStore"

import constant from "../../../../constants/MetasheetConstants"

import fieldTypes from "../../../fields"

import modelActionCreators from "../../../../actions/modelActionCreators"

import util from "../../../../util/util"

const COLUMN_MIN_WIDTH = 50

export default class HeaderCell extends Component {

	constructor (props) {
		super(props)
		this.state = {
			resizing: false,
			dragging: false,
			rel: null,
			pos: 0,
			name: this.props.column.name,
			context: false,
      		renaming: false,
      		mouseover: false
		}
	}

	shouldComponentUpdate = (nextProps, nextState) => {
		return this.state.renaming !== nextState.renaming ||
		this.props.width !== nextProps.width ||
		this.props.config !== nextProps.config ||
		this.props.width !== nextProps.width ||
		this.props.left !== nextProps.left ||
		this.state.name !== nextState.name ||
		this.state.resizing !== nextState.resizing
	}

	/*
	 * 
	 */

	_onChange = () => {this.forceUpdate()}

	/*
	 * add global mousemove and mouseup listeners when the drag begins and 
	 * clean them up when it ends
	 */

	componentDidUpdate = (prevProps, prevState) => {
		const {column: config} = this.props

		/* global listener setup and cleanup for drag bar */
		if ((this.state.dragging && !prevState.dragging) ||
			(this.state.resizing && !prevState.resizing)
		) {
			addEventListener('mousemove', this.onMouseMove)
			addEventListener('mouseup', this.onMouseUp)
			this.props._setResizeColumn(config.column_id)
		} 

		else if ( (!this.state.dragging && prevState.dragging) ||
					(!this.state.resizing && prevState.resizing)) {
		   removeEventListener('mousemove', this.onMouseMove)
		   removeEventListener('mouseup', this.onMouseUp)
		   this.props._setResizeColumn(null)
		   
		}

		if (!prevState.renaming && this.state.renaming) {
			addEventListener('keydown', this.handleKeyPress)
			addEventListener('click', this.handleClick)
		}

		/* move cursor to the end of the input upon edit */
		if ((prevState.renaming && !this.state.renaming) ||
			(prevState.context && !this.state.context)) {
			
			removeEventListener('keydown', this.handleKeyPress)
			removeEventListener('click', this.handleClick)
		}
	}

	toggleMenuStyle = (val) => {
		this.setState({open: val})
	}

	/*
	 * render sort and filter icons that appear at the right edge of the header
	 */

	renderIcons = () => {
		console.log(this.props.sorting)
		const type = fieldTypes[this.props.column.type];
		const sortDir = this.props.sortDirection ? 'desc' : 'asc'

		if (this.state.mouseover && !this.state.open && !this.state.renaming) 
			return <span onClick = {this.handleContextMenu} key="menu-icon"
			className={`column-decorator column-menu-icon clickable icon icon--small icon-chevron-down`}/>

		else if (this.props.sorting && !this.state.open && !this.state.renaming)
			return <span onClick={this.switch} key="sort-icon"
			className={`column-decorator  icon-blue icon icon-${type.sortIcon}${sortDir}`}/>
	}

	/*
	 * 
	 */

	onResizerMouseDown = (e) => {
		this.setState({
			resizing: true,
			rel: e.pageX
		})
		e.stopPropagation()
		e.preventDefault()
	}

	onDragMouseDown = (e) => {
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
			resizing: false,
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
		
		if (!this.state.resizing) {
			throw new Error('onMouseMove event when no drag in place')
		}
		const width = Math.max(
			e.pageX - this.state.rel,
			COLUMN_MIN_WIDTH - this.state.rel - this.props.column.width
		)

		this.setState({
			pos: width
		})
		this.props._setColumnSize(width)
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
			width: this.props.width,
			left: this.props.left,
			marginTop: (this.props.sorting ? -1 : 0),
			background: (this.state.mouseover ? constants.colors.GRAY_4 : constants.colors.GRAY_4 )
		}
	}

	/*
	 * 
	 */

	renderResizer = () => {
		const style = {
			right: 0,
			top: 0,
			bottom: 0,
			width: 10
		}

		return <span ref = "resizer"
			className = {`table-resizer col-resizer ${this.state.resizing ? "dragging" : ""}`}
			onMouseDown = {this.onResizerMouseDown}
			style = {style}>
		</span>
	}

	renderContext = () => {
		if (this.state.context) return <ColumnContext 
			{...this.props} config={this.props.column}/>
	}


	handleContextMenu = (e) => {
		this.props._handleContextMenu(e)
	}
	 
	render = () => {
		const _this = this
		const col = this.props.column
		const type = fieldTypes[col.type]
		const geo = this.props.view.data.geometry
		const hasDecorator = this.props.sorting || this.state.mouseover
		const innerStyle = {
			paddingRight: hasDecorator ? '25px' : null,
			lineHeight: geo.headerHeight + 'px'
		}

		return <span style = {this.getCellStyle()}
			onContextMenu = {this.handleContextMenu}
			onDoubleClick = {this.handleRename}
			onMouseEnter = {e => this.setState({mouseover: true})}
			onMouseLeave = {e => this.setState({mouseover: false})}
			className = "table-cell">
			<span className = "table-cell-inner header-cell-inner draggable" 
			style = {innerStyle}>
				{this.state.renaming ?
					<input className="table-cell-renamer" 
						autofocus
						ref="input"
						value={this.state.name}
						onChange={this.handleNameInput}
						onBlur={this.handleBlur}
						onClick={util.clickTrap}/>
					: <span>{this.state.name}</span>}
				{this.renderIcons()}
			</span>
	        {this.renderResizer()}
		</span>
	}


}