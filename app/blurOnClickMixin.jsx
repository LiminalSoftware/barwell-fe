import React from "react"
import _ from "underscore"

import constant from './constants/MetasheetConstants'

var blurOnClickMixin = {

  componentDidMount: function () {
    document.addEventListener('keyup', this.handleKeyPress)
    document.addEventListener('click', this.handleClick)
  },

  handleBlurKeyPress: function (event) {
    if (event.keyCode === constant.keycodes.ESC) this.handleBlur()
  },

  handleBlurClick: function (event) {
    this.handleBlur()
  },

  componentDidUnmount: function () {
    document.removeEventListener('keyup', this.handleKeyPress)
    document.removeEventListener('click', this.handleClick)
  }

}

export default blurOnClickMixin
