import React, { Component, PropTypes } from 'react'
import util from "../../../util/util"
import constants from "../../../constants/MetasheetConstants"
import fieldUtils from "../fieldUtils"

import FocusStore from "../../../stores/FocusStore"
import modelActionCreators from "../../../actions/modelActionCreators"

export default class GenericTextElement extends Component {

	/*
	 * LIFECYCLE **************************************************************
	 */

	static propTypes = {
		
		/*
		 * informs the top level view element when the element exits edit mode
		 */
		// _handleBlur: PropTypes.func,

		/*
		 * prepares the content for rendering
		 */
		formatter: PropTypes.func.isRequired,
		
		/*
		 * ensures that the content is valid before commit to the server 
		 */
		serializer: PropTypes.func.isRequired,

		/*
		 * takes serialized input and converts to an internal representation 
		 */
		parser: PropTypes.func.isRequired,

		/*
		 * a list of functions that return style objects
		 */
		stylers: PropTypes.arrayOf(React.PropTypes.func),

		/*
		 * an optional element to be displayed within the cell
		 */
		decorator: PropTypes.element

	}

	constructor (props) {
		super(props)
		const config = this.props.config
		this.state = {
			editing: false, 
			value: this.props.formatter(props.value, config)
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
		this.setState({value: props.formatter(props.value, config)})
	}

	/*
	 * a bit of a hack to move the cursor to the end of the input on focus
	 */

	componentDidUpdate = (prevProps, prevState)  => {
		if (this.state.editing && !prevState.editing) {
			var val = this.refs.input.value
			this.refs.input.value = ''
			this.refs.input.value = val
		}
	}
	

	/*
	 * HANDLERS ***************************************************************
	 */

	/*
	 * takes the cell into edit mode
	 */

	handleEdit = (clobber) => {
		// if the key typed is a number/letter etc., clobber any existing input
		if (clobber === true)
			this.setState({value: '', editing: true})

		else this.setState({editing: true})
	}

	/*
	 * escapes out of edit mode and either commits the state value or
	 * reverts to the prop value
	 * uses the supplied commit method to persist to server (only if changed)
	 */
	
	handleBlur = (revert) => {
		const config = this.props.config
		const hasChanged = this.state.value !== this.props.value
		const parsedValue = this.props.parser(this.state.value, config)

		if (revert !== true && (this.state.editing || this.props.alwaysEdit) && hasChanged) {
			this.props.commit(parsedValue)
			this.setState({editing: false, open: false})
		} else {
			this.setState({
				editing: false,
				open: false,
				value: this.props.formatter(this.props.value, config)
			})
		}
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

	getDetailStyle = () => {
		var config = this.props.config
		if (config.align === 'right') return {left: 0, width: '24px'}
		else return {right: 0, width: '24px'}
	}

	render = () => {
		// const prettyValue = this.props.format(this.state.value, this.props.config)
		// var showIcon = this.detailIcon && this.props.selected && !this.state.editing
		
		return <span className= "table-cell table-cell-selected" style={this.props.style}>
			
			{this.props.decorator}

			{this.props.alwaysEdit || this.state.editing ?
			<input
				style={this.getStyles()}
				ref = "input"
				className = "input-editor"
				value = {this.state.value}
				autoFocus = {!this.props.noAutoFocus}
				onClick = {util.clickTrap}
				onChange = {this.handleChange} />
			:
			<span style={this.getStyles()} 
				className="table-cell-inner table-cell-inner-selected">
				{this.state.value}
			</span>
			}
		
		{this.state.open ?
			React.createElement(detail, Object.assign({value: this.state.value, _revert: this.revert}, this.props) )
			: null
		}
		</span>
	}
}