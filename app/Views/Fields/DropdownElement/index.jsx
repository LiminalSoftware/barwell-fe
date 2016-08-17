import React, { Component, PropTypes } from 'react'
import util from "../../../util/util"
import constants from "../../../constants/MetasheetConstants"
import fieldUtils from "../fieldUtils"

import styles from "./dropdown.less"

import FocusStore from "../../../stores/FocusStore"
import modelActionCreators from "../../../actions/modelActionCreators"

import SearchDropdown from "../HasSomeParts/SearchDropdown"

export default class DropdownElement extends Component {

	/*
	 * LIFECYCLE **************************************************************
	 */

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
		const config = this.props.config
		this.state = {
			newitemedit: false,
			open: false,
			value: props.value
		}
	}

	/*
	 * update internal value state with the new value unless we're editing.
	 * on blur, the state change {editing: false} will still be dirty by
	 * the time we get new props from the parent (in the case of a cursor move)
	 */

	componentWillReceiveProps = (props)  => {
		const config = this.props.config
		if (!this.state.editing)
		this.setState({value: props.value})
	}
	

	/*
	 * HANDLERS ***************************************************************
	 */

	/*
	 * takes the cell into edit mode
	 */

	handleEdit = (clobber) => {
		this.setState({open: true})
	}

	/*
	 * escapes out of edit mode and either commits the state value or
	 * reverts to the prop value
	 * uses the supplied commit method to persist to server (only if changed)
	 */
	
	handleBlur = (revert) => {
		const config = this.props.config
		const hasChanged = this.state.value !== this.props.value
		
		this.setState({
			open: false,
			value: revert !== true ? 
				this.state.value : 
				this.props.value
		})
	}

	/*
	 * updates internal value state in response to an input event
	 */

	handleChange = (event) => {
		this.setState({value: event.target.value})
	}

	/*
	 * RENDER *****************************************************************
	 */

	/*
	 * executes each styler passed in props and merges the resulting objects
	 */

	getStyles = () => {
		return fieldUtils.getStyles(
			this.props.stylers,
			this.props.config, 
			this.props.object
		)
	}

	handleOpen = (e) => {
		this.setState({open: true})
	}

	renderMenu = () => {
		const config = this.props.config
		if (!this.state.open) return null
		return <SearchDropdown {...this.props}
			commit = {this.props.commit}
			blurSelf = {this.handleBlur}/>
	}

	/*
	 * main render method...
	 */

	render = () => {
		
		return <span className= "table-cell table-cell-selected" style={this.props.style}>
			<span style={this.getStyles()} className="table-cell-inner table-cell-inner-selected"
			onClick={this.handleOpen}>
				
					{this.props.format(this.props.value, this.props.config)}
					
					<div className="dropdown-border"/>
					<div className="icon icon-chevron-down dropdown-chevron"
						style={{lineHeight: `${this.props.rowHeight}px`}}/>

			</span>
			{this.renderMenu()}
		</span>
	}

}