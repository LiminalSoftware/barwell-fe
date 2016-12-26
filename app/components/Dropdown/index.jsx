import React, { Component, PropTypes } from 'react'
import util from '../../util/util'
import style from "./style.less"
import * as ui from '../../util/uiHelpers'
import _ from "underscore"
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
import constants from "../../constants/MetasheetConstants"

// MIXINS
import blurOnClickMixin from "../../blurOnClickMixin"
import popdownClickmodMixin from '../../Views/Fields/popdownClickmodMixin'

// CONSTANTS
import viewTypes from "../../Views/viewTypes"

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
		menu: PropTypes.class

	}

	constructor (props) {
		super(props)
		this._debounceSetHover = _.debounce(this.setHover, HELP_HOVER_DEBOUNCE)
		this.state = {
			open: false,
			hover: false,
			mouseover: false,
		}
	}

	componentWillUpdate = ui.blurListeners.bind(this)

	handleBlur = ui.handleBlur.bind(this)

	addListeners = ui.addListeners.bind(this)

	removeListeners = ui.removeListeners.bind(this)

	handleClick = ui.handleClick.bind(this)

	handleBlur = ui.handleBlur.bind(this)

	handleKeyPress = ui.handleBlurKeyPress.bind(this)

	handleOpenClick = (e) => {
		this.setState({open: true})
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
		this._debounceSetHover(true)
		this.setState({mouseover: true})
	}

	handleMouseOut = () => {
		this._debounceSetHover(false)
		this.setState({mouseover: false})
	}

	setHover = (hover) => {
		this.setState({hover: hover})
	}

	render = () => {
		const {icon, menu} = this.props

		return  <ReactCSSTransitionGroup {...constants.transitions.fadeinout} style={{position: "relative"}}>
			<span tabindex={this.props.tabIndex} className={"icon popdown " + icon +
				(this.state.clicked? this.state.mouseover?" popdown-clicked ":" popdown-cancel ":"") + 
				(this.state.open? " popdown-active":"")}
				onMouseOver={this.handleMouseOver}
				onMouseOut={this.handleMouseOut}
				onMouseDown={this.handleMouseDown}
				onMouseUp={this.handleMouseUp}
				onClick={this.handleOpenClick}/>
			{this.state.hover && this.props.title && !this.state.open ? 
				<div className="popdown-label-box">
					{this.props.title}
					<span className="popdown-label-pointer"/>
				</div>
				: null
			}
			{this.state.open && menu ? 
				React.createElement(menu, Object.assign({handleBlur: this.handleBlur , key: "menu"}, this.props)) 
				: null}
			</ReactCSSTransitionGroup>
	}
}