import React from "react"
import _ from "underscore"
import $ from "jquery"
import moment from "moment"

import AttributeStore from "../../../stores/AttributeStore"
import ModelStore from "../../../stores/ModelStore"

import constant from "../../../constants/MetasheetConstants"
import modelActionCreators from "../../../actions/modelActionCreators"

import commitMixin from './commitMixin'
import editableInputMixin from './editableInputMixin'

var CheckboxElement = React.createClass({
	
	mixins: [commitMixin],

	revert: _.noop,

	handleEdit: function () {
		this.toggle()
		this.props.handleBlur()
	},

	validator: function (input) {
		return (!!input)
	},

	handleClick: function (event) {
		this.toggle()
		event.preventDefault()
	},

	toggle: function () {
		this.setState({value: !this.state.value})
		this.commitChanges()
	},

	render: function () {
		var value = this.props.value
		var style = this.props.style
		
		return <td style={style} className="checkbox">
			<input type="checkbox" checked={value} onChange={this.handleClick}></input>
		</td>
	}
});

var booleanField = {
	element: CheckboxElement,
	uneditable: true
}

export default booleanField