import React from "react"
import _ from "underscore"

var selectableMixin = {
  toggleSelect: function (selected) {
    this.setState({selected: selected})
  }
}

export default selectableMixin
