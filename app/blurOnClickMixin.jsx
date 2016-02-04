import React from "react"
import _ from "underscore"
import util from "./util/util"

import constant from './constants/MetasheetConstants'
import modelActionCreators from "./actions/modelActionCreators.jsx"

var blurOnClickMixin = {

  handleBlur: function () {
    this.setState({
      open: false,
      editing: false,
      context: false
    })
    modelActionCreators.setFocus('view')
    document.removeEventListener('keyup', this.handleKeyPress)
    document.removeEventListener('click', this.handleBlur)
  },

  handleOpen: function () {
    this.setState({open: true})
    modelActionCreators.setFocus('view-config')
    document.addEventListener('keyup', this.handleKeyPress)
    document.addEventListener('click', this.handleBlur)
  },

  componentWillUnmount: function () {
    document.removeEventListener('keyup', this.handleKeyPress)
    document.removeEventListener('click', this.handleBlur)
  },

  handleKeyPress: function (event) {
    if (event.keyCode === constant.keycodes.ESC) this.handleBlur()
  },

  clickTrap: util.clickTrap

}

export default blurOnClickMixin
