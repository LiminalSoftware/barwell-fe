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

var PrimaryKeyElement = React.createClass({
	render: function () {
		var value = this.props.value
		var style = this.props.style

		return <span style={style} className="table-cell uneditable">
			{this.props.value}
		</span>
	}
})

var PrimaryKeyField = {
	element: PrimaryKeyElement,
	uneditable: true
}

export default PrimaryKeyField
