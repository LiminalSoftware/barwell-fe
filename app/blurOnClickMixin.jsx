import React from "react"
import _ from "underscore"
import util from "./util/util"

import constant from './constants/MetasheetConstants'
import modelActionCreators from "./actions/modelActionCreators.jsx"

var BlurOnClickMixin = {

  handleBlur: function (e) {
    this.setState({
      open: false,
      editing: false,
      context: false
    })
  },

  handleOpen: function (e) {
    this.setState({open: true})
    modelActionCreators.setFocus('view-config')
    e.preventDefault()
  },

  componentWillUpdate: function (nextProps, nextState) {
    var state = this.state
    if ((nextState.editing || nextState.open || nextState.context) && !(state.editing || state.open || state.context)) {
      document.addEventListener('keyup', this.handleKeyPress)
      document.addEventListener('click', this.handleBlur)
    } else if (!(nextState.editing || nextState.open || nextState.context) && (state.editing || state.open || state.context)) {
      document.removeEventListener('keyup', this.handleKeyPress)
      document.removeEventListener('click', this.handleBlur)
    }
  },

  handleContext: function (e) {
    this.setState({context: true})
    modelActionCreators.setFocus('view-config')
    e.preventDefault()
  },

  componentWillUnmount: function () {
    document.removeEventListener('keyup', this.handleKeyPress)
    document.removeEventListener('click', this.handleBlur)
  },

  handleKeyPress: function (e) {
    if (e.keyCode === constant.keycodes.ESC) this.handleBlur()
    if (e.keyCode === constant.keycodes.ENTER && this.handleCommit) this.handleCommit()
  },

  clickTrap: util.clickTrap

}

export default BlurOnClickMixin
