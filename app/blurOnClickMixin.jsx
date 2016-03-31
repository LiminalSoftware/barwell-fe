import React from "react"
import _ from "underscore"
import util from "./util/util"

import constant from './constants/MetasheetConstants'
import modelActionCreators from "./actions/modelActionCreators.jsx"

var BlurOnClickMixin = {

  handleBlur: function () {
    this.setState({
      open: false,
      editing: false,
      context: false
    });
  },

  handleOpen: function (e) {
    // this.clickTrap();
    if (this.props._blurSiblings) this.props._blurSiblings();
    this.setState({open: true})
    modelActionCreators.setFocus('view-config')
    
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

  clickTrap: function (e) {
    e.stopPropagation()
    e.nativeEvent.stopImmediatePropagation();
    // if (this.blurChildren) this.blurChildren();
    // if (this.props._blurSiblings) this.props._blurSiblings();
  }

}

export default BlurOnClickMixin
