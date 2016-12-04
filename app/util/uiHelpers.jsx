import ReactDOM from "react-dom"
import util from "./util"
import constants from '../constants/MetasheetConstants'

const isOpen = function (state) {
  return !!state.open || !!state.editing || !!state.context
} 

const blurListeners = function (nextProps, nextState) {
	var willBeOpen = isOpen(nextState)
	var wasOpen = isOpen(this.state)

	if (!wasOpen && willBeOpen) 
	this.addListeners()

	else if (wasOpen && !willBeOpen)
	this.removeListeners()
}

const addListeners = function () {
	document.addEventListener('keyup', this.handleKeyPress)
	document.addEventListener('mousedown', this.handleClick)
}

const removeListeners = function () {
	document.removeEventListener('keyup', this.handleKeyPress)
	document.removeEventListener('mousedown', this.handleClick)
}

const handleClick = function (e) {
	var el = ReactDOM.findDOMNode(this)
	if (!util.isDescendant(e.target, el)) this.handleBlur()
}

const handleBlur = function (e) {
	if (this.handleCommit) this.handleCommit()
	else this.setState({
		open: false,
		editing: false,
		context: false
	})
}

const handleBlurKeyPress = function (e) {
	if (e.keyCode === constants.keycodes.ESC)
		this.handleBlur()
	if (e.keyCode === constants.keycodes.ENTER && this.handleCommit) 
		this.handleCommit()
}

export {blurListeners, handleClick, addListeners, removeListeners, handleBlur, handleBlurKeyPress}