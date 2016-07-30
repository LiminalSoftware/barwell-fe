import React, { Component, PropTypes } from 'react';
import util from "../../../util/util"
import constant from "../../../constants/MetasheetConstants"
import modelActionCreators from "../../../actions/modelActionCreators"
import fieldUtils from "../fieldUtils"

export default class GenericTextField extends Component {

	/*
	 * LIFECYCLE **************************************************************
	 */

	static propTypes = {
		// informs the top level view element when the element exits edit mode
		_handleBlur: PropTypes.func,
		// a list of functions that return style objects
		stylers: PropTypes.arrayOf(React.PropTypes.func)
	}

	constructor (props) {
		super(props)
		this.state = {
			editing: false, 
			value: this.format(props.value)
		}
	}

	/*
	 * standard pure component
	 */

	shouldComponentUpdate (nextProps, nextState) {
		return nextProps !== this.props || nextState !== this.state
	}

	/*
	 * add/remove keyup listeners when entering/leaving edit mode
	 */

	copmonentWillUpdate (nextProps, nextState) {
		
		if (!this.state.editing && nextState.editing) {
			addEventListener('keyup', this.handleSpecialKeyPress)
		}
		else if (this.state.editing && !nextState.editing) {
			removeEventListener('keyup', this.handleSpecialKeyPress)
		}
	}

	/*
	 * update internal value state with the new value unless we're editing
	 */

	componentWillReceiveProps (props) {
		if (!this.state.editing)
			this.setState({value: this.format(props.value)})
	}

	/*
	 * a bit of a hack to move the cursor to the end of the input on focus
	 */

	componentDidUpdate (prevProps, prevState) {
		if (this.state.editing && !prevState.editing) {
			var val = this.refs.input.value
			this.refs.input.value = ''
			this.refs.input.value = val
		}
	}

	/*
	 * UTILITY ****************************************************************
	 */

	/*
	 * escapes out of edit mode and reverts to the previous value
	 */

	cancelChanges () {
		this.setState({value: this.props.value})
		this.revert()
	}

	/*
	 * escapes out of edit mode
	 */

	revert () {
		this.setState({
			editing: false,
			open: false
		})
		this.props._handleBlur()
	}

	/*
	 * takes serialized input and converts to an internal representation
	 */

	parser (value) {
		return this.props.parser.apply(arguments)
	}

	/*
	 * ensures that the content is valid before commit to the server
	 */

	validator () {
		return this.props.validator.apply(arguments)
	}

	/*
	 * prepares the content for rendering
	 */

	format () {
		return this.props.format.apply(arguments)
	}

	/*
	 * TEMPORARY *************************************************************
	 */

	commitValue (value, extras) {
		return fieldUtils.commitValue.bind(this)(value, extras)
	}

	commitChanges () {
		return fieldUtils.commitChanges.bind(this)()
	}

	/*
	 * HANDLERS ***************************************************************
	 */

	/*
	 * takes the cell into edit mode
	 */

	handleEdit (event) {
		const prettyValue = this.format ? 
			this.format(this.props.value) : 
			this.props.value
		const keyCode = event.keyCode
		
		// if the key typed is a number/letter etc. then clobber existing input
		// this should probably be expanded to include other keys
		if (keyCode >= 48 && keyCode <= 90)
			this.setState({value: ''})
		
		else
			this.setState({value: prettyValue})	

		this.setState({editing: true})
	}

	/*
	 * updates internal value state in response to an input event
	 */

	handleChange (event) {
		this.setState({value: event.target.value})
	}

	/*
	 * handles special keys used during input  
	 * this handler is only enabled during editing
	 */

	handleSpecialKeyPress (e) {
		if (e.keyCode === constant.keycodes.ESC) {
			this.cancelChanges()
		}
		else if (e.keyCode === constant.keycodes.ENTER) {
			this.commitChanges();
		}
		else if (e.keyCode === constant.keycodes.TAB) {
			this.commitChanges();
		}
	}

	/*
	 * RENDER *****************************************************************
	 */

	/*
	 * executes each styler passed in props and merges the resulting objects
	 */

	getStyles () {
		return fieldUtils.getStyles(
			this.props.stylers,
			this.props.config, 
			this.props.object
		)
	}

	render () {
		var config = this.props.config
		var isNull = this.props.isNull
		var prettyValue = isNull ? '' : this.format ? this.format(this.props.value) : this.props.value
		var showIcon = this.detailIcon && this.props.selected && !this.state.editing
		var obj = this.props.object
		
		return <span {...this.props} className = "table-cell-inner">
			{this.props.alwaysEdit || this.state.editing ?
			<input
				ref = "input"
				className = "input-editor"
				value = {this.state.value}
				style = {{textAlign: config.align}}
				autoFocus = {!this.props.noAutoFocus}
				onClick = {util.clickTrap}
				onBlur = {this.revert}
				onChange = {this.handleChange} />
			:
			<span style={this.getStyles()} className="table-cell-inner">
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