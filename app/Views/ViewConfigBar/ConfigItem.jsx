import React, { Component, PropTypes } from 'react'
import update from 'react/lib/update'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import constants from "../../constants/MetasheetConstants"
import FocusStore from "../../stores/FocusStore"
import modelActionCreators from "../../actions/modelActionCreators"



export default class ConfigItem extends Component {

	static propTypes = {
		model: PropTypes.object.isRequired,
		view: PropTypes.object.isRequired,
		menu: PropTypes.any.isRequired,
		icon: PropTypes.string.isRequired,
		hoverText: PropTypes.string,
		isActive: PropTypes.bool,
	}

	constructor (props) {
	    super(props)
		this.state = {
	    	pushed: false
		}
	}

	shouldComponentUpdate = (newProps, newState) => {
		const focusId = this.getFocusId()
		const wasFocused = this.props.focus === focusId
		const willBeFocused = newProps.focus === focusId

		return wasFocused !== willBeFocused || 
			this.state.pushed !== newState.pushed
	}

	getFocusId = () => {
		return 'v' + this.props.view.view_id + '-' + this.props.hoverText
	}

	isFocused = () => {
		return this.props.focus === this.getFocusId()
	}

	handleOpen = (e) => {
		const focus = FocusStore.getFocus()
		const thisFocusId = this.getFocusId()
		const view = this.props.view
		
		modelActionCreators.setFocus(
			this.isFocused() ? ('v' + view.view_id) : this.getFocusId()
		)
	}

	handleMouseDown = (e) => {
		this.setState({pushed: true})
	}

	handleClearMouseDown = (e) => {
		this.setState({pushed: false})
	}

	renderMenu = () => {
		return  React.createElement(
			this.props.menu, 
			Object.assign({}, this.props, {key: "menu"})
		)
	}

	render = () => {
		const focused = this.isFocused()
		const classes = `view-config-item${(this.state.pushed) ? "--pushed" : 
			this.props.isActive ? "--active" : ""}`

		return <div 
		onClick={this.handleOpen}
		onMouseDown={this.handleMouseDown}
		onMouseUp={this.handleClearMouseDown}
		onMouseOut={this.handleClearMouseDown}
		className={classes}
		title={this.props.hoverText}>
			<ReactCSSTransitionGroup {...constants.transitions.fadeinout}>
				<span key="icon" className={`icon ${this.props.icon}`} style={{margin: 0}}/>
				{focused ? this.renderMenu() : null}
			</ReactCSSTransitionGroup>
		</div>
	}
} 