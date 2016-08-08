import React, { Component, PropTypes } from 'react'

import styles from "./booleanStyles.less"
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
		this.toggle('mouse click')
		e.preventDefault()
		e.stopPropagation()
		e.nativeEvent.stopPropagation()
	}

	toggle = (method) => {
		this.commitValue(!this.state.value, {method: method})
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

		return <span className= "table-cell table-cell-selected" style={this.props.style}>
			<span style = {this.getStyles()} className = "table-cell-inner">
				<span className = {"checkbox-surround" + (this.state.value ? "-checked" : "")} onClick=  {this.handleClick}>
					<span className={"check green icon " + (this.state.value ? "icon-check" : "")} >
					</span>
				</span>
			</span>
		</span>
	}
}
