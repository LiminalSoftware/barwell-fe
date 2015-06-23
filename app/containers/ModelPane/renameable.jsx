import modelActionCreators from '../../actions/modelActionCreators'
import constants from '../../constants/MetasheetConstants'
import _ from 'underscore'
import React from "react"

// things the element must define:
// @name: name of the attribute that is edited
// @subject: type of object that is being edited (passed to modelActionCreator.create() )
// refs.renamer: reference to the input object

var renameable = {
	componentWillUnmount: function () {
		document.removeEventListener('keyup', this.handleKeyPress)
	},

	getInitialState: function () {
		var obj = this.props[this.subject];
		return {
			renaming: false,
			_name: obj[this.name]
		};
	},
	
	commitChanges: function () {
		var obj = _.clone(this.props[this.subject]);
		obj[this.name] = this.state._name
		modelActionCreators.create(this.subject, false, obj)
		this.revert()
	},
	
	cancelChanges: function () {
		this.revert()
	},
	
	handleEdit: function () {
		var obj = this.props[this.subject];
		if (this.state.renaming) return
		this.setState({
			renaming: true,
			_name: obj[this.name]
		}, function () {
			React.findDOMNode(this.refs.renamer).value = this.state._name;
			React.findDOMNode(this.refs.renamer).focus();
		})
		document.addEventListener('keyup', this.handleKeyPress)
	},
	
	revert: function () {
		var obj = this.props[this.subject];
		document.removeEventListener('keyup', this.handleKeyPress)
		this.setState({
			renaming: false,
			_name: obj[this.name]
		})
	},

	handleKeyPress: function (event) {
		if (event.keyCode === 27) this.cancelChanges()
		if (event.keyCode === 13) this.commitChanges()
	},

	handleNameUpdate: function (event) {
		this.setState({_name: event.target.value})
	}
}

export default renameable;