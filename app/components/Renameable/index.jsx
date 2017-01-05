import React, { Component, PropTypes } from 'react'
import ReactDOM from "react-dom"

import _ from "underscore"
import util from "../../util/util"
import constants from "../../constants/MetasheetConstants"


export default class Renameable extends Component {

  static propTypes = {

		/*
		 * initial value
		 */
    value: PropTypes.string,

    /*
     * any classes to append to the defaults
     */
    className: PropTypes.string,

		/*
		 * renders the contents of the actual menu
		 */
		commit: PropTypes.func.isRequired

	}

  constructor (props) {
		super(props)
		this.state = {
			value: props.value,
			editing: false,
		}
	}

  componentWillUnmount = () => {
		removeEventListener('keydown', this.handleKeyPress)
		removeEventListener('click', this.handleClick)
  }

  componentDidUpdate = (prevProps, prevState) => {

		if (!prevState.editing && this.state.editing) {
			addEventListener('keydown', this.handleKeyPress)
			addEventListener('click', this.handleClick)
		}

		if (prevState.editing && !this.state.editing) {
			removeEventListener('keydown', this.handleKeyPress)
			removeEventListener('click', this.handleClick)
		}
	}

  handleEdit = (e) => {
    console.log('handleEdit')
    this.setState({
      editing: true,
      value: this.props.value
    })
  }

  handleChange = (e) => {
    this.setState({
      value: e.target.value
    })
  }

  handleCommit = () => {
    this.props.commit(this.state.value)
  }

  handleKeyPress = (e) => {
		if (e.keyCode === constants.keycodes.ESC)
			this.handleBlurRenamer(e)
		if (e.keyCode === constants.keycodes.ENTER)
			this.handleBlurRenamer(e)
	}

  handleClick = (e) => {
    const renamer = ReactDOM.findDOMNode(this.refs.renamer)
    if (e.target !== renamer) handleBlur(e)
  }

  handleBlur = (e) => {
		if (e.keyCode === constants.keycodes.ESC) {
      this.setState({value: this.props.value})
    }
    else this.handleCommit()
	}

	render = () => {
    const {className=''} = this.props
    const {value, editing} = this.state
		if (editing) return <input value={value}
        className={className + ' renamer'}
        ref="renamer"
        onChange={this.handleChange}
				onMouseDown={util.clickTrap}
				onBlur={this.handleBlur}
        autofocus/>
    else return <span className={className}
        onDoubleClick = {this.handleEdit}>
        {value}
      </span>
	}
}
