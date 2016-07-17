import React from "react"
import _ from "underscore"
import util from "./util/util"

import constant from './constants/MetasheetConstants'
import modelActionCreators from "./actions/modelActionCreators.jsx"

var isOpen = function (state) {
  return !!state.open || !!state.editing || !!state.context
} 

var BlurOnClickMixin = {

  // LIFECYCLE ==============================================================

  componentWillMount: function () {
    if (this.props.open) {
      this.setState({open: true})
    }
  },

  componentDidMount: function () {
    if (this.state.open) {
      this.addListeners()
    }
  },

  componentWillUpdate: function (nextProps, nextState) {
    var willBeOpen = isOpen(nextState)
    var wasOpen = isOpen(this.state)

    if (!wasOpen && willBeOpen) 
      this.addListeners()
      
    else if (wasOpen && !willBeOpen)
      this.removeListeners()
    
  },

  componentWillUnmount: function () {
    if (isOpen(this.state))
      this.removeListeners()
  },

  // UTILITY ================================================================

  addListeners: function () {
    // console.log('addListeners')
    document.addEventListener('keyup', this.handleKeyPress)
    document.addEventListener('click', this.handleOutsideClick)
  },

  removeListeners: function () {
    // console.log('removeListeners')
    document.removeEventListener('keyup', this.handleKeyPress)
    document.removeEventListener('click ', this.handleOutsideClick)
  },

  // HANDLERS ================================================================

  handleContext: function (e) {
    this.setState({context: true})
    modelActionCreators.setFocus('view-config')
    e.preventDefault()
  },

  handleBlur: function () {
    if (this.props.isPopUp) 
      this.props._clearPopUp()
    else this.setState({
        open: false,
        editing: false,
        context: false
      });
  },

  handleOpen: function (e) {
    util.clickTrap(e)
    if (this.props._blurSiblings) this.props._blurSiblings();
    if (this.blurChildren) this.blurChildren();

    this.setState({open: true, context: false})

    modelActionCreators.setFocus('view-config')
  },

  handleOutsideClick: function (e) {
    this.handleBlur()
  },

  handleKeyPress: function (e) {
    if (e.keyCode === constant.keycodes.ESC) this.handleBlur()
    if (e.keyCode === constant.keycodes.ENTER && this.handleCommit) this.handleCommit()
  }

}

export default BlurOnClickMixin
