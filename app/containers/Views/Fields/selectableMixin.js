import React from "react"
import _ from "underscore"

var selectableMixin = {
  getInitialState: function () {
    return {selected: false}
  },
  toggleSelect: function (selected) {
  	if(this.isMounted()) this.setState({selected: selected})
  }
}

export default selectableMixin
