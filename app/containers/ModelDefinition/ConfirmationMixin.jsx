import React from "react"

var ConfirmationMixin = {

  getInitialState: function () {
		return {editing: false}
	},

  handleEdit: function () {
		this.setState({editing: true})
	},

	handleRevertEdit: function () {
		this.setState({editing: false})
	},

  getConfirmationButtons: function () {
    if (this.state.committing) return <ul className="light mb-buttons" key="confirmations">
      <li key='save-changes' className="hilight">
        <div className="three-quarters-loader"></div>Saving ...
      </li>
    </ul>;
    else if (this.state.editing ) return <ul className="light mb-buttons" key="confirmations">
      <li onClick={this.cancelChanges}>
        Cancel
      </li>
      <li onClick={this.commitChanges} key='save-changes'>
        Save changes
      </li>
    </ul>
  }

}

export default ConfirmationMixin
