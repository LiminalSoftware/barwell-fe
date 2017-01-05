import React, { Component, PropTypes } from 'react'
import ReactDOM from "react-dom"

import util from '../../util/util'
import style from "./style.less"
import _ from "underscore"
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'


// CONSTANTS
import viewTypes from "../../Views/viewTypes"
import constants from "../../constants/MetasheetConstants"

// STORES
import ViewStore from "../../stores/ViewStore"

// ACTIONS
import modelActionCreators from "../../actions/modelActionCreators"

const HELP_HOVER_DEBOUNCE = 300


export default class PopdownMenu extends Component {

	static propTypes = {

		/*
		 * name of the icon class
		 */
		icon: PropTypes.string.isRequired,

		/*
		 * renders the contents of the actual menu
		 */
		menu: PropTypes.element

	}

	constructor (props) {
		super(props)
		// this._debounceSetHover = _.debounce(this.setHover, HELP_HOVER_DEBOUNCE)
		this._debounceSetHover = this.setHover
		this.state = {
			open: false,
			hover: false
		}
	}

	componentWillUnmount = () => {
		removeEventListener('keydown', this.handleKeyPress)
		removeEventListener('click', this.handleClick)
  }

  componentDidUpdate = (prevProps, prevState) => {

		if (!prevState.open && this.state.open) {
			addEventListener('keydown', this.handleKeyPress)
			addEventListener('click', this.handleClick)
		}

		if (prevState.open && !this.state.open) {
			removeEventListener('keydown', this.handleKeyPress)
			removeEventListener('click', this.handleClick)
		}
	}

	handleClick = (e) => {
		var el = ReactDOM.findDOMNode(this)
		if (!util.isDescendant(el, e.target)) this.handleBlur()
	}

	handleBlur = () => {
		this.setState({open: false})
	}

	handleKeyPress = (e) => {
		if (e.keyCode === constants.keycodes.ESC)
			this.handleBlur()
	}

	handleOpenClick = (e) => {
		this.setState({open: !this.state.open})
	}

	handleMouseDown = (e) => {
		this.setState({clicked: true})
		document.addEventListener('mouseup', this.handleMouseUp)
	}

	handleMouseUp = (e) => {
		this.setState({clicked: false})
		document.removeEventListener('mouseup', this.handleMouseUp)
	}

	handleMouseOver = () => {
		this._timer = setTimeout(this.setHover, 250)
	}

	handleMouseOut = () => {
		clearTimeout(this._timer)
		this.unsetHover()
	}

	setHover = () => {
		this.setState({hover: true})
	}

	unsetHover = () => {
		this.setState({hover: false})
	}

	render = () => {
		const {icon, menu, title} = this.props
		const {open, hover} = this.state
		const showLabel = (hover && title && !open)
		const labelStyle = {opacity: (showLabel ? "50%" : "0%")}
		const popdownClass = "icon popdown " + icon +
			(this.state.clicked ?
				this.state.mouseover ? " popdown-clicked ":
				" popdown-cancel ":"") +
			(this.state.open ? " popdown-active" : "")

		return <ReactCSSTransitionGroup {...constants.transitions.fadein}
			style={{position: "relative"}}>
			<span tabindex={this.props.tabIndex}
				className={popdownClass}
				onMouseOver={this.handleMouseOver}
				onMouseOut={this.handleMouseOut}
				onMouseDown={this.handleMouseDown}
				onMouseUp={this.handleMouseUp}
				onClick={this.handleOpenClick}>
				{
				showLabel ?
				<div className="popdown-label-box">
					<span>{this.props.title}</span>
					<span className="popdown-label-pointer"/>
				</div>
				: null
				}
			</span>
			{
			(open && menu) ?
			React.createElement(menu, {
				handleBlur: this.handleBlur ,
				key: "menu",
				...this.props
			})
			: null
			}
		</ReactCSSTransitionGroup>
	}
}
