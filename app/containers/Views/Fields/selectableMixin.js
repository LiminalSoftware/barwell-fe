import React from "react"
import _ from "underscore"

var selectableMixin = {
  toggleSelect: function (selected) {
    console.log('selected: ' + selected + '; id: ' + this.props.cellKey )
    this.setState({selected: selected})
  }
}

export default selectableMixin
