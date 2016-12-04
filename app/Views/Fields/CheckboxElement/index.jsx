import React, { Component, PropTypes } from 'react'

import styles from "./checkbox.less"
import constant from "../../../constants/MetasheetConstants"
import modelActionCreators from "../../../actions/modelActionCreators"
import fieldUtils from "../fieldUtils"


export default class BooleanElement extends Component {

	static propTypes = {
		
		/*
		 * informs the top level view element when the element exits edit mode
		 */
		_handleBlur: PropTypes.func,

		/*
		 * a list of functions that return style objects
		 */
		stylers: PropTypes.arrayOf(React.PropTypes.func)

	}

	constructor (props) {
		super(props)
		this.state = {
			value: this.props.parser(props.value)
		}
	}

	handleEdit = () => {
		this.toggle('keyboard');
		this.props._handleBlur();
	}

	handleClick = (e) => {
		e.preventDefault()
		e.stopPropagation()
		e.nativeEvent.stopPropagation()
	}

	handleMouseDown = (e) => {
		e.preventDefault()
		e.stopPropagation()
		e.nativeEvent.stopPropagation()
		this.setState({clicked: true})
		document.body.addEventListener('mouseup', this.handleMouseUp);
	}

	handleMouseUp = (e) => {
		e.preventDefault()
		this.setState({clicked: false})
		document.body.removeEventListener('mouseup', this.handleMouseUp);
	}

	toggle = (method) => {
		this.props.commit(!this.state.value, {method: method})
		this.setState({value: !this.state.value})
	}

	setValue = (value) => {
		this.toggle('keyboard toggle')
	}

	getStyles = () => {
		return fieldUtils.getStyles(
			this.props.stylers,
			this.props.config, 
			this.props.object
		)
	}

	render () {
		var config = this.props.config
		var value = this.props.value
		let styles = this.getStyles()
		styles.textAlign = "center"
		styles.background = "white"

		return <span className= "table-cell" style={this.props.style}>
			<span style = {styles} className = "table-cell-inner">
				<span className = {`checkbox-surround${value?"-checked":"-unchecked"} checkbox-surround-selected 
				${this.state.clicked ? 'checkbox-surround-clicked' : ''}`} onMouseDown = {this.handleMouseDown} onClick=  {this.handleClick}>
					<span className={"check icon " + (value ? "icon-check" : "")} >
					</span>
				</span>
			</span>
		</span>
	}
}
