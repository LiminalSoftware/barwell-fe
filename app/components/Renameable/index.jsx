import React, { Component, PropTypes } from 'react'
import ReactDOM from "react-dom"

import _ from "underscore"
import util from "../../util/util"
import {keycodes} from "../../constants/MetasheetConstants"

import styles from "./styles.less"

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
		removeEventListener('mousedown', this.handleClick)
  }

  componentDidUpdate = (prevProps, prevState) => {

		if (!prevState.editing && this.state.editing) {
			addEventListener('keydown', this.handleKeyPress)
			addEventListener('mousedown', this.handleClick)
		}

		if (prevState.editing && !this.state.editing) {
			removeEventListener('keydown', this.handleKeyPress)
			removeEventListener('mousedown', this.handleClick)
		}
	}

  componentWillReceiveProps = ({value: newValue}) => {
    const {editing} = this.state
    if (!editing) this.setState({value: newValue})
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
    const {commit} = this.props
    const {value} = this.state

    commit(value)
    this.setState({editing: false})
  }

  handleKeyPress = (e) => {
		if (e.keyCode === keycodes.ESC)
			this.handleBlur(e)
		if (e.keyCode === keycodes.ENTER)
			this.handleBlur(e)
	}

  handleClick = (e) => {
    var el = ReactDOM.findDOMNode(this)
		if (!util.isDescendant(el, e.target)) this.handleBlur(e)
  }

  handleBlur = (e) => {
		if (e.keyCode === keycodes.ESC) this.setState({
        value: this.props.value,
        editing: false
    })
    else {
      this.handleCommit()
    }
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
