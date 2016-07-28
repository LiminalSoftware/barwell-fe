import React from "react"

var keyPressMixin = {
	componentWillUpdate: function (nextProps, nextState) {
		var state = this.state
		if (!state.editing && nextState.editing && this.handleKeyPress) {
			addEventListener('keyup', this.handleKeyPress)
		}
		if (state.editing && !nextState.editing && this.handleKeyPress) {
			removeEventListener('keyup', this.handleKeyPress)
		}
	}
}

export default keyPressMixin;
