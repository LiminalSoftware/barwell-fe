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

  componentWillUpdate: function (nextProps, nextState) {
    var willBeOpen = isOpen(nextState)
    var wasOpen = isOpen(this.state)

    if (!wasOpen && willBeOpen) 
      this.addListeners()
      
    else if (wasOpen && !willBeOpen)
      this.removeListeners()
  },

  componentWillUnmount: function () {
    var wasOpen = isOpen(this.state)
    if (wasOpen) this.removeListeners()
  },

  // UTILITY ================================================================
  
  addListeners: function () {
    document.addEventListener('keyup', this.handleKeyPress)
    document.addEventListener('mousedown', this.handleOutsideClick)
  },

  removeListeners: function () {
    document.removeEventListener('keyup', this.handleKeyPress)
    document.removeEventListener('mousedown', this.handleOutsideClick)
  },

  // HANDLERS ================================================================

  handleBlur: function () {
    console.log('blur')
    this.setState({
      open: false,
      editing: false,
      context: false
    });
  },

  handleOutsideClick: function () {
    this.handleBlur()
  },

  handleOpen: function (e) {
    this.setState({open: true})
    modelActionCreators.setFocus('view-config')
  },

  handleKeyPress: function (e) {
    if (e.keyCode === constant.keycodes.ESC) this.handleBlur()
    if (e.keyCode === constant.keycodes.ENTER && this.handleCommit) this.handleCommit()
  }

}

export default BlurOnClickMixin
