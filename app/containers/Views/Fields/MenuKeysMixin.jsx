import React from "react"
import _ from "underscore"

import constant from "../../../constants/MetasheetConstants"

import modelActionCreators from "../../../actions/modelActionCreators"

var MenuKeysMixin = {

	handleKeyPress: function (e) {
		if (e.keyCode === constant.keycodes.ESC) this.props._revert()
		if (e.keyCode === constant.keycodes.ENTER) {
			this.chooseSelection(e)
		}
		if (e.keyCode === constant.keycodes.TAB) {
			this.chooseSelection(e)
		}
		if (e.keyCode === constant.keycodes.ARROW_UP || 
			e.keyCode === constant.keycodes.ARROW_DOWN) {
			var increment = (e.keyCode === constant.keycodes.ARROW_DOWN ? 1 : -1) * (this.shouldOpenDown() ? 1 : -1)
			this.setState({selection: 
				Math.max(Math.min(this.state.selection + increment, this.getNumberOptions() - 1), -1)
			})
			e.preventDefault()
		}
	},

	componentWillMount: function () {
		addEventListener('keyup', this.handleKeyPress)
	},

	componentWillUnmount: function () {
		removeEventListener('keyup', this.handleKeyPress)
	}

}

export default MenuKeysMixin


