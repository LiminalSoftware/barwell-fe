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
		_handleBlur: PropTypes.func,

		/*
		 * prepares the content for rendering
		 */
		format: PropTypes.func.isRequired,
		
		/*
		 * ensures that the content is valid before commit to the server 
		 */
		validator: PropTypes.func.isRequired,

		/*
		 * takes serialized input and converts to an internal representation 
		 */
		parser: PropTypes.func.isRequired,

		/*
		 * a list of functions that return style objects
		 */
		stylers: PropTypes.arrayOf(React.PropTypes.func)

	}

	constructor (props) {
		super(props)
		const config = this.props.config
		this.state = {
			editing: false, 
			value: this.props.format(props.value, config)
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
		this.setState({value: props.format(props.value, config)})
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
	 */
	
	handleBlur = (revert) => {
		const config = this.props.config
		const hasChanged = this.state.value !== this.props.value
		const parsedValue = this.props.parser(this.state.value, config)

		if (revert !== true && this.state.editing && hasChanged)
			this.props.commit(parsedValue)
		
		this.setState({
			editing: false,
			open: false,
			value: this.props.format(revert !== true ? 
				this.state.value : 
				this.props.value
				, config)
		})
	}

	/*
	 * updates internal value state in response to an input event
	 */

	handleChange = (event) => {
		this.setState({value: event.target.value})
	}

	/*
	 * use the supplied commit method to persist to server (only if changed)
	 */

	// commitChanges = () => {
	// 	if (this.state.editing && this.state.value !== this.props.value)
	// 		this.props.commit(this.state.value)
	// }

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

	render = () => {
		var config = this.props.config
		var isNull = this.props.isNull
		var prettyValue = this.props.format(this.state.value, config)
		var showIcon = this.detailIcon && this.props.selected && !this.state.editing
		var obj = this.props.object
		
		return <span className= "table-cell table-cell-selected" style={this.props.style}>
			{this.props.alwaysEdit || this.state.editing ?
			<input
				ref = "input"
				className = "input-editor"
				value = {this.state.value}
				style = {this.getStyles()}
				autoFocus = {!this.props.noAutoFocus}
				onClick = {util.clickTrap}
				onChange = {this.handleChange} />
			:
			<span style={this.getStyles()} className="table-cell-inner table-cell-inner-selected">
				{prettyValue}
			</span>
			}
		{showIcon ?
			<span
			style = {editorIconStyle}
			className = {"editor-icon icon " + this.detailIcon}
			onClick = {this.handleDetail}/>
			: null
		}
		{this.state.open ?
			React.createElement(detail, Object.assign({value: this.state.value, _revert: this.revert}, this.props) )
			: null
		}
		</span>
	}
}